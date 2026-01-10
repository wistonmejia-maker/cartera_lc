$source = "C:\Users\ATC\Documents\Proyectos ATC\cartera-lc"
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupName = "cartera_lc_backup_$timestamp"
$tempDir = "$env:TEMP\$backupName"
$zipPath = "C:\Users\ATC\Documents\Proyectos ATC\$backupName.zip"

Write-Host "Iniciando respaldo..." -ForegroundColor Cyan
Write-Host "Fuente: $source"
Write-Host "Destino Temporal: $tempDir"

# 1. Copiar archivos excluyendo carpetas pesadas usando Robocopy
# /S = Subdirectorios, /XD = Excluir Directorios
$excludeDirs = @("node_modules", ".git", ".next", "dist", "build", "coverage")
$robocopyArgs = @($source, $tempDir, "/S", "/XD") + $excludeDirs

Write-Host "Copiando archivos (omitiendo node_modules)..." -ForegroundColor Yellow
& robocopy @robocopyArgs
# Robocopy devuelve códigos de salida no-cero incluso en éxito (1=Archivos copiados), así que no verificamos $LASTEXITCODE estrictamente como error.

# 2. Comprimir
Write-Host "Comprimiendo backup en: $zipPath" -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# 3. Limpieza
Write-Host "Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "✅ BACKUP COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "Archivo listo en: $zipPath" -ForegroundColor Green
Write-Host "Este archivo contiene todo el código pero NO las carpetas 'node_modules'."
Write-Host "Recuerda copiar TAMBIÉN la carpeta de Antigravity (instrucciones en GUIA_MIGRACION.md)" -ForegroundColor Magenta
