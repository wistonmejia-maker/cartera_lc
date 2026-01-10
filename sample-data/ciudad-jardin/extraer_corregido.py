import pandas as pd
import re

# Leer archivo Excel con análisis detallado de su estructura
file_path = r'reportes-cartera\FACT ENE-26.xls'
df = pd.read_excel(file_path, sheet_name=0)

# Función mejorada para parsear montos
def parsear_monto(valor):
    """Extrae valor numérico de cualquier formato"""
    if pd.isna(valor):
        return 0.0
    if isinstance(valor, (int, float)):
        return float(valor)
    # Convertir a string y limpiar
    texto = str(valor).replace('$', '').replace(' ', '').strip()
    # Remover separadores de miles y convertir
    texto = texto.replace(',', '').replace('.', '')
    try:
        # Los valores en el Excel parecen estar sin decimales
        return float(texto)
    except:
        return 0.0

# Extraer unidades con análisis detallado
unidades = []
print("Buscando unidades...")

for idx, row in df.iterrows():
    # Convertir fila a string
    row_values = [str(x) for x in row.values if pd.notna(x)]
    row_str = ' '.join(row_values)
    
    # Detectar inicio de unidad
    match_local = re.search(r'(LOCAL|OF):\s*([A-Z0-9]+)', row_str)
    if not match_local:
        continue
    
    local_ofi = match_local.group(2)
    print(f"\n--- Procesando {local_ofi} (fila {idx}) ---")
    
    # Extraer propietario
    propietario = "N/D"
    if idx + 1 < len(df):
        next_row = df.iloc[idx + 1]
        next_str = ' '.join([str(x) for x in next_row.values if pd.notna(x)])
        prop_match = re.search(r'Copropietario:\s*(.+?)(?:Fecha:|$)', next_str)
        if prop_match:
            propietario = prop_match.group(1).strip()
    
    # Variables para almacenar valores
    saldo_anterior = 0.0
    cuota_actual = 0.0
    intereses_mora = 0.0
    otros = 0.0
    total_a_pagar = 0.0
    
    # Buscar valores en las siguientes 30 filas
    for i in range(idx + 1, min(idx + 35, len(df))):
        fila = df.iloc[i]
        fila_values = list(fila.values)
        fila_str = ' '.join([str(x) for x in fila_values if pd.notna(x)])
        
        # Detectar siguiente unidad para terminar
        if i > idx + 3 and ('LOCAL:' in fila_str or 'OF:' in fila_str):
            break
        
        # SALDO ANTERIOR - buscar la fila que dice "Saldo anterior"
        if 'Saldo anterior' in fila_str or 'Saldo  anterior' in fila_str:
            # El valor está en las celdas de la fila
            for val in fila_values:
                if isinstance(val, (int, float)) and val > 0:
                    saldo_anterior = val
                    print(f"  Saldo anterior: {saldo_anterior}")
                    break
        
        # RECIBOS DE CAJA (OTROS - valores negativos)
        if 'Recibos de caja' in fila_str or 'Rec.de Caja' in fila_str:
            for val in fila_values:
                if isinstance(val, (int, float)) and val < 0:
                    otros += val
                    print(f"  Abono (otros): {val}")
        
        # INTERESES DE MORA
        if 'Intereses por mora' in fila_str or 'Inter.xMora' in fila_str:
            for val in fila_values:
                if isinstance(val, (int, float)) and 0 < val < 100000:
                    intereses_mora += val
                    print(f"  Intereses mora: {val}")
                    break
        
        # CUOTA ADMINISTRACIÓN
        if 'Cuota administracion' in fila_str or 'Cuota administración' in fila_str:
            for val in fila_values:
                if isinstance(val, (int, float)) and val > 100000:
                    cuota_actual = val
                    print(f"  Cuota actual: {cuota_actual}")
                    break
        
        # TOTAL A PAGAR - buscar fila "Total a pagar"
        if 'Total a pagar' in fila_str or 'Total  a  pagar' in fila_str:
            # Buscar el último valor numérico positivo en la fila
            valores_numericos = [v for v in fila_values if isinstance(v, (int, float)) and not pd.isna(v) and v > 0]
            if valores_numericos:
                total_a_pagar = valores_numericos[-1]  # Tomar el último valor
                print(f"  Total a pagar: {total_a_pagar}")
            # Terminar búsqueda al encontrar total
            break
    
    # CÁLCULOS siguiendo el prompt EXACTO
    # A. Deuda Vencida Neta
    deuda_vencida = total_a_pagar - cuota_actual
    if deuda_vencida <= 0:
        deuda_vencida = 0.0
    
    # B. Edad Vencida (Meses) - Redondear a 2 decimales
    if cuota_actual > 0:
        edad_vencida = round(deuda_vencida / cuota_actual, 2)
    else:
        edad_vencida = 0.00
    
    print(f"  Deuda vencida: {deuda_vencida}, Edad: {edad_vencida} meses")
    
    # C. Tipo de Carta (siguiendo reglas del prompt)
    if edad_vencida <= 0:
        tipo_carta = 'AD'
    elif 0 < edad_vencida <= 1:
        tipo_carta = 'CS'
    elif 1 < edad_vencida <= 2:
        tipo_carta = 'CP'
    else:
        tipo_carta = 'AB'
    
    # D. Estado Real
    if edad_vencida <= 0:
        estado_real = '🟢 Al Día'
    elif 0 < edad_vencida < 1:
        estado_real = '🟡 Mora Baja/Técnica'
    elif 1 <= edad_vencida < 3:
        estado_real = '🟡 Mora Moderada'
    elif 3 <= edad_vencida < 6:
        estado_real = '🟠 Riesgo Alto'
    else:
        estado_real = '🔴 Crítico'
    
    unidades.append({
        'LOCAL/OFI': local_ofi,
        'PROPIETARIO': propietario,
        'SALDO ANTERIOR': f"${saldo_anterior:,.0f}",
        'CUOTA ACTUAL': f"${cuota_actual:,.0f}",
        'INTERESES DE MORA': f"${intereses_mora:,.0f}",
        'OTROS': f"${otros:,.0f}",
        'TOTAL A PAGAR': f"${total_a_pagar:,.0f}",
        'EDAD VENCIDA': edad_vencida,
        'ESTADO REAL': estado_real,
        'TIPO DE CARTA': tipo_carta
    })

# Crear DataFrame
df_analisis = pd.DataFrame(unidades)

# Guardar en Markdown
output_md = 'ANALISIS_ENERO_2026_v2.md'
with open(output_md, 'w', encoding='utf-8') as f:
    f.write("# TABLA MAESTRA DE ANÁLISIS DE RIESGO\n\n")
    f.write("**Centro Comercial Ciudad Jardín**  \n")
    f.write("**NIT:** 800239591-0  \n") 
    f.write("**Periodo:** Enero 2026  \n\n")
    f.write("---\n\n")
    f.write(df_analisis.to_markdown(index=False))
    
    # KPIs
    f.write("\n\n---\n\n")
    f.write("## RESUMEN DE CARTERA\n\n")
    f.write(f"**Total Unidades:** {len(df_analisis)}\n\n")
    
    f.write("### Distribución por Tipo de Carta\n\n")
    tipo_dist = df_analisis['TIPO DE CARTA'].value_counts().sort_index()
    for tipo, count in tipo_dist.items():
        f.write(f"- **{tipo}:** {count} unidades\n")
    
    f.write("\n### Distribución por Estado Real\n\n")
    estado_dist = df_analisis['ESTADO REAL'].value_counts()
    for estado, count in estado_dist.items():
        f.write(f"- {estado}: {count} unidades\n")

print(f"\n\nArchivo generado: {output_md}")
print(f"Total unidades: {len(unidades)}")
