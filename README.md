
# TrickIT - AI Powered Social Media Platform

**TrickIT** is a modern **AI-powered social media platform** built with a **FastAPI backend and React frontend**.
The platform allows users to share posts and media while automatically moderating content using **Large Language Models (LLMs)** and **Machine Learning pipelines**.

The system integrates **CI/CD automation, AI moderation, and continuous ML retraining** to classify posts as **educational or non-educational content**, enabling smarter knowledge-sharing communities.

---

# Key Features

## User Authentication & Security

* Secure user registration with email and password
* JWT-based authentication
* Forgot password with OTP verification
* Password reset functionality
* Protected API routes
* CORS protection for secure frontend-backend communication

---

# Social Media Platform Features

* User profile management
* Post creation and media sharing
* Image uploads
* Content storage with static file serving
* Modular API architecture

---

# AI Moderation System

TrickIT automatically analyzes posts using an **LLM moderation pipeline**.

### Workflow

1. User submits a post
2. Post status becomes **Pending**
3. Jenkins pipeline triggers LLM moderation
4. Post is classified as:

   * **Educational**
   * **Non-Educational**
5. Post status updated to:

   * **Approved**
   * **Rejected**

---

# Continuous Machine Learning Pipeline

TrickIT improves its ML model automatically using real user data.

### Dataset Generation

Every pipeline cycle:

* Approved posts tagged **educational → label = 1**
* Rejected posts → **label = 0**

Example dataset:

```
text,label
"Binary Search Optimization Trick",1
"Check out my gaming livestream",0
"Dynamic Programming strategy",1
```

This dataset is saved as:

```
data/dataset.csv
```

---

# Automated Model Retraining

The Jenkins pipeline automatically:

1. Fetches approved and rejected posts
2. Generates dataset CSV
3. Retrains the ML model
4. Deploys updated model for inference

---

# Tech Stack

## Backend

* **FastAPI** – Python web framework
* **SQLAlchemy** – ORM
* **MySQL** (XAMPP)
* **JWT Authentication**
* **FastAPI Static File Handling**
* **CORS Middleware**

---

## Machine Learning

* Scikit-learn
* Pandas
* NumPy
* Text classification pipeline
* Dataset generation scripts
* Model retraining automation

---

## DevOps & Automation

* **Jenkins CI/CD**
* **Docker**
* **Kubernetes (Minikube)**
* **Automated dataset pipeline**

---

## Frontend

* React **19.2.0**
* React Router DOM **7.9.3**
* Axios **1.12.2**
* Material UI
* Tailwind CSS **3.3**
* Jest + React Testing Library

---

# System Architecture

```
Users
  │
  ▼
React Frontend
  │
  ▼
FastAPI Backend
  │
  ├── Authentication API
  ├── Post Upload API
  ├── File Upload Service
  │
  ▼
Database (MySQL)
  │
  ▼
Jenkins Pipeline
  │
  ├── Trigger LLM Moderation
  ├── Update Post Status
  ├── Wait 5 Minutes
  ├── Generate Dataset
  └── Retrain ML Model
```

---

# Project Structure

```
TrickIT/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── database/
│   │   ├── ml_model/
│   │   ├── model/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── uploads/
│   │   ├── utils/
│   │   └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
├── k8s/
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

# Setup Instructions

# Backend Setup

## 1 Start XAMPP

Open **XAMPP Control Panel**

Start:

* Apache
* MySQL

Verify MySQL running on:

```
localhost:3306
```

---

## 2 Create Database

Open:

```
http://localhost/phpmyadmin
```

Create a new database:

```
trickit_db
```

---

## 3 Configure Database

Edit:

```
backend/app/database/connections.py
```

```
SQLALCHEMY_DATABASE_URL =
"mysql+mysqlconnector://root:@localhost:3306/trickit_db"
```

---

## 4 Navigate to Backend

```
cd backend
```

---

## 5 Install Dependencies

```
pip install -r requirements.txt
```

Install ML dependencies

```
pip install scikit-learn pandas numpy
```

---

## 6 Run Backend

```
uvicorn app.main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

# Frontend Setup

Navigate to frontend:

```
cd frontend
```

Install dependencies:

```
npm install
```

Run frontend:

```
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

# API Endpoints

Base URL

```
http://localhost:8000
```

### Health Check

```
GET /
```

Returns:

```
Hello World
```

---

### API Routes

Prefix:

```
/api
```

Example:

```
/api/register
/api/login
/api/posts
/api/upload
```

---

### Static File Access

Uploaded media files:

```
/uploads/*
```

Example

```
http://localhost:8000/uploads/image.jpg
```

---

# Jenkins Pipeline Workflow

The CI/CD pipeline performs:

1. Fetch posts with **status = pending**
2. Trigger **LLM moderation**
3. Update status to **approved/rejected**
4. Wait **5 minutes**
5. Generate dataset CSV
6. Retrain ML model

---

# Example Dataset

| Post                      | Label |
| ------------------------- | ----- |
| Binary search explanation | 1     |
| My gaming stream          | 0     |
| Dynamic programming trick | 1     |

---

# Security Notes

* JWT authentication
* Password hashing recommended in production
* File upload restrictions
* CORS protection
* API route validation

---

# Development Workflow

1 Fork repository

2 Create branch

```
git checkout -b feature-name
```

3 Commit changes

```
git commit -m "Added feature"
```

4 Push branch

```
git push origin feature-name
```

5 Create Pull Request

---

# Future Improvements

* AI recommendation system
* Real-time moderation
* User reputation scoring
* Grafana + Prometheus monitoring
* Advanced NLP classification
* Content recommendation feed

---

# License

MIT License

