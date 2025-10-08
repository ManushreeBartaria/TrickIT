# TrickIT - Social Media Platform

A modern social media platform built with FastAPI backend and React frontend.

## Features

- User Authentication
  - Registration with email and password
  - Login with JWT authentication
  - Forgot password with OTP verification
  - Reset password functionality

- User Profiles
  - Customizable profile pictures
  - About me section
  - View other users' profiles

- Posts
  - Create text posts
  - Upload media (images)
  - View posts from all users
  - Timeline view with latest posts first

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- MySQL (via XAMPP)
- JWT for authentication
- Python-multipart for file uploads

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling

## Setup Instructions

### Backend Setup

1. Start XAMPP:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services
   - Verify MySQL is running on port 3306

2. Set up the database:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database for the project
   - Configure the database connection in `app/database/connections.py`

3. Navigate to the backend directory:
   ```bash
   cd backend
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   Server will run on http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:3000

## Project Structure

```
TrickIT/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── database/
│   │   ├── model/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── uploads/
│   └── main.py
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── services/
        └── styles/
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/forgotpassword` - Request password reset OTP
- `POST /api/resetpassword` - Reset password with OTP
- `GET /api/loadprofile` - Get user profile
- `PUT /api/update-profile` - Update user profile
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get all posts

## Environment Setup

1. Ensure Python 3.8+ is installed
2. Ensure Node.js 14+ is installed
3. Install and configure XAMPP:
   - Download and install XAMPP from [official website](https://www.apachefriends.org/)
   - Start the Apache and MySQL services from XAMPP Control Panel
   - Create a new database using phpMyAdmin (http://localhost/phpmyadmin)
   - Default MySQL configuration:
     - Host: localhost
     - Port: 3306
     - Username: root
     - Password: (empty by default)

4. Configure the database connection in `backend/app/database/connections.py`:
   ```python
   SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:@localhost:3306/your_database_name"
   ```

5. Set up environment variables if needed

## Security Notes

- JWT tokens are used for authentication
- Passwords should be properly hashed in production
- File uploads are restricted to images
- CORS is configured for local development

## Development

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.