$ErrorActionPreference = 'Stop'
$portableRoot = Join-Path (Split-Path $PSScriptRoot -Parent) '.tools'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $portableNode = Get-ChildItem -LiteralPath $portableRoot -Directory -Filter 'node-*-win-x64' -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if (-not $portableNode) { throw 'Instale Node.js LTS antes de iniciar o frontend.' }
    $env:Path = $portableNode.FullName + ';' + $env:Path
}
Push-Location $PSScriptRoot
try {
    if (-not (Test-Path 'node_modules/next/package.json')) {
        throw 'Dependências ausentes. Execute npm.cmd install antes de iniciar.'
    }
    & npm.cmd run dev
    if ($LASTEXITCODE -ne 0) { throw 'O servidor local terminou com erro.' }
} finally {
    Pop-Location
}
