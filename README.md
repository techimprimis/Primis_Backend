# Primis Backend

A minimal Express.js backend built with TypeScript and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Native Driver)
- **Linting:** ESLint with TypeScript rules

## Project Structure

```
src/
├── config/
│   └── database.ts       # MongoDB connection setup
├── controllers/
│   └── user.controller.ts # User routes & request handlers
├── middleware/
│   └── user.service.ts   # User database operations
├── models/
│   └── user.model.ts     # User interface & collection name
├── routes/
│   └── index.ts          # Route aggregator
├── utils/
│   └── errorHandler.ts   # Global error handling middleware
└── index.ts              # Application entry point
```

## Prerequisites

- Node.js >= 18.x
- MongoDB Atlas account or local MongoDB instance

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd Primis_Backend

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
```

> **Note:** URL encode special characters in password (e.g., `^` → `%5E`)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run debug` | Start with debugger (attach VS Code debugger) |
| `npm run build` | Lint and compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |

## API Endpoints

### Health Check
```
GET /
```

### Users
```
GET    /api/users      # Get all users
GET    /api/users/:id  # Get user by ID
POST   /api/users      # Create new user
```

#### Create User Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

## Code Standards

ESLint enforces the following naming conventions:

- **Variables:** `camelCase` or `UPPER_CASE` (constants)
- **Functions/Methods:** `camelCase`
- **Classes/Types:** `PascalCase`
- **Interfaces:** Prefix with `I` (e.g., `IUser`)
- **Enum Members:** `UPPER_CASE`

## Development

```bash
# Start development server
npm run dev

# Or with debugger
npm run debug
```

The server runs on `http://localhost:3000` by default.

## Build for Production

```bash
# Build
npm run build

# Run
npm start
```

## License

ISC
