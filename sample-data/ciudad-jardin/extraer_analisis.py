import pandas as pd
import re
from decimal import Decimal

# Leer el archivo
file_path = r'c:\Users\ATC\Documents\Proyectos ATC\cartera-lc\sample-data\ciudad-jardin\reportes-cartera\FACT ENE-26.xls'
df = pd.read_excel(file_path, sheet_name=0)

def parsear_monto(texto):
    """Convierte texto a número, manejando formatos colombianos"""
    if pd.isna(texto):
        return 0.0
    if isinstance(texto, (int, float)):
        return float(texto)
    # Remover signos de moneda y puntos de miles
    texto = str(texto).replace('$', '').replace(',', '').strip()
    try:
        return float(texto)
    except:
        return 0.0

# Extraer datos de cada unidad
unidades = []

for idx, row in df.iterrows():
    row_str = ' '.join([str(x) for x in row.values if pd.notna(x)])
    
    # Detectar inicio de unidad
    if 'LOCAL:' in row_str or 'OF:' in row_str:
        local_match = re.search(r'(LOCAL|OF):\s*([A-Z0-9]+)', row_str)
        if not local_match:
            continue
            
        local_ofi = local_match.group(2)
        
        # Buscar propietario (siguiente fila)
        propietario = "N/D"
        if idx + 1 < len(df):
            next_row_str = ' '.join([str(x) for x in df.iloc[idx + 1].values if pd.notna(x)])
            prop_match = re.search(r'Copropietario:\s*(.+?)(?:Fecha:|$)', next_row_str)
            if prop_match:
                propietario = prop_match.group(1).strip()
        
        # Buscar valores en las siguientes filas
        saldo_anterior = 0.0
        cuota_actual = 0.0
        intereses_mora = 0.0
        otros = 0.0  # Recibos de caja (negativos)
        total_a_pagar = 0.0
        
        # Escanear las siguientes 25 filas para encontrar los valores
        for i in range(idx, min(idx + 30, len(df))):
            fila_str = ' '.join([str(x) for x in df.iloc[i].values if pd.notna(x)])
            
            # Saldo anterior
            if 'Saldo  anterior' in fila_str or 'Saldo anterior' in fila_str:
                saldo_match = re.search(r'(?:Saldo\s+anterior|Saldo\s\santerior)\s+([\d.,-]+)', fila_str)
                if saldo_match:
                    saldo_anterior = parsear_monto(saldo_match.group(1))
            
            # Recibos de caja (abonos)
            if 'Recibos de caja' in fila_str:
                valores = re.findall(r'(-?[\d.]+(?:,\d+)?)', fila_str)
                for val in valores:
                    num = parsear_monto(val)
                    if num < 0:  # Los recibos son negativos
                        otros += num
            
            # Intereses de mora
            if 'Intereses por mora' in fila_str or 'Inter.xMora' in fila_str:
                valores = re.findall(r'(\d+\.?\d*)', fila_str)
                for val in valores:
                    num = parsear_monto(val)
                    if 100 < num < 1000000:  # Rango razonable para intereses
                        intereses_mora += num
                        break
            
            # Cuota administración
            if 'Cuota administracion' in fila_str or 'Cuota administración' in fila_str:
                valores = re.findall(r'(\d+\.?\d*)', fila_str)
                for val in valores:
                    num = parsear_monto(val)
                    if num > 100000:  # Rango razonable para cuota
                        cuota_actual = num
                        break
            
            # Total a pagar
            if 'Total a pagar' in fila_str or 'Total  a  pagar' in fila_str:
                total_match = re.search(r'(?:Total\s+a\s+pagar|Total\s\sa\s\spagar)\s+([\d.,-]+)', fila_str)
                if total_match:
                    total_a_pagar = parsear_monto(total_match.group(1))
                break  # Terminar al encontrar el total
        
        # CÁLCULOS DE ANÁLISIS DE RIESGO
        # A. Deuda Vencida
        deuda_vencida = max(0, total_a_pagar - cuota_actual)
        
        # B. Edad Vencida (en meses)
        edad_vencida = round(deuda_vencida / cuota_actual, 2) if cuota_actual > 0 else 0
        
        # C. Tipo de Carta
        if edad_vencida <= 0:
            tipo_carta = 'AD'
        elif edad_vencida <= 1:
            tipo_carta = 'CS'
        elif edad_vencida <= 2:
            tipo_carta = 'CP'
        else:
            tipo_carta = 'AB'
        
        # D. Estado Real
        if edad_vencida <= 0:
            estado_real = '🟢 Al Día'
        elif edad_vencida < 1:
            estado_real = '🟡 Mora Baja/Técnica'
        elif edad_vencida < 3:
            estado_real = '🟡 Mora Moderada'
        elif edad_vencida < 6:
            estado_real = '🟠 Riesgo Alto'
        else:
            estado_real = '🔴 Crítico'
        
        unidades.append({
            'LOCAL/OFI': local_ofi,
            'PROPIETARIO': propietario,
            'SALDO_ANTERIOR': saldo_anterior,
            'CUOTA_ACTUAL': cuota_actual,
            'INTERESES_MORA': intereses_mora,
            'OTROS': otros,
           'TOTAL_A_PAGAR': total_a_pagar,
            'EDAD_VENCIDA': edad_vencida,
            'ESTADO_REAL': estado_real,
            'TIPO_CARTA': tipo_carta
        })

# Crear DataFrame
df_analisis = pd.DataFrame(unidades)

# Formatear columnas de moneda
def formato_moneda(x):
    return f"${x:,.0f}".replace(",", ".")

print("="*120)
print("TABLA MAESTRA DE ANÁLISIS DE RIESGO - CIUDAD JARDÍN")
print("Mes: Enero 2026")
print("="*120)
print()

# Mostrar tabla
print(df_analisis.to_string(index=False))

# Guardar CSV
output_csv = r'c:\Users\ATC\Documents\Proyectos ATC\cartera-lc\sample-data\ciudad-jardin\analisis_enero_2026.csv'
df_analisis.to_csv(output_csv, index=False,encoding='utf-8-sig')
print(f"\n\n✅ Archivo guardado: analisis_enero_2026.csv")

# RESUMEN KPIs
print("\n" + "="*120)
print("RESUMEN DE CARTERA")
print("="*120)
print(f"\nTotal Unidades: {len(df_analisis)}")
print(f"\nDistribución por Estado:")
print(df_analisis['ESTADO_REAL'].value_counts().to_string())
print(f"\nDistribución por Tipo de Carta:")
print(df_analisis['TIPO_CARTA'].value_counts().to_string())
print(f"\nCartera Total: ${df_analisis['TOTAL_A_PAGAR'].sum():,.0f}".replace(",", "."))
print(f"Cartera Vencida: ${df_analisis[df_analisis['EDAD_VENCIDA'] > 0]['TOTAL_A_PAGAR'].sum():,.0f}".replace(",", "."))
