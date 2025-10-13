# TrickIT - Social Media Platform

A modern and secure social media platform built with FastAPI backend and React frontend, featuring user authentication, profile management, and media sharing capabilities.

## Features

- User Authentication & Security
  - Secure registration with email and password
  - JWT-based authentication system
  - Forgot password with OTP verification
  - Password reset functionality
  - CORS protection for API endpoints

- File Management
  - Secure file upload system
  - Media storage in dedicated uploads directory
  - Static file serving for uploaded content

- API Features
  - RESTful API architecture
  - Health check endpoint
  - Modular routing system
  - Database ORM integration

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- MySQL (via XAMPP)
- JWT for authentication
- Static file handling with FastAPI
- CORS middleware for security
- Machine Learning Model Integration

### ML Components
- Machine Learning model integration
- Model inference endpoints
- Data processing pipelines

### Frontend
- React 19.2.0
- React Router DOM 7.9.3 for navigation
- Axios 1.12.2 for API calls
- Material-UI (@mui/material)
- Tailwind CSS 3.3.0 for styling
- Modern testing setup with Jest and React Testing Library

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

5. Set up ML Model dependencies:
   ```bash
   pip install scikit-learn pandas numpy
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   Server will run on http://localhost:8000

### ML Model
The project includes a machine learning component in the `app/ml_model/` directory that integrates with the main application.

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
│   │   ├── database/
│   │   ├── model/
│   │   ├── ml_model/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── uploads/
│   │   ├── main.py
│   │   └── __pycache__/
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    └── tailwind.config.js
```

## API Endpoints

### Base URL: http://localhost:8000

### Public Endpoints
- `GET /` - Health check endpoint, returns "Hello World"

### API Routes (prefix: /api)
All API routes are prefixed with `/api` and tagged as "register"

### Static Files
- `/uploads/*` - Serves static files from the uploads directory

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