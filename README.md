Coding Platform
Overview
This project is a full-stack online coding platform that allows users to solve programming problems, run and submit code against test cases, participate in contests, discuss problems, and watch/upload solution videos. It includes user authentication with role-based access (user/admin), an admin panel to manage problems and contests, and AI-powered doubt-solving using Google’s Generative AI.

Features
User Authentication & Profiles: Sign up, login, logout, profile management, and profile picture uploads.
Role-Based Access Control: Admin and regular user roles, with protected admin routes for content management.
Problem Library: Browse all coding problems, view individual problem details, and see which problems a user has solved.
Online Code Execution: Integrated Monaco-based code editor with “run” and “submit” functionality backed by Judge0.
Submissions & History: Run code against sample test cases and submit final solutions against hidden tests, with submissions stored and accessible per problem/user.
Programming Contests: Create and manage coding contests with scheduled start/end times, contest-specific problem sets, and registration.
Leaderboards & Contest Stats: Real-time ranking, progress, attempts, and scoring per contest, including participants and per-problem stats.
My Contests View: Users can see contests they are registered in and track their performance.
Discussion Forum: Problem-specific discussion threads for Q&A and community interaction.
Video Solutions: Upload and view solution videos stored via Cloudinary, linked to problems/solutions.
AI Doubt Solving: AI chat endpoints powered by Google GenAI to help users understand problems and solutions.
Admin Panel: Interface for admins to create, update, delete problems and contests, and manage video content.
Tech Stack
Frontend:

React (Vite-based setup)
React Router
Redux Toolkit & React-Redux
React Hook Form + Zod
Tailwind CSS + DaisyUI
Monaco Editor (@monaco-editor/react)
Axios
Lucide React (icons)
Backend:

Node.js with Express
Mongoose (MongoDB ODM)
Redis (token blacklist/session support)
JSON Web Tokens (jsonwebtoken)
BcryptJS (password hashing)
Multer (file uploads)
Cloudinary SDK + Streamifier (media uploads)
Google GenAI (@google/generative-ai, @google/genai)
Axios (Judge0 integration)
Cookie-Parser, CORS, Validator, Dotenv
Database:

MongoDB (via Mongoose) for users, problems, submissions, contests, discussions, and videos.
Redis for JWT blacklist and token/session-related operations.
Other Tools/Services:

Judge0 (via RapidAPI) for code execution and evaluation.
Cloudinary for image and video storage/streaming.
Google Generative AI (Gemini) for AI-powered doubt solving.
Vite dev server for frontend development.
Architecture
The architecture follows a classic SPA + API server model:

Frontend (React/Vite):

A single-page application that handles routing (react-router) for public pages (home, login, signup, problems, contests) and protected pages (profile, admin dashboards, contest participation).
It uses Redux Toolkit to manage global auth state and other UI data. On app load, an authSlice action (checkAuth) is dispatched to verify the currently authenticated user via the backend.
Pages and components communicate with the backend via Axios, using RESTful JSON APIs.
Backend (Express):

Exposes REST API endpoints grouped by feature under route prefixes such as /user, /problem, /submission, /api/contests, /discussion, /video, and /ai.
Uses middleware to:
Parse JSON and URL-encoded bodies.
Handle CORS for the frontend origin (e.g., http://localhost:5173) with credentials.
Parse cookies and validate JWTs for protected routes.
Use Redis to blacklist tokens on logout and enforce secure auth flows.
Controllers implement domain logic for authentication, problem management, submissions, contests, discussions, videos, and AI integration.
Utility modules handle external services (Cloudinary, Judge0, Google GenAI) and shared validation logic.
Database Layer (MongoDB + Redis):

MongoDB stores persistent entities (User, Problem, Submission, Contest, Discussion, SolutionVideo).
Mongoose models and schemas define relations and lifecycle hooks (e.g., cascading delete of submissions when a user is removed).
Redis is used primarily for JWT blacklist / token invalidation, ensuring that logged-out tokens are no longer accepted by the userMiddleware and adminMiddleware.
Data flow example:

User logs in on the frontend → Axios POST to /user/login → backend verifies credentials, issues JWT in HTTP-only cookie.
React app dispatches checkAuth to verify session → backend /user/check validates JWT, loads user from MongoDB, returns user details.
Authenticated user opens a problem or contest → frontend calls /problem/... or /api/contests/... → backend fetches data from MongoDB, optionally evaluates permissions and contest status, and returns JSON.
When running/submitting code, frontend sends code and language to /submission/run/:id or /submission/submit/:id (or contest-specific endpoints) → backend calls Judge0 → stores/updates submissions and returns results.
Media uploads (profile pictures, solution videos) go through multer → streamed to Cloudinary → Cloudinary URLs stored in MongoDB documents.
Folder Structure
Root

Backend/

server.js: Express application entry point. Sets up CORS, JSON parsing, cookies, DB connections, Redis, and registers all route groups:
/user → src/routes/userAuth.js
/problem → src/routes/ProblemCreator.js
/submission → src/routes/submit.js
/ai → src/routes/aiChatting.js
/video → src/routes/videoCreator.js
/discussion → src/routes/discussionRouter.js
/api/contests → src/routes/contestRoutes.js
package.json: Backend dependencies and scripts.
src/
config/
db.js: MongoDB connection (uses MONGO_URI).
redis.js: Redis client configuration.
models/
user.js: User schema (credentials, roles, profile info, cascade delete for submissions).
problem.js: Programming problem metadata and test cases.
submission.js: User submissions (code, language, status, verdict, timestamps).
contestModel.js: Contest definition (time window, problems, rules, participants).
discussion.js: Discussion threads and replies for problems.
solutionVideo.js: Metadata linking solution videos to problems/solutions.
routes/
userAuth.js: User and admin auth, profile endpoints.
ProblemCreator.js: Problem CRUD and problem-related queries.
submit.js: Problem submission and “run code” endpoints.
contestRoutes.js: Contest management, registration, problems, rankings, and stats.
discussionRouter.js: Discussion thread routes.
videoCreator.js: Video upload and retrieval routes.
aiChatting.js: AI doubt-solving endpoints.
controllers/
userAth.js: User and admin auth logic (register, login, logout, profile updates).
userProblem.js: User-facing problem retrieval and solved-status handling.
userSubmmission.js: Submission and scoring logic, including Judge0 integration.
contest.js: Contest lifecycle, registration, problem access, submissions, ranking, and stats.
discussion.js: Discussion creation, listing, and replies.
videoSection.js: Video upload and association logic with Cloudinary.
solveDoubt.js: Google GenAI integration for AI-based answers/explanations.
middleware/
userMiddleware.js: Validates JWT from cookies, checks Redis blacklist, loads user, attaches req.user.
adminMiddleware.js: Ensures the authenticated user has admin role before allowing access to admin routes.
upload.js (or similar): Multer configuration for handling file uploads.
utils.js/
userAuth.js: Helpers for user validation and related utilities.
cloudinary.js: Cloudinary configuration and helper functions.
ProblemUtility.js: Judge0 client: prepares payload, sends code for execution, parses responses.
Other shared helpers for formatting responses and validations.
Frontend/

package.json: Frontend dependencies (React, Vite, Tailwind, DaisyUI, Redux, etc.).
vite.config.*: Vite configuration.
tailwind.config.*: Tailwind and DaisyUI configuration.
src/
App.jsx: Main application component and router; sets up routes for home, auth, problems, contests, admin, etc., and bootstraps auth state (e.g., checkAuth).
pages/
Home.jsx: Landing page and overview.
Login.jsx, Signup.jsx: Authentication pages.
Profile.jsx: User profile details and settings.
ProblemPage.jsx: Main problem-solving page with integrated editor and problem details.
AllProblems.jsx: Lists all problems with filters/search.
ContestPages (e.g., Contests.jsx, ContestDetail.jsx, ContestResults.jsx, MyContests.jsx): Contest browsing and participation.
Admin.jsx: Entry page for admin panel.
components/
Admin/: Admin dashboard and tools:
Components to create, update, and delete problems.
Components to create, update, and delete contests.
Components to upload and manage solution videos.
Contest/:
Contest list, contest details, leaderboard, participants view, my-contests view, contest problem view, and results.
Editor/:
Monaco editor wrapper for writing code, run/submit controls, submission history, and possibly per-problem discussion widget and AI help triggers.
Shared components for navigation, layouts, forms, and UI elements.
slices/
authSlice.js (and possibly others): Redux slices for authentication and user data, contest state, etc.
styles/ and other configuration files for Tailwind/DaisyUI.
Installation
git clone <repo-url>
cd <project-folder>
npm install
Note: The project is organized into separate Frontend and Backend folders. Depending on your workflow, you may need to run npm install in each subfolder:

cd Backend
npm install
cd ../Frontend
npm install
Environment Variables
Create .env files (typically in Backend/) with at least the following variables:

Core Server & Database

PORT: Port for the Express server (e.g., 5000).
MONGO_URI: MongoDB connection string (e.g., Atlas or local MongoDB).
Authentication & Security

JWT_KEY: Secret key used to sign and verify JWT tokens.
NODE_ENV: Environment (development or production) used for security-related behaviors (cookies, error handling, etc.).
Cloudinary (Media Storage)

CLOUDINARY_CLOUD_NAME: Cloudinary cloud name.
CLOUDINARY_API_KEY: Cloudinary API key.
CLOUDINARY_API_SECRET: Cloudinary API secret.
Judge0 (Code Execution)

JUDGE0_KEY: RapidAPI key or API key used to authenticate Judge0 requests.
Google Generative AI

GEMINI_API_KEY: API key for Google’s Generative AI (Gemini) used in AI doubt-solving endpoints.
Redis

Redis connection details may be required depending on the redis.js configuration (e.g., REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD) if not using default localhost settings.
Adjust or add variables as required by your deployment environment and the specific configuration in Backend/src/config/*.js and utility files.

Running the Project
Backend:

cd Backend
npm install   # if not already done
npm run dev   # or npm start, depending on package.json scripts
This will start the Express server on the port defined by PORT (default often 5000).

Frontend:

cd Frontend
npm install   # if not already done
npm run dev
This will start the Vite dev server (commonly on http://localhost:5173). The frontend expects the backend to be running and accessible with proper CORS configuration, typically at http://localhost:5000.

API Routes
Below are the major API route groups and representative endpoints (all prefixed by http://<backend-host>:<PORT>):

User & Auth (/user)

POST /user/register: Register a new user.
POST /user/login: Login and receive JWT in HTTP-only cookie.
POST /user/logout: Logout and blacklist JWT in Redis.
POST /user/admin/register: Create a new user as an admin.
DELETE /user/deleteProfile: Delete the currently authenticated user (and cascade delete submissions).
PUT /user/update-profile-pic: Upload and update profile picture (Cloudinary).
GET /user/check: Validate current session and return authenticated user info.
Problems (/problem)

POST /problem/create: Admin-only create a new coding problem.
PUT /problem/update/:id: Admin-only update a problem.
DELETE /problem/delete/:id: Admin-only delete a problem.
GET /problem/problemById/:id: Get details of a specific problem.
GET /problem/getAllProblem: Get the list of all problems.
GET /problem/problemSolvedByUser: Get problems solved by the current user.
GET /problem/submittedProblem/:pid: Get submissions for a given problem.
Submissions & Code Execution (/submission)

POST /submission/run/:id: Run code against sample/visible test cases for a problem.
POST /submission/submit/:id: Submit final solution for evaluation against hidden cases and store result.
Contests (/api/contests)

Public:
GET /api/contests/: List all contests with basic stats and filters.
GET /api/contests/:id: Get details for a specific contest, including time-based info and per-user ranking context.
GET /api/contests/:id/leaderboard: Contest leaderboard (scores, ranks, progress).
GET /api/contests/:id/participants: List contest participants.
GET /api/contests/:id/stats: Aggregated contest statistics.
User Protected (requires login):
GET /api/contests/:id/problems: Get contest problems visible to the user (with solved status).
POST /api/contests/:id/register: Register the authenticated user for the contest.
GET /api/contests/:contestId/problems/:problemId: Get a specific contest problem (with visible testcases, points).
POST /api/contests/:contestId/problems/:problemId/run: Run code for a contest problem against sample testcases.
POST /api/contests/submit/:contestId/problems/:problemId/submit: Submit solution for scoring; updates contest results/leaderboard.
GET /api/contests/:contestId/problems/:problemId/submissions: Get submissions by the current user for a contest problem.
GET /api/contests/user/my-contests: Get contests the authenticated user is participating in.
Admin Protected:
POST /api/contests/: Create a new contest.
PUT /api/contests/:id: Update contest details.
DELETE /api/contests/:id: Delete a contest and related data.
Discussions (/discussion)

Endpoints for creating, listing, and replying to discussion threads linked to problems (e.g., create a thread for a problem, add replies, fetch thread lists).
Video Solutions (/video)

Endpoints for uploading solution videos via multer and Cloudinary, and retrieving associated videos for problems/solutions.
AI Doubt Solving (/ai)

Endpoints that accept user questions and optional problem context and respond using Google GenAI (GEMINI_API_KEY), providing explanations and hints.
Note: Exact request/response bodies and additional endpoints can be inspected directly in the corresponding route and controller files under Backend/src/routes and Backend/src/controllers.

Screenshots
Add screenshots or GIFs of the main pages here (Home, Problem page with editor, Contest detail/leaderboard, Admin panel, etc.).

Example structure:

screenshots/home.png
screenshots/problem-page.png
screenshots/contest-leaderboard.png
screenshots/admin-dashboard.png
Future Improvements
Enhanced Problem Analytics: Add detailed per-problem analytics (acceptance rates, difficulty calibration, tags).
More Languages & Runtimes: Broaden language support and optimize Judge0 integration for performance and caching.
In-Browser Testing Tools: Allow users to define and save custom testcases in the UI.
Real-Time Features: Use WebSockets for live contest updates (leaderboard, participant status, announcements).
Notifications System: Email or in-app notifications for contest reminders, new problems, and replies in discussions.
Pluggable Auth Providers: Support social logins (GitHub, Google) in addition to email/password.
Mobile-Responsive Enhancements: Further refine the responsive design for small screens and tablets.
Moderation Tools: Add more robust moderation, reporting, and content management for discussions and videos.
Author
Name: Priyanshu Sharma
GitHub: https://github.com/Priyanshushr19
