# Lumina Backend API

Backend API for the Lumina social media application built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Sign up, Sign in)
- User Profiles (View, Edit, Follow/Unfollow)
- Posts (Create, View, Like, Comment, Delete)
- Search (Posts and Users)
- Explore Feed
- Settings Management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lumina
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in with email/username and password
- `GET /api/auth/me` - Get current authenticated user

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/:userId/follow` - Follow/Unfollow a user
- `PUT /api/users/settings` - Update user settings

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get feed (posts from followed users)
- `GET /api/posts/explore` - Get explore feed (all posts)
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts/:id/like` - Like/Unlike a post
- `POST /api/posts/:id/comment` - Add a comment to a post
- `DELETE /api/posts/:id` - Delete a post

### Search
- `GET /api/search?q=query&type=all|posts|users` - Search posts and users

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Example Requests

### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Post
```bash
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "caption": "My first post!"
}
```

## Database Schema

### User
- name, email, username, password
- bio, profilePic
- followers[], following[]
- settings { darkMode, notifications }

### Post
- user (reference)
- image, caption
- likes[] (user references)
- comments[] { user, text, timestamps }

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Notes

- Passwords are hashed using bcrypt
- JWT tokens expire in 7 days
- Image URLs should be provided (file upload can be added later with multer)
- All timestamps are automatically managed by MongoDB

