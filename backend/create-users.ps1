# Create test users via API

$baseUrl = "http://localhost:3000/api"

# Admin user
$adminUser = @{
    email = "admin@cinar.com"
    password = "admin123"
    firstName = "Admin"
    lastName = "User"
    role = "ADMIN"
} | ConvertTo-Json

# Project Manager
$pmUser = @{
    email = "pm@cinar.com"
    password = "admin123"
    firstName = "Project"
    lastName = "Manager"
    role = "PROJECT_MANAGER"
} | ConvertTo-Json

# Designer
$designerUser = @{
    email = "designer@cinar.com"
    password = "admin123"
    firstName = "Designer"
    lastName = "User"
    role = "DESIGNER"
} | ConvertTo-Json

Write-Host "Creating admin user..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $adminUser -ContentType "application/json"
    Write-Host "✓ Admin user created successfully" -ForegroundColor Green
    Write-Host $response | ConvertTo-Json
} catch {
    Write-Host "✗ Failed to create admin user: $_" -ForegroundColor Red
}

Write-Host "`nCreating PM user..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $pmUser -ContentType "application/json"
    Write-Host "✓ PM user created successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create PM user: $_" -ForegroundColor Red
}

Write-Host "`nCreating designer user..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $designerUser -ContentType "application/json"
    Write-Host "✓ Designer user created successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create designer user: $_" -ForegroundColor Red
}

Write-Host "`n✓ All users created! You can now login with:" -ForegroundColor Green
Write-Host "  - admin@cinar.com / admin123" -ForegroundColor Cyan
Write-Host "  - pm@cinar.com / admin123" -ForegroundColor Cyan
Write-Host "  - designer@cinar.com / admin123" -ForegroundColor Cyan
