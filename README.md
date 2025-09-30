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

Target instance used in testing: OLIVERRANDOM\SQLEXPRESS01 (SQL Server 2022 Express). Replace names/passwords as needed.

1) Ensure SQL Server is running
```powershell
Get-Service 'MSSQL$SQLEXPRESS01'   # Status should be Running
```

2) Enable TCP/IP and set a fixed port (once)
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

4) Optional: use SQL Browser instead of a fixed port
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
-- Only if deployment needs schema changes (remove after):
-- EXEC sp_addrolemember N'db_ddladmin', N'app_genesis';
-- GO

-- Quick check
SELECT DB_NAME() AS CurrentDb;
GO
```

7) Test the app login works
```powershell
sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -U app_genesis -P "ChangeMe!Strong#Password2025" -d GenesisOnboardingProd -Q "SELECT SUSER_SNAME() AS LoginName, DB_NAME() AS CurrentDb;"
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

Or via environment variable:
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

## What went wrong (time‑boxed production DB attempt)

- TCP timeouts with sqlcmd
  - Symptom: “TCP Provider: The wait operation timed out… Login timeout expired”.

  - Causes discovered:
    - Wrong connection syntax tried (“1,1433 -E” without -S and instance).
    - TCP/IP not enabled or not listening on a fixed port.
    - Firewall not opened for 1433.

  - Fixes applied:
    - Corrected command: sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -E -l 30
    - Enabled TCP/IP and set port 1433 in SQL Server Configuration Manager.
    - Added Windows Firewall rule for 1433.
    - Alternative: started SQL Browser and connected without specifying a port.

- EF Core migrations and existing objects
  - “There is already an object named 'Users'” when applying schema.
  - Cause: Duplicate/merged migrations and an already‑provisioned DB.
  - Resolution options:
    - Dev reset: drop dev DB, delete Migrations, add InitialCreate, update DB.
    - Baseline prod: delete Migrations, add Baseline with --ignore-changes, update DB, then create the next real migration and deploy via idempotent script.

- JWT name claim showed as “User”
  - Cause: Name was emitted under a different claim key (ASP.NET namespaced claims).
  - Fix: Map multiple claim keys in getUserFromToken and fallback to email; use string user.id to match JWT sub/nameidentifier.

- Git setup and recovery
  - Not a git repository and “unrelated histories” issues while connecting to GitHub.
  - Fixes:
    - git init; add remote; initial commit; push -u origin main.
    - First pull with git pull --allow-unrelated-histories origin main.
    - Recovery after mistakes: git reset --hard ORIG_HEAD; git reflog to locate a good state.

Time constraints
- Ran out of time while wiring production TCP and deploying schema cleanly.
- Documented exact commands and recovery steps to finish quickly later.

---

## Next steps (checklist to production‑ready)

- [ ] Confirm SQL instance listens on 1433 (or start SQL Browser) and firewall is open.
- [ ] Create DB/login (already scripted above).
- [ ] Generate EF idempotent script and run on prod DB.
- [ ] Set production connection string via environment variable.
- [ ] Run backend in Production mode and test basic CRUD.
- [ ] Remove db_ddladmin from app_genesis if granted temporarily.
- [ ] Configure backups (FULL nightly, DIFF daily, LOG every 15 min).
- [ ] Add monitoring/alerts and enforce TLS (TrustServerCertificate=False with a real cert).

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

Deploy to prod (idempotent)
```powershell
cd .\backend
dotnet ef migrations script --idempotent -o .\migrations-prod.sql
# Run in SSMS or:
sqlcmd -S tcp:OLIVERRANDOM\SQLEXPRESS01,1433 -U app_genesis -P "ChangeMe!Strong#Password2025" -d GenesisOnboardingProd -i ".\migrations-prod.sql"
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