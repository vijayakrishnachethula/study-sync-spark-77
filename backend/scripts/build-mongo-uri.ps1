<#
PowerShell helper to URL-encode a MongoDB password and print a full MONGO_URI.
Usage (in PowerShell):
  ./build-mongo-uri.ps1 -Password 'MyP@ss/word#1' -DbName studysync

This script prints the encoded password and the full connection string to paste into your Vercel env.
It does not transmit anything anywhere; it runs locally.
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$Password,

  [string]$User = 'vijayakrishnachethula_db_user',
  [string]$Cluster = 'studynsync.njbi3k5.mongodb.net',
  [string]$DbName = 'studysync',
  [switch]$ShowOnlyEncoded
)

# URL-encode the password
$encoded = [uri]::EscapeDataString($Password)

if ($ShowOnlyEncoded) {
  Write-Output $encoded
  return
}

$uri = "mongodb+srv://${User}:${encoded}@${Cluster}/${DbName}?retryWrites=true&w=majority&appName=studysync"

Write-Output "Encoded password: $encoded"
Write-Output ""
Write-Output "Full MONGO_URI (copy this to your Vercel env var named MONGO_URI):"
Write-Output $uri

# For safety, do not save or log the original password anywhere from this script.
