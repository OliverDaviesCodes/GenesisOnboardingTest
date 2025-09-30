# GenesisOnboardingTest

A full-stack web application built with React/Vite frontend and .NET Core Web API backend, featuring user authentication and data management with DevExpress Data Grid.

## Features

- **User Authentication**: JWT-based authentication with login/register functionality
- **Data Management**: CRUD operations for data entries with form validation
- **DevExpress Data Grid**: Interactive data grid with sorting, filtering, editing, and summary features
- **CORS Support**: Proper cross-origin request handling between frontend and backend
- **Security**: BCrypt password hashing, parameterized SQL queries, input validation

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and build tooling
- DevExpress React Data Grid
- Axios for API communication
- React Router for navigation

### Backend
- .NET Core 8.0 Web API
- Entity Framework Core with SQL Server
- JWT Bearer authentication
- BCrypt for password hashing
- AutoMapper for object mapping

### Database
- Microsoft SQL Server (LocalDB for development)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 8.0 SDK
- SQL Server or SQL Server LocalDB

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Restore packages:
```bash
dotnet restore
```

3. Update the database connection string in `appsettings.json` if needed.

4. Apply database migrations:
```bash
dotnet ef database update
```

5. Run the backend:
```bash
dotnet run
```

The backend API will be available at `https://localhost:7201`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Data Entries
- `GET /api/dataentries` - Get all data entries for authenticated user
- `GET /api/dataentries/{id}` - Get specific data entry
- `POST /api/dataentries` - Create new data entry
- `PUT /api/dataentries/{id}` - Update data entry
- `DELETE /api/dataentries/{id}` - Delete data entry

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt for secure password storage
- **CORS Configuration**: Properly configured for cross-origin requests
- **SQL Injection Protection**: Parameterized queries via Entity Framework
- **Input Validation**: Server-side and client-side validation
- **Authorization**: Role-based access control for data operations

## Project Structure

```
├── backend/                 # .NET Core Web API
│   ├── Controllers/         # API controllers
│   ├── Data/               # Database context
│   ├── DTOs/               # Data transfer objects
│   ├── Models/             # Entity models
│   ├── Services/           # Business logic services
│   └── Migrations/         # EF Core migrations
├── frontend/               # React/Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
```

## Development Notes

- The backend uses LocalDB by default for development
- CORS is configured to allow requests from `localhost:5173` and `localhost:3000`
- JWT tokens expire after 7 days
- All API endpoints except authentication require valid JWT token
- The data grid supports real-time editing, deletion, and summary calculations

## Building for Production

### Backend
```bash
cd backend
dotnet publish -c Release
```

### Frontend
```bash
cd frontend
npm run build
```

The built frontend files will be in the `dist/` directory and can be served by any static file server.
