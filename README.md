# Book Store Platform

## Advanced Programming Final Project
Backend: Go (Golang) + MongoDB
Frontend: HTML / CSS / JavaScript

## Project Overview

Book Store Platform is a full-stack web application that provides:

- Secure user authentication (JWT-based)

- Profile management

- Book catalog management

- PDF and EPUB file storage

- Real-time chat system (WebSocket)

- Subscription-based premium access control

The system implements a monetization model using subscriptions.
Users can upgrade their account to unlock premium content and advanced features.

## System Architecture

The project follows a layered architecture to separate responsibilities and maintain clean code structure.

## Project Structure

```
cmd/
└── main.go

internal/
├── auth/
├── books/
├── chat/
├── middleware/
├── models/
├── profile/
├── repository/
├── subscription/
└── utils/

public/
storage/
Project Documents/
```

## Layer Responsibilities

`models`
Contains data structures and business logic.

`repository`
Handles MongoDB interactions.

`handlers (auth, books, profile, subscription)`
Process HTTP requests and responses.

`middleware`
JWT authentication and protected routes.

`chat`
WebSocket real-time messaging system.

`utils`
JWT generation/validation and email utilities.


## Authentication System

The authentication system provides:

- Password hashing using bcrypt

- JWT token generation (24-hour expiration)

- Protected API endpoints

- Role-based access control

`Endpoints`

```
POST /api/register
POST /api/login
GET /api/me
```
## User Roles

The system supports the following roles:

- User

- Admin

Admins automatically bypass subscription restrictions.

## Subscription System

The platform implements a subscription-based access model.

Subscription Types

- `none` – default (free user)

- `reader` – access to premium books

- `creator` – access to premium books and chat creation

- `admin` – full access

## Subscription Duration

Subscriptions are valid for 30 days from upgrade.

## Subscription Upgrade Endpoint

`POST /api/subscription/upgrade`

Request example:
```
{
"subscription": "reader"
}
```

## Access Control Logic

Each user contains:

- `Subscription`

- `SubExpiresAt`

Helper methods implemented in the User model:

- `IsSubActive()`

- `CanReadPremium()`

- `CanCreateChats()`

Access rules:

| Role    | Premium Books | Create Chats |
|---------|--------------|--------------|
| Free    | ❌           | ❌           |
| Reader  | ✅           | ❌           |
| Creator | ✅           | ✅           |
| Admin   | ✅           | ✅           |


## Book Management

Features:

- Create book

- Get all books

- Get book by ID

- Upload book file (PDF / EPUB)

- Download PDF

- Download EPUB

Endpoints

`GET /books`

`POST /books`

`GET /books/{id}`

`POST /books/{id}/upload/file`

`GET /books/{id}/download/pdf`

`GET /books/{id}/download/epub`

Supported formats:

- PDF

- EPUB

Files are stored locally in:

`storage/books/`

## Real-Time Chat System

The chat system is implemented using Gorilla WebSocket.

Features:

- Real-time messaging

- Message persistence in MongoDB

- Hub-based broadcast architecture

- Multiple connected clients support

## WebSocket Endpoint

`GET /ws?email=user@example.com`

Messages are stored in the `messages` collection.

## Database Design

The application uses MongoDB with three main collections:

`users`

- email

- username

- password_hash

- role

- subscription

- sub_expires_at

- created_at

`books`

- title

- author

- description

- image_url

- price

- is_premium

- file_path

`messages`

- sender

- content

- created_at

ER, UML and Use Case diagrams are located in:

`Project Documents/`

## Security Features

- bcrypt password hashing

- JWT authentication with expiration

- Protected API routes

- Role-based authorization

- Subscription expiration validation

- Context-based user validation

## Environment Variables

The project requires a `.env` file:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

## How to Run

1. Install Go

2. Install MongoDB (or use MongoDB Atlas)

3. Create .env file

4. Run:
`go run cmd/main.go`


Server will start at:

`http://localhost:8080`

Frontend files are served from:

`public/`

## Project Documentation

Included in the repository:
- [x] ER Diagram

- [x] UML Diagram

- [x] Use Case Diagram

- [x] Gantt Plan

- [ ] Previous assignment documentation

## Future Improvements

- Payment gateway integration

- Subscription auto-renewal

- Admin dashboard

- Cloud file storage (AWS / Cloudinary)

- Role-based chat rooms

- Premium chat-only channels

## Authors

DreamTeam:
- [x] `Abdikasym Nurbakyt`
- [x] `Marat Danial`
- [x] `Yerdembek Beknur`

Advanced Programming Final Project