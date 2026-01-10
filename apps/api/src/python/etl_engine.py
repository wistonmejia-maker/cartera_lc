import pandas as pd
import re
import sys
import json
import os

# Configurar encoding para stdout
sys.stdout.reconfigure(encoding='utf-8')

def parsear_monto(valor):
    """Extrae valor numérico de cualquier formato"""
    if pd.isna(valor):
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    # Convertir a string y limpiar
    text = str(valor).replace('$', '').replace(' ', '').strip()
    # Separadores: eliminar comas y puntos de miles, asumir que no hay decimales si es formato colombiano estándar
    # O mejor, usar expresión regular para extraer números
    text = text.replace(',', '').replace('.', '')
    try:
        return float(text)
    except:
        return 0.0

def analizar_reporte(file_path):
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    try:
        # Intentar leer con engine por defecto o xlrd dependiendo de la extensión
        if file_path.endswith('.xls'):
            df = pd.read_excel(file_path, sheet_name=0, engine='xlrd') # xls antiguo
        else:
            df = pd.read_excel(file_path, sheet_name=0)
    except Exception as e:
        return {"error": str(e)}

    unidades = []

    for idx, row in df.iterrows():
        # Convertir fila a string
        row_values = [str(x) for x in row.values if pd.notna(x)]
        row_str = ' '.join(row_values)
        
        # Detectar inicio de unidad
        match_local = re.search(r'(LOCAL|OF):\s*([A-Z0-9]+)', row_str)
        if not match_local:
            continue
        
        local_ofi = match_local.group(2)
        
        # Extraer propietario
        propietario = "N/D"
        if idx + 1 < len(df):
            next_row = df.iloc[idx + 1]
            next_str = ' '.join([str(x) for x in next_row.values if pd.notna(x)])
            prop_match = re.search(r'Copropietario:\s*(.+?)(?:Fecha:|$)', next_str)
            if prop_match:
                propietario = prop_match.group(1).strip()
        
        # Variables
        saldo_anterior = 0.0
        cuota_actual = 0.0
        intereses_mora = 0.0
        otros = 0.0
        total_a_pagar = 0.0
        
        # Buscar valores
        for i in range(idx + 1, min(idx + 35, len(df))):
            fila = df.iloc[i]
            fila_values = list(fila.values)
            fila_str = ' '.join([str(x) for x in fila_values if pd.notna(x)])
            
            if i > idx + 3 and ('LOCAL:' in fila_str or 'OF:' in fila_str):
                break
            
            # SALDO ANTERIOR
            if 'Saldo anterior' in fila_str or 'Saldo  anterior' in fila_str:
                for val in fila_values:
                    if isinstance(val, (int, float)) and val > 0:
                        saldo_anterior = val
                        break
            
            # OTROS / RECIBOS DE CAJA
            if 'Recibos de caja' in fila_str or 'Rec.de Caja' in fila_str:
                for val in fila_values:
                    if isinstance(val, (int, float)) and val < 0:
                        otros += val
            
            # INTERESES
            if 'Intereses por mora' in fila_str or 'Inter.xMora' in fila_str:
                for val in fila_values:
                    if isinstance(val, (int, float)) and 0 < val < 100000:
                        intereses_mora += val
                        break
            
            # CUOTA ACTUAL
            if 'Cuota administracion' in fila_str or 'Cuota administración' in fila_str:
                for val in fila_values:
                    if isinstance(val, (int, float)) and val > 100000:
                        cuota_actual = val
                        break
            
            # TOTAL A PAGAR
            if 'Total a pagar' in fila_str or 'Total  a  pagar' in fila_str:
                valores_numericos = [v for v in fila_values if isinstance(v, (int, float)) and not pd.isna(v) and v > 0]
                if valores_numericos:
                    total_a_pagar = valores_numericos[-1]
                break
        
        # Cálculos de Negocio
        deuda_vencida = total_a_pagar - cuota_actual
        if deuda_vencida <= 0: deuda_vencida = 0.0
        
        edad_vencida = 0.00
        if cuota_actual > 0:
            edad_vencida = round(deuda_vencida / cuota_actual, 2)
        
        # Clasificación
        if edad_vencida <= 0:
            tipo_carta = 'AD'
            estado_real = 'AL_DIA'
        elif 0 < edad_vencida <= 1:
            tipo_carta = 'CS'
            estado_real = 'MORA_BAJA'
        elif 1 < edad_vencida <= 2:
            tipo_carta = 'CP'
            estado_real = 'MORA_MODERADA'
        elif 2 < edad_vencida < 6:
            tipo_carta = 'AB'
            estado_real = 'RIESGO_ALTO'
        else:
            tipo_carta = 'AB'
            estado_real = 'CRITICO'

        unidades.append({
            'unit_number': local_ofi,
            'owner_name': propietario,
            'financials': {
                'prev_balance': saldo_anterior,
                'current_fee': cuota_actual,
                'interest': intereses_mora,
                'adjustments': otros,
                'total_debt': total_a_pagar
            },
            'analysis': {
                'overdue_amount': deuda_vencida,
                'months_overdue': edad_vencida,
                'risk_status': estado_real,
                'action_class': tipo_carta
            }
        })
    
    return unidades

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input file provided"}))
        sys.exit(1)
        
    input_file = sys.argv[1]
    results = analizar_reporte(input_file)
    print(json.dumps(results, indent=2))
