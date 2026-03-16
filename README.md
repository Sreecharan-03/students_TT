# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


# Anurag TT Portal

This project is now a Java full-stack portal with:

1. A public student submission form built with React + Vite.
2. A faculty signup/login flow.
3. A protected faculty dashboard.
4. A Spring Boot backend connected to Neon Postgres.

## Structure

1. Frontend: `D:\Students_TT\frontend`
2. Backend: `D:\Students_TT\backend`

## Environment Files

1. Frontend env: `D:\Students_TT\frontend\.env`
	1. `VITE_API_BASE_URL=http://localhost:8080/api`
2. Backend env: `D:\Students_TT\backend\.env`
	1. `DATABASE_URL=...`
	2. `JWT_SECRET=...`
	3. `JWT_EXPIRATION_MS=86400000`
	4. `FRONTEND_URL=http://localhost:5173`

## Run Commands

1. Frontend dev server:

```bash
npm run dev
```

2. Backend dev server:

```bash
npm run backend:dev
```

3. Frontend production build:

```bash
npm run build
```

4. Backend production build:

```bash
npm run backend:build
```

## Routes

1. Student form: `/`
2. Faculty login: `/faculty/login`
3. Faculty signup: `/faculty/signup`
4. Faculty dashboard: `/faculty/dashboard`

## Backend Features

1. Stores student submissions in Neon Postgres.
2. Stores prototype PDF files in the database.
3. Supports faculty JWT authentication.
4. Protects faculty-only dashboard APIs.
5. Supports filter, star, delete, and export from the dashboard.
