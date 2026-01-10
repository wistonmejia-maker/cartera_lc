import pandas as pd
import re

# SIGUIENDO EXACTAMENTE EL PROMPT COMPARTIDO

file_path = r'reportes-cartera\FACT ENE-26.xls'
df = pd.read_excel(file_path, sheet_name=0)

def parsear_monto(texto):
    """Convierte texto a número"""
    if pd.isna(texto):
        return 0.0
    if isinstance(texto, (int, float)):
        return float(texto)
    texto = str(texto).replace('$', '').replace(',', '').replace('.', '').strip()
    try:
        return float(texto)
    except:
        return 0.0

# EXTRACCIÓN DE DATOS (siguiendo Paso 1 del prompt)
unidades = []

for idx, row in df.iterrows():
    row_str = ' '.join([str(x) for x in row.values if pd.notna(x)])
    
    if 'LOCAL:' in row_str or 'OF:' in row_str:
        local_match = re.search(r'(LOCAL|OF):\s*([A-Z0-9]+)', row_str)
        if not local_match:
            continue
            
        local_ofi = local_match.group(2)
        
        # PROPIETARIO
        propietario = "N/D"
        if idx + 1 < len(df):
            next_row_str = ' '.join([str(x) for x in df.iloc[idx + 1].values if pd.notna(x)])
            prop_match = re.search(r'Copropietario:\s*(.+?)(?:Fecha:|$)', next_row_str)
            if prop_match:
                propietario = prop_match.group(1).strip()
        
        saldo_anterior = 0.0
        cuota_actual = 0.0
        intereses_mora = 0.0
        otros = 0.0
        total_a_pagar = 0.0
        
        # Buscar valores
        for i in range(idx, min(idx + 30, len(df))):
            fila_str = ' '.join([str(x) for x in df.iloc[i].values if pd.notna(x)])
            
            # SALDO ANTERIOR
            if 'Saldo anterior' in fila_str or 'Saldo  anterior' in fila_str:
                numeros = re.findall(r'(\d+)', fila_str)
                if numeros:
                    saldo_anterior = parsear_monto(numeros[-1])
            
            # OTROS (Recibos de caja - son abonos negativos)
            if 'Recibos de caja' in fila_str:
                valores_fila = list(df.iloc[i].values)
                for val in valores_fila:
                    if isinstance(val, (int, float)) and val < 0:
                        otros += val
            
            # INTERESES DE MORA
            if 'Intereses por mora' in fila_str or 'Inter.xMora' in fila_str:
                numeros = re.findall(r'(\d+)', fila_str)
                for num_str in numeros:
                    num = parsear_monto(num_str)
                    if 1000 < num < 100000:  # Rango razonable
                        intereses_mora = num
                        break
            
            # CUOTA ACTUAL (Cuota administración)
            if 'Cuota administracion' in fila_str or 'Cuota administración' in fila_str:
                numeros = re.findall(r'(\d+)', fila_str)
                for num_str in numeros:
                    num = parsear_monto(num_str)
                    if num > 500000:  # Rango típico de cuota
                        cuota_actual = num
                        break
            
            # TOTAL A PAGAR
            if 'Total a pagar' in fila_str or 'Total  a  pagar' in fila_str:
                numeros = re.findall(r'(\d+)', fila_str)
                if numeros:
                    total_a_pagar = parsear_monto(numeros[-1])
                break
        
        # LÓGICA DE CÁLCULO (siguiendo Paso 2 del prompt)
        # A. Deuda Vencida Neta
        deuda_vencida = total_a_pagar - cuota_actual
        if deuda_vencida <= 0:
            deuda_vencida = 0
        
        # B. Edad Vencida (Meses) - Redondear a 2 decimales
        if cuota_actual > 0:
            edad_vencida = round(deuda_vencida / cuota_actual, 2)
        else:
            edad_vencida = 0.00
        
        # CLASIFICACIÓN "TIPO DE CARTA" (siguiendo Paso 3 del prompt)
        if edad_vencida <= 0:
            tipo_carta = 'AD'
        elif edad_vencida > 0 and edad_vencida <= 1:
            tipo_carta = 'CS'
        elif edad_vencida > 1 and edad_vencida <= 2:
            tipo_carta = 'CP'
        else:  # edad_vencida > 2
            tipo_carta = 'AB'
        
        # ESTADO REAL (siguiendo Paso 4 del prompt)
        if edad_vencida <= 0:
            estado_real = '🟢 Al Día'
        elif edad_vencida > 0 and edad_vencida < 1:
            estado_real = '🟡 Mora Baja/Técnica'
        elif edad_vencida >= 1 and edad_vencida < 3:
            estado_real = '🟡 Mora Moderada'
        elif edad_vencida >= 3 and edad_vencida < 6:
            estado_real = '🟠 Riesgo Alto'
        else:  # edad_vencida >= 6
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

# FORMATO DE SALIDA (siguiendo Paso 5 del prompt)
# Generar tabla Markdown
output_md = 'ANALISIS_ENERO_2026.md'
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
    tipo_carta_dist = df_analisis['TIPO DE CARTA'].value_counts().sort_index()
    for carta, count in tipo_carta_dist.items():
        f.write(f"- **{carta}:** {count} unidades\n")
    
    f.write("\n### Distribución por Estado Real\n\n")
    estado_dist = df_analisis['ESTADO REAL'].value_counts()
    for estado, count in estado_dist.items():
        f.write(f"- {estado}: {count} unidades\n")
    
    # Calcular totales
    total_cartera = sum([float(x.replace('$', '').replace(',', '')) for x in df_analisis['TOTAL A PAGAR']])
    f.write(f"\n**Cartera Total:** ${total_cartera:,.0f}\n")

print(f"✅ Tabla Maestra generada: {output_md}")
print(f"📊 {len(df_analisis)} unidades procesadas")
