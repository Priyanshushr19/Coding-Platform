# CodeVerse 🚀

**An All-in-One Online Judge Platform** — Practice coding, compete in contests, get AI-powered assistance, and collaborate with peers.

---

## 📋 Table of Contents
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## 🎯 Problem Statement

Coding practice is fragmented across multiple platforms (LeetCode, Discord, YouTube), causing context switching and delayed feedback. CodeRunner unifies practice, contests, AI assistance, and discussions in one platform.

**Solutions:**
- 💪 **Practice** — Curated problems with test cases
- 🏆 **Compete** — Real-time contests with leaderboards
- 🤖 **Learn** — AI-powered code assistance (Gemini)
- 💬 **Collaborate** — Problem discussions & video solutions

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 💻 **Code Editor** | Monaco Editor with 10+ languages, custom input |
| 🏆 **Contests** | Scheduled contests, real-time leaderboards |
| 🤖 **AI Assistant** | Gemini-powered code explanation & debugging |
| 📝 **Problems** | CRUD operations, test cases, difficulty levels |
| 💬 **Discussions** | Problem threads, code reviews, doubt resolution |
| 🎥 **Video Solutions** | Cloudinary-hosted tutorials |
| 📊 **Analytics** | Submission history, streaks, topic proficiency |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Redux Toolkit — UI & state
- **Vite** — Build tool
- **Tailwind CSS** + DaisyUI — Styling
- **Monaco Editor** — Code editor
- **Axios** + React Router — HTTP & routing

### Backend
- **Node.js** + Express.js — Server & API
- **MongoDB** + Mongoose — Database
- **Redis** — Caching & rate limiting
- **JWT** + bcryptjs — Authentication
- **Multer** — File uploads

### Services
- **Judge0 API** — Code execution (C++, Java, Python, JS)
- **Google Gemini AI** — Code assistance
- **Cloudinary** — Media hosting

---

## 🏗️ System Architecture
React Frontend (Monaco Editor, Redux, Tailwind)
↓ HTTPS
Express.js Backend (Auth, Rate Limit, File Upload)
↓
┌────┼────┬────────────┐

↓ ↓ ↓ ↓

MongoDB Redis Judge0 Gemini AI
(Data) (Cache) (Execution) (Assistance)


**Redis Cache Strategy:**
- Problem list — 5min TTL
- Leaderboard — 1min TTL
- User profile — 15min TTL

---

## 📁 Project Structure

**Redis Cache Strategy:**
- Problem list — 5min TTL
- Leaderboard — 1min TTL
- User profile — 15min TTL



## 🚀 Installation

### Prerequisites
- Node.js (v18+), MongoDB, Redis
- Judge0, Gemini, Cloudinary API keys

### Steps

# Backend
cd Backend
npm install
# Create .env file
npm start          # http://localhost:5000

# Frontend
cd ../Frontend
npm install
npm run dev        # http://localhost:5173

# Redis (optional)
docker run -d -p 6379:6379 redis

#Backend (.env)

PORT=5000

MONGODB_URI=mongodb://localhost:27017/coderunner

REDIS_URL=redis://localhost:6379

JWT_SECRET=your_secret_key

JUDGE0_API_KEY=your_judge0_key

GEMINI_API_KEY=your_gemini_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173

 Security Features
JWT authentication (7-day expiry)

bcrypt password hashing

Admin role middleware

Rate limiting (100 req/15min, 10 submissions/min)

Input validation with Zod

Multer file validation (5MB limit)
