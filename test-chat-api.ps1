# PowerShell script to test Amazon Nova Pro chat endpoint
# This script gets a guest token and then sends a chat message

$baseUrl = "http://localhost:5000"

Write-Host "Step 1: Getting guest token..." -ForegroundColor Cyan

# Get guest token
$guestResponse = Invoke-RestMethod -Uri "$baseUrl/auth/guest" -Method POST -ContentType "application/json"

$token = $guestResponse.token
Write-Host "Got token: $($token.Substring(0, 20))..." -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Sending chat message to Amazon Nova Pro..." -ForegroundColor Cyan

# Send chat message
$chatBody = @{
    message = "I have been feeling very anxious lately. Can you help me understand what I can do?"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-auth-token" = $token
}

try {
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat" -Method POST -Headers $headers -Body $chatBody

    Write-Host ""
    Write-Host "Success! Response from Amazon Nova Pro:" -ForegroundColor Green
    Write-Host "Model: $($chatResponse.model)" -ForegroundColor Yellow
    Write-Host "Reply: $($chatResponse.reply)" -ForegroundColor White
}
catch {
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
