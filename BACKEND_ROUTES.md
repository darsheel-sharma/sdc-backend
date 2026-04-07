# Backend Routes

This file explains the routes that are currently exposed by `sdc-backend`.

## Base setup

- The Express app is created in `server.js`.
- JSON bodies are enabled with `express.json()`.
- CORS currently allows:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://localhost:5000`
  - `http://127.0.0.1:5000`
- The auth router is mounted at `/auth`.

## Active routes

### `GET /`

- Defined directly in `server.js`.
- Current behavior: logs `"running"` to the console.
- Important note: it does not send a response body, so it is not a reliable health-check endpoint yet.

### `POST /auth/register`

Creates a new user with email/password auth.

- Handler: `register` in `controllers/auth.js`
- Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

- What it does:
  - hashes the password with `bcryptjs`
  - creates the user in MongoDB
  - signs a JWT with `userId`
  - returns the user without the password
- Success response:

```json
{
  "message": "User created",
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

- Common failure:
  - duplicate email -> `400 { "error": "Email already in use" }`

### `POST /auth/login`

Logs in an existing email/password user.

- Handler: `login` in `controllers/auth.js`
- Request body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

- What it does:
  - looks up the user by email
  - rejects Google-only accounts for password login
  - compares the password with the stored hash
  - returns a JWT and the user without the password
- Success response:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

- Common failures:
  - `{ "error": "Invalid Email" }`
  - `{ "error": "Please login using google" }`
  - `{ "error": "Invalid Password" }`

### `POST /auth/google-login`

Logs in or creates a user through Google Sign-In.

- Handler: `googleLogin` in `controllers/auth.js`
- Request body:

```json
{
  "idToken": "<google-id-token>"
}
```

- What it does:
  - verifies the Google ID token with `GOOGLE_CLIENT_ID`
  - upserts the user by email
  - stores `googleId` and `name`
  - returns a JWT plus the user object
- Success response:

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "...",
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "googleId": "..."
  }
}
```

- Common failures:
  - invalid Google token -> `400 { "error": "Invalid Google Token" }`
  - verification/auth issues -> `401 { "error": "Authentication failed" }`

### `PUT /auth/update-user`

Updates selected profile fields for the currently authenticated user.

- Handler: `updateUser` in `controllers/auth.js`
- Middleware: `verifyToken` in `middleware/auth.js`
- Required header:

```http
Authorization: Bearer <jwt>
```

- Accepted body fields:

```json
{
  "skills": ["react", "node"],
  "bio": "Full-stack developer",
  "team": "Editorial"
}
```

- What it does:
  - reads `req.userId` from the verified JWT
  - updates only `skills`, `bio`, and `team` if they are present
  - returns the updated user with `name`, `email`, `skills`, `bio`, and `team`
- Success response:

```json
{
  "user": {
    "_id": "...",
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "skills": ["react", "node"],
    "bio": "Full-stack developer",
    "team": "Editorial"
  }
}
```

## Auth middleware

`verifyToken` protects authenticated routes.

- It expects `Authorization: Bearer <token>`.
- It verifies the token using `JWT_SECRET`.
- On success it sets `req.userId`.
- On failure it returns:
  - `401 { "error": "Invalid user, no token provided" }`
  - `401 { "error": "Invalid or expired token" }`

## Routes or features referenced elsewhere but not currently exposed

These are useful to know because other parts of the repo still point at them.

- `/auth/get-user`
  - The frontend calls this route in `sdc-frontend/app/components/navbar.tsx` and `sdc-frontend/app/components/newsCard.tsx`.
  - It is not currently registered in `sdc-backend/routes/auth.js`.
- Opportunity endpoints
  - `controllers/opportunity.js` defines `createOpportunity` and `getOpportunities`.
  - There is no route file or `app.use(...)` mounting them right now.
- `/library/save-article`
  - The frontend calls this in `sdc-frontend/app/components/newsCard.tsx`.
  - There is no matching route in the current `sdc-backend` project.

## Environment variables the backend expects

The backend validates these in `config/env.js`:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
