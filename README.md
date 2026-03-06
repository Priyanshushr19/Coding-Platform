Coding Platform
Overview

This project is a full-stack online coding platform that allows users to solve programming problems, run and submit code against test cases, participate in contests, discuss problems, and watch/upload solution videos.

The platform includes:

User authentication with role-based access (User/Admin)

Admin panel for managing problems and contests

AI-powered doubt solving using Google Generative AI

Online code execution using Judge0

Features
User Authentication & Profiles

Sign up, login, and logout functionality

User profile management

Profile picture uploads via Cloudinary

Role-Based Access Control

Admin and regular user roles

Protected admin routes for managing content

Problem Library

Browse all coding problems

View problem details

Track solved problems per user

Online Code Execution

Monaco-based code editor

Run code against sample test cases

Submit final solutions using Judge0

Submissions & History

Run solutions against visible test cases

Submit solutions against hidden test cases

Store submission history for each user

Programming Contests

Create and manage contests

Scheduled start and end times

Contest-specific problem sets

Contest registration system

Leaderboards & Contest Stats

Real-time rankings

Attempts tracking

Scoring per contest

Participant statistics

My Contests View

Users can view:

Registered contests

Performance in contests

Discussion Forum

Problem-specific discussion threads

Q&A and community interaction

Video Solutions

Upload solution videos

Watch problem explanations

Media stored using Cloudinary

AI Doubt Solving

AI chat endpoints powered by Google Generative AI (Gemini)

Helps users understand problems and solutions

Admin Panel

Admins can:

Create, update, and delete problems

Manage contests

Manage video content

Tech Stack
Frontend

React (Vite)

React Router

Redux Toolkit

React Hook Form + Zod

Tailwind CSS

DaisyUI

Monaco Editor

Axios

Lucide React Icons

Backend

Node.js

Express.js

MongoDB + Mongoose

Redis

JSON Web Token (JWT)

BcryptJS

Multer

Cloudinary SDK

Google Generative AI

Axios (Judge0 Integration)

Cookie Parser

CORS

Validator

Dotenv

Database
MongoDB

Stores:

Users

Problems

Submissions

Contests

Discussions

Solution Videos

Redis

Used for:

JWT blacklist

Token/session management

External Services
Judge0

Used for:

Code execution

Code evaluation

Multi-language support

Cloudinary

Used for:

Image storage

Video streaming

Google Generative AI (Gemini)

Used for:

AI-powered doubt solving

Architecture

The platform follows a Single Page Application + API Server architecture.

Frontend (React + Vite)

Handles routing using React Router

Uses Redux Toolkit for global state

Communicates with backend through Axios REST APIs

Auth state is validated using checkAuth

Main pages include:

Home

Login

Signup

Problems

Contests

Profile

Admin Dashboard

Backend (Express)

Provides REST APIs under routes such as:

/user
/problem
/submission
/api/contests
/discussion
/video
/ai

Responsibilities:

Authentication

Problem management

Contest management

Code execution

Discussion system

Video management

AI integration

Database Layer
MongoDB

Stores persistent data including:

Users

Problems

Submissions

Contests

Discussions

Videos

Redis

Used for:

Token invalidation

Session management

Example Data Flow

1️⃣ User logs in from frontend
2️⃣ Axios sends request to

POST /user/login

3️⃣ Backend verifies credentials and issues JWT cookie

4️⃣ Frontend calls

GET /user/check

to verify authentication.

5️⃣ User opens a problem

GET /problem/problemById/:id

6️⃣ User runs code

POST /submission/run/:id

7️⃣ Backend sends code to Judge0 and returns results.

Folder Structure
Root
Backend/
Frontend/
README.md
Backend Structure
Backend
│
├── server.js
├── package.json
│
└── src
    ├── config
    │   ├── db.js
    │   └── redis.js
    │
    ├── models
    │   ├── user.js
    │   ├── problem.js
    │   ├── submission.js
    │   ├── contestModel.js
    │   ├── discussion.js
    │   └── solutionVideo.js
    │
    ├── routes
    │   ├── userAuth.js
    │   ├── ProblemCreator.js
    │   ├── submit.js
    │   ├── contestRoutes.js
    │   ├── discussionRouter.js
    │   ├── videoCreator.js
    │   └── aiChatting.js
    │
    ├── controllers
    │   ├── userAuth.js
    │   ├── userProblem.js
    │   ├── userSubmission.js
    │   ├── contest.js
    │   ├── discussion.js
    │   ├── videoSection.js
    │   └── solveDoubt.js
    │
    ├── middleware
    │   ├── userMiddleware.js
    │   ├── adminMiddleware.js
    │   └── upload.js
    │
    └── utils
        ├── cloudinary.js
        ├── ProblemUtility.js
        └── userAuth.js
Frontend Structure
Frontend
│
├── package.json
├── vite.config.js
├── tailwind.config.js
│
└── src
    ├── App.jsx
    │
    ├── pages
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Profile.jsx
    │   ├── ProblemPage.jsx
    │   ├── AllProblems.jsx
    │   ├── Contests.jsx
    │   ├── ContestDetail.jsx
    │   └── Admin.jsx
    │
    ├── components
    │   ├── Admin
    │   ├── Contest
    │   ├── Editor
    │   └── Shared UI
    │
    ├── slices
    │   └── authSlice.js
    │
    └── styles
Installation

Clone the repository

git clone <repo-url>
cd <project-folder>

Install dependencies

cd Backend
npm install

cd ../Frontend
npm install
Environment Variables

Create a .env file inside Backend.

Core Server
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
Authentication
JWT_KEY=your_jwt_secret
Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
Judge0
JUDGE0_KEY=your_rapidapi_key
Google Generative AI
GEMINI_API_KEY=your_gemini_api_key
Redis
REDIS_URL=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
Running the Project
Start Backend
cd Backend
npm run dev

Backend runs on:

http://localhost:5000
Start Frontend
cd Frontend
npm run dev

Frontend runs on:

http://localhost:5173
API Routes
User & Authentication
POST /user/register
POST /user/login
POST /user/logout
POST /user/admin/register
DELETE /user/deleteProfile
PUT /user/update-profile-pic
GET /user/check
Problems
POST /problem/create
PUT /problem/update/:id
DELETE /problem/delete/:id
GET /problem/problemById/:id
GET /problem/getAllProblem
GET /problem/problemSolvedByUser
GET /problem/submittedProblem/:pid
Submissions
POST /submission/run/:id
POST /submission/submit/:id
Contests
GET /api/contests
GET /api/contests/:id
GET /api/contests/:id/leaderboard
GET /api/contests/:id/participants
GET /api/contests/:id/stats
POST /api/contests/:id/register
POST /api/contests
PUT /api/contests/:id
DELETE /api/contests/:id
Discussions
/discussion

Problem discussion threads and replies.

Video Solutions
/video

Upload and fetch solution videos.

AI Doubt Solving
/ai

Uses Google Gemini AI for explanations and hints.

Screenshots

Add screenshots inside:

/screenshots

Example:

screenshots/home.png
screenshots/problem-page.png
screenshots/contest-leaderboard.png
screenshots/admin-dashboard.png
Future Improvements

Problem analytics and acceptance rates

Support more programming languages

Custom testcase creation

WebSocket real-time contest updates

Notification system

Social authentication (Google/GitHub)

Improved mobile responsiveness

Discussion moderation tools

Author

Priyanshu Sharma

GitHub
https://github.com/Priyanshushr19
