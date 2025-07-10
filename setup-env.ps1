# Script PowerShell pour configurer les variables d'environnement Supabase
# Exécutez ce script dans PowerShell

Write-Host "🚀 Configuration des variables d'environnement Supabase pour SenAlert" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Instructions :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://supabase.com/dashboard"
Write-Host "2. Sélectionnez votre projet SenAlert"
Write-Host "3. Allez dans Settings > API"
Write-Host "4. Copiez 'Project URL' et 'anon public'"
Write-Host ""

$supabaseUrl = Read-Host "🔗 Project URL (ex: https://abcdefghijklmnop.supabase.co)"
$supabaseKey = Read-Host "🔑 anon public key (commence par eyJ...)"

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Les deux valeurs sont requises" -ForegroundColor Red
    exit
}

if (-not $supabaseUrl.StartsWith("https://") -or -not $supabaseUrl.Contains(".supabase.co")) {
    Write-Host "❌ URL Supabase invalide. Doit commencer par https:// et contenir .supabase.co" -ForegroundColor Red
    exit
}

if (-not $supabaseKey.StartsWith("eyJ")) {
    Write-Host "❌ Clé Supabase invalide. Doit commencer par eyJ" -ForegroundColor Red
    exit
}

$envContent = @"
# Configuration Supabase pour SenAlert
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@

$envPath = Join-Path (Get-Location) ".env.local"

try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host ""
    Write-Host "✅ Fichier .env.local créé avec succès !" -ForegroundColor Green
    Write-Host "📍 Emplacement: $envPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔄 Redémarrez votre serveur de développement :" -ForegroundColor Yellow
    Write-Host "   npm run dev"
    Write-Host "   ou"
    Write-Host "   yarn dev"
    Write-Host "   ou"
    Write-Host "   bun dev"
} catch {
    Write-Host "❌ Erreur lors de la création du fichier: $($_.Exception.Message)" -ForegroundColor Red
} 