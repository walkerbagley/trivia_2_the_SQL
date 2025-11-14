# Project Overview
This is a trivia web application developed using a Supabase postgreSQL database, a python fastapi backend, and a React frontend.

# Folder Structure
trivia_2_api: FastAPI backend code
trivia_2_api/middleware: contains auth code
trivia_2_api/models: contains pydantic models for request and response bodies
trivia_2_api/routers: contains API route definitions
trivia_2_api/utils: contains helpers for auth and session management
--
trivia-2-the-sql: React frontend code
trivia-2-the-sql/src/Components: contains React components for different pages and UI elements
trivia-2-the-sql/src/Services: contains API service functions for interacting with the backend
trivia-2-the-sql/src/Providers: contains auth, axios, and user context providers

# Guidelines
Only use comments for complex logic. Use docstrings and type hints where applicable. Use python  on the backend and react on the front end unless otherwise specified.