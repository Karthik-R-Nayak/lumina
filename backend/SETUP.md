# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env` file in the `backend` folder with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lumina
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If you don't have MongoDB installed:
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **Mac**: `brew install mongodb-community`
   - **Linux**: `sudo apt-get install mongodb`
   
   Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string
   - Update MONGODB_URI in .env

4. **Run the Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- curl
- Your frontend application

### Example: Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Example: Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Connecting Frontend to Backend

Update your frontend API calls to point to `http://localhost:5000/api`

Example:
```javascript
const API_URL = 'http://localhost:5000/api';

// Sign in
fetch(`${API_URL}/auth/signin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
})
```

## Troubleshooting

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check MONGODB_URI in .env
   - For MongoDB Atlas, ensure your IP is whitelisted

2. **Port Already in Use**
   - Change PORT in .env to a different number (e.g., 5001)

3. **Module Not Found Errors**
   - Run `npm install` again
   - Delete node_modules and package-lock.json, then run `npm install`

