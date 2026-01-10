import pandas as pd
import re

# Leer el archivo Excel
file_path = r'c:\Users\ATC\Documents\Proyectos ATC\cartera-lc\sample-data\ciudad-jardin\reportes-cartera\FACT ENE-26.xls'
df = pd.read_excel(file_path, sheet_name=0)

print("="*80)
print("ANÁLISIS DEL ARCHIVO: FACT ENE-26.xls")
print("="*80)
print(f"\nDimensiones: {df.shape[0]} filas x {df.shape[1]} columnas")

# Buscar las filas que contienen "LOCAL:"
locales = []
for idx, row in df.iterrows():
    row_str = ' '.join([str(x) for x in row.values if pd.notna(x)])
    if 'LOCAL:' in row_str:
        local_match = re.search(r'LOCAL:\s*([A-Z0-9]+)', row_str)
        if local_match:
            locales.append((idx, local_match.group(1)))

print(f"\n\nLOCALES/OFICINAS ENCONTRADOS: {len(locales)}")
print("-"*80)
for idx, local in locales[:10]:  # Mostrar primeros 10
    print(f"Fila {idx}: {local}")

if len(locales) > 10:
    print(f"... y {len(locales) - 10} más")

# Examinar estructura de una unidad completa
if locales:
    print(f"\n\nESTRUCTURA DE EJEMPLO - {locales[0][1]}:")
    print("-"*80)
    start_row = locales[0][0]
    # Mostrar las siguientes 30 filas para ver el formato completo
    for i in range(start_row, min(start_row + 30, len(df))):
        row_values = [str(x) for x in df.iloc[i].values if pd.notna(x)]
        if row_values:
            print(f"Fila {i}: {' | '.join(row_values)}")
        
        # Detenerse si encuentra el siguiente local
        if i > start_row:
            row_str = ' '.join(row_values)
            if 'LOCAL:' in row_str:
                print("\n[Siguiente unidad encontrada...]")
                break
