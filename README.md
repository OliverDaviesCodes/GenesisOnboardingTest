# GenesisOnboardingTest

A full‑stack web application built with React/Vite frontend and .NET 8 Web API backend, featuring JWT auth and DevExpress Data Grid.

## Features

- User Authentication (JWT)
- CRUD Data Management
- DevExpress React Data Grid (sorting, filtering, editing, summaries)
- CORS between frontend and backend
- Security: BCrypt password hashing, parameterized queries, input validation

## Tech Stack

- Frontend: React 18 + TypeScript, Vite, Axios, React Router, DevExpress Grid
- Backend: .NET 8 Web API, EF Core (SQL Server), JWT Bearer, BCrypt, AutoMapper
- Database: SQL Server (LocalDB for dev, SQL Server 2019/2022 for prod)

---

## Production SQL Server Setup (step‑by‑step)

Target instance: OLIVERRANDOM\SQLEXPRESS01 (SQL Server 2022 Express). Replace names/passwords as needed.

1) Make sure SQL is running
```powershell
Get-Service 'MSSQL$SQLEXPRESS01'   # Status should be Running
```

2) Enable TCP/IP and set a fixed port
- Open “SQL Server Configuration Manager”.
- SQL Server Network Configuration → Protocols for SQLEXPRESS01 → TCP/IP → Enabled = Yes.
- TCP/IP → Properties → IP Addresses:
  - Clear all “TCP Dynamic Ports”.
  - In “IPAll”, set “TCP Port” = 1433.
- Restart the “SQL Server (SQLEXPRESS01)” service.

3) Open the Windows Firewall port
```powershell
netsh advfirewall firewall add rule name="SQL Server SQLEXPRESS01 1433" dir=in action=allow protocol=TCP localport=1433
```

4) (Optional) Use SQL Browser instead of a fixed port
```powershell
Get-Service 'SQLBrowser' | Start-Service
# Then you can connect without ",1433"
```

5) Test connectivity
```powershell
# Local shared memory (works even if TCP is off)
sqlcmd -S .\SQLEXPRESS01 -E

# TCP on fixed port (increase timeout)
sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -E -l 30
```

6) Create the production database and app login
Paste the following in SSMS (New Query) or in sqlcmd (remember GO on a new line to execute):
```sql
CREATE DATABASE GenesisOnboardingProd;
GO

CREATE LOGIN app_genesis WITH PASSWORD = 'ChangeMe!Strong#Password2025', CHECK_POLICY = ON;
GO

USE GenesisOnboardingProd;
GO
CREATE USER app_genesis FOR LOGIN app_genesis;
GO
EXEC sp_addrolemember N'db_datareader', N'app_genesis';
GO
EXEC sp_addrolemember N'db_datawriter', N'app_genesis';
GO
-- Only if your deployment needs schema changes; remove after:
-- EXEC sp_addrolemember N'db_ddladmin', N'app_genesis';
-- GO

-- Quick check
SELECT DB_NAME() AS CurrentDb;
GO
```

7) Test the app login works
```powershell
sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -U app_genesis -P "ChangeMe!Strong#Password2025" -d GenesisOnboardingProd -Q "SELECT SUSER_SNAME(), DB_NAME();"
```

8) Deploy schema to prod (idempotent EF script)
```powershell
cd ".\backend"
dotnet tool update -g dotnet-ef
dotnet ef migrations script --idempotent -o .\migrations-prod.sql

# Run via sqlcmd against prod DB:
sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -U app_genesis -P "ChangeMe!Strong#Password2025" -d GenesisOnboardingProd -i ".\migrations-prod.sql"
```

9) Point the site to the prod DB
App settings (prefer environment variables in real prod):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=OLIVERRANDOM\\SQLEXPRESS01,1433;Database=GenesisOnboardingProd;User Id=app_genesis;Password=ChangeMe!Strong#Password2025;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;"
  }
}
```

Or via environment variable (recommended):
```powershell
[Environment]::SetEnvironmentVariable(
  "ConnectionStrings__DefaultConnection",
  "Server=OLIVERRANDOM\\SQLEXPRESS01,1433;Database=GenesisOnboardingProd;User Id=app_genesis;Password=ChangeMe!Strong#Password2025;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;Connection Timeout=30;",
  "Machine"
)
```

10) Verify the backend connects (Production environment)
```powershell
cd ".\backend"
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

---

## What went wrong (and how it was fixed)

SQL connection timeouts (sqlcmd)
- Symptoms: “TCP Provider: The wait operation timed out… Login timeout expired”.

- Causes:
  - Wrong sqlcmd syntax (missing -S and instance).
  - TCP/IP not enabled or no static port.
  - Firewall blocking 1433.

- Fix:
  - Use: sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -E -l 30
  - Enable TCP/IP, set port 1433, open firewall.
  - Alternatively start SQL Browser and omit “,1433”.

EF Core migrations duplicate/“There is already an object named 'Users'”
- Cause: Merge duplicated migration code; prod already had tables.
- Fix options:
  - Dev reset: delete Migrations, drop dev DB, re-add InitialCreate, update DB.
  - Baseline existing DB: delete Migrations, add Baseline with --ignore-changes, update DB, then create next real migration.

JWT name showed as “User”
- Cause: Name claim key differed (namespaced ASP.NET claims).
- Fix: Map multiple name claims in getUserFromToken and fallback to email. Use string user.id (JWT sub/nameidentifier).

Git issues (not a repo, unrelated histories, recovery)
- Initialize and set remote:
  - git init; git remote add origin <repo-url>; git add -A; git commit; git push -u origin main
- Unrelated histories on first pull:
  - git pull --allow-unrelated-histories origin main
- Quick recovery after bad command:
  - git reset --hard ORIG_HEAD; git reflog to locate a good state

---

## Getting Started (Development)

Prerequisites
- Node.js 18+
- .NET 8 SDK
- SQL Server LocalDB or SQL Server 2019/2022

Backend
```bash
cd backend
dotnet restore
# If starting fresh schema in dev:
dotnet ef database update
dotnet run
```
Backend runs by default at https://localhost:7042

Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

Dev connection string (appsettings.json)
- Defaults to LocalDB.

---

## Database: EF Core migrations (dev)

Typical dev reset (removes dev data)
```powershell
cd .\backend
dotnet tool update -g dotnet-ef
dotnet ef database drop -f
Remove-Item -Recurse -Force .\Migrations
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Baseline an existing database (keep current data/schema)
```powershell
cd .\backend
dotnet tool update -g dotnet-ef
Remove-Item -Recurse -Force .\Migrations
dotnet ef migrations add Baseline --ignore-changes
dotnet ef database update
```
```

---

## Auth: JWT name mapping and UI fallback

- Map multiple name claims (name, unique_name, preferred_username, ASP.NET namespaced).
- Use string user.id (JWT sub/nameidentifier).
- UI fallback:
```tsx
<span>
  Welcome, <strong>{user?.name ?? user?.email ?? 'User'}</strong>
</span>
```

---

## Git: connect, push, and recover

Connect to GitHub
```powershell
cd "C:\Users\OliverDavies\Downloads\GenesisOnboardingTest-main"
git init
git remote add origin https://github.com/OliverDaviesCodes/GenesisOnboardingTest.git
git add -A
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

First pull merge issue
```powershell
git fetch origin
git pull --allow-unrelated-histories origin main
```

Recovery
```powershell
git reset --hard ORIG_HEAD
git reflog -n 30
git reset --hard HEAD@{N}
```

---

## API Endpoints

Auth
- POST /api/auth/login
- POST /api/auth/register

Data Entries
- GET /api/dataentries
- GET /api/dataentries/{id}
- POST /api/dataentries
- PUT /api/dataentries/{id}
- DELETE /api/dataentries/{id}

---

## Build for Production

Backend
```bash
cd backend
dotnet publish -c Release
```

Frontend
```bash
cd frontend
npm run build
```
Outputs in frontend/dist.

---

## Quick Troubleshooting

- SQL timeout:
  - Use correct sqlcmd: -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -E -l 30
  - Enable TCP/IP, set 1433, open firewall, or start SQL Browser.
- “Object already exists”:
  - Use idempotent EF script; baseline if schema already matches.
- JWT name still “User”:
  - Log claim keys once and map the exact key used by your token provider.
- GitHub shows nothing:
  - Ensure commits exist, remote set, branch pushed to origin/main.
