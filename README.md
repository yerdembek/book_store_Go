Book Store API

This project is a simple backend API for an online book store written in Go.
It was created as a learning project to practice backend development, working with databases, and authentication.

The API allows users to register, log in, view books, and read book files in PDF format.

About the Project

The main goal of this project is to understand how a backend service works:

how users are authenticated

how data is stored in a database

how files are uploaded and served

how middleware is used to protect routes

The project uses MongoDB as the database and JWT tokens for authentication.

Technologies Used

Go (Golang)

MongoDB

net/http

JWT

bcrypt (for password hashing)

Gorilla Mux

Project Structure
book_store_Go/
├── internal/
│   ├── auth/        # User registration and login
│   ├── books/       # Book catalog and PDF reader
│   ├── middleware/  # JWT authentication middleware
│   ├── models/      # Data models
│   ├── repository/ # MongoDB logic
│   ├── utils/       # Helper functions (JWT, email)
│   └── mock/        # Mock repository for testing
│
├── storage/
│   └── books/       # Uploaded PDF files
└── main.go

Authentication

Users can create an account and log in.
Passwords are stored securely using hashing.
After logging in, the server returns a JWT token, which is used to access protected endpoints.

Books

The API allows:

viewing a list of books

adding new books to the database

Each book contains basic information such as title, author, description, and price.

Reading Books (PDF)

For each book, a PDF file can be uploaded.
The file is stored on the server, and users can open the book directly in the browser.

This part of the project helped me understand how file uploads and downloads work in Go.

Middleware

JWT middleware is used to:

check if the user is authenticated

validate the token

extract user information from the token

This ensures that only authorized users can access certain endpoints.

User Roles

The project includes several user roles:

user

book_premium

group_book_premium

admin

At the moment, roles are mainly stored and validated, but they can be extended for access control in the future.

Environment Variables

The project uses an environment variable for JWT:

JWT_SECRET=your_secret_key


If it is not set, a default value is used for development.
