import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/home'
import Login from './pages/login'
import Signup from './pages/signup'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './slices/authSlice'
import ProblemPage from './pages/ProblemPage'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import AllProblemsPage from './pages/AllProblems'
import AdminPanel from './components/Admin/AdminPanel'
import AdminDelete from './components/Admin/AdminDelete'
import AdminUpdate from './components/Admin/AdminUpdate'
import AdminVideo from './components/Admin/AdminVideo'
import AdminUpload from './components/Admin/AdminUpload'
import UpdateProblem  from './components/Admin/UpdateProblem'
import CreateContestPage from './components/Admin/CreateContest'
import UpdateContestPage from './components/Admin/UpdateContest'
import DeleteContestPage from './components/Admin/DeleteContest'
import MyContestsPage from './components/Contest/MyContest'
import ContestPage from './components/Contest/ContestPage'
import ContestDetail from './components/Contest/ContestDetailPage'
import ContestResultsPage from './components/Contest/ContestResultPage'
import ContestProblemPage from './components/Contest/ContestProblem'


function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Function to initialize authentication
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      try {
        // Dispatch checkAuth to verify session
        await dispatch(checkAuth()).unwrap();
        
        console.log('Auth check completed');
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeAuth();
    }
  }, [dispatch, initialized]);

  // Sync user data from localStorage on mount
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log('User authenticated, syncing profile picture...');
      
      // Get user data from localStorage (where we store profile picture)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Stored user:', storedUser);
      
      // If localStorage has profilePic but Redux doesn't, sync it
      if (storedUser.profilePic && (!user.profilePic || user.profilePic !== storedUser.profilePic)) {
        console.log('Syncing profile picture from localStorage...');
        dispatch(updateProfilePic(storedUser.profilePic));
      }
    }
  }, [loading, isAuthenticated, user, dispatch]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-purple-400"></span>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('App - Loading:', loading);
  console.log('App - Initialized:', initialized);
  console.log('App - Authenticated:', isAuthenticated);
  console.log('App - User:', user);
  console.log('App - User Role:', user?.role);

  return (
    <>
      {/* <Routes>
        <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to="/signup" />}></Route>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup></Signup>}></Route>
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate/> : <Navigate to="/" />} />
        <Route path="/admin/update-problem/:id" element={isAuthenticated && user?.role === 'admin' ? <UpdateProblem/> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
        <Route path='/profile' element={isAuthenticated? <Profile/>:<Navigate to="/"/> }></Route>
        <Route path='/problems' element={<AllProblemsPage/>}></Route>
        <Route path="/contests/:id" element={isAuthenticated ? <ContestDetail /> :  <Navigate to="/" />} />
        <Route path='/contests' element={<ContestPage/>}></Route>
        <Route path="/my-contests" element={isAuthenticated ? <MyContestsPage /> : <Navigate to="/" />} />
        <Route path="/contests/:contestId/problem/:problemId" element={<ContestProblemPage />} />
        <Route path='/admin/contests/create' element={<CreateContestPage/>} ></Route>
        <Route path='/admin/contests/update' element={<UpdateContestPage/>} ></Route>
        <Route path='/admin/contests/delete' element={<DeleteContestPage/>} ></Route>
        <Route path="/contests/:id/results" element={isAuthenticated ? <ContestResultsPage /> : <Navigate to="/" />} />
        
      </Routes> */}
      <Routes>

        <Route path='/' element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />

        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />

        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />

        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} />

        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/login" />} />

        <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/login" />} />

        <Route path="/admin/update-problem/:id" element={isAuthenticated && user?.role === 'admin' ? <UpdateProblem /> : <Navigate to="/login" />} />

        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/login" />} />

        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/login" />} />

        <Route path='/profile' element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

        <Route path='/problems' element={<AllProblemsPage />} />

        <Route path="/problem/:problemId" element={<ProblemPage />} />

        <Route path="/contests/:id" element={isAuthenticated ? <ContestDetail /> : <Navigate to="/login" />} />

        <Route path='/contests' element={<ContestPage />} />

        <Route path="/my-contests" element={isAuthenticated ? <MyContestsPage /> : <Navigate to="/login" />} />

        <Route path="/contests/:contestId/problem/:problemId" element={<ContestProblemPage />} />

        <Route path='/admin/contests/create' element={isAuthenticated && user?.role === 'admin' ? <CreateContestPage /> : <Navigate to="/login" />} />

        <Route path='/admin/contests/update' element={isAuthenticated && user?.role === 'admin' ? <UpdateContestPage /> : <Navigate to="/login" />} />

        <Route path='/admin/contests/delete' element={isAuthenticated && user?.role === 'admin' ? <DeleteContestPage /> : <Navigate to="/login" />} />
        
        <Route path="/contests/:id/results" element={isAuthenticated ? <ContestResultsPage /> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App

// In your App.jsx or routing file
{/* <Routes>
  <Route path="/" element={<Homepage />} />
  <Route path="/contests" element={<ContestPage />} />
  <Route path="/contests/:id" element={<ContestDetail />} />
  <Route path="/my-contests" element={<MyContestsPage />} />
  <Route path="/leaderboard" element={<LeaderboardPage />} />
  {/* ... other routes */}
// </Routes> */}
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
// import { Trophy, Clock, Calendar, Award, ChevronLeft } from 'lucide-react';

// const MyContestsPage = () => {
//   const [contests, setContests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchMyContests();
//   }, []);

//   const fetchMyContests = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/contests/user/my-contests', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
      
//       if (data.success) {
//         setContests(data.contests || []);
//       }
//     } catch (error) {
//       console.error('Error fetching contests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... rest of the MyContestsPage component
// };

// export default MyContestsPage;