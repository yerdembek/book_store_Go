#  Book Store API

## Book Store API Overview

Book Store API is a simple backend application written in **Go** and powered by **MongoDB**.  
This project was created as a learning backend project to understand how REST APIs work.

It includes user authentication, book management, and PDF file handling.

---

## Purpose of the Project

The main goals of this project are:

- Learn backend development using Go
- Practice working with MongoDB
- Implement JWT authentication
- Understand middleware usage
- Handle file upload and file serving

---

## Technologies Used

- Go (Golang)
- MongoDB
- net/http
- JWT (JSON Web Tokens)
- bcrypt
- Gorilla Mux

---

## Project Structure

```text
.
├── internal/
│   ├── auth/          # Registration and login
│   ├── books/         # Book catalog and PDF reader
│   ├── middleware/    # JWT authentication middleware
│   ├── models/        # Data models
│   ├── repository/    # MongoDB repositories
│   ├── utils/         # Helper utilities
│   └── mock/          # Mock repository for testing
├── storage/
│   └── books/         # Uploaded PDF files
└── main.go            # Application entry point
```

---

## Authentication

Users can register and log in using email and password.  
Passwords are hashed before being stored in the database.

After successful login, the user receives a **JWT token**.  
This token is required to access protected routes.

---

## Books

The API allows users to:

- View all books
- Add new books

Each book contains information such as title, author, description, and price.

---

## PDF Reader

### Upload PDF

A PDF file can be uploaded for each book.  
The file is stored on the server in the `storage/books` directory.

### Read PDF

Uploaded PDF files can be opened directly in the browser.

---

## Middleware

JWT middleware is used to:

- Validate authentication tokens
- Check token expiration
- Extract user data from the token

Only authorized users can access protected routes.

---

## User Roles

The project includes basic user roles:

- user
- book_premium
- group_book_premium
- admin

---

## Environment Variables

```env
JWT_SECRET=your_secret_key