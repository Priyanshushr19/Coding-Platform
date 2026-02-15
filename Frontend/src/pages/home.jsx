import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateProfilePicture } from '../slices/authSlice';
import { 
  fetchProblems, 
  fetchSolvedProblems, 
  setFilters 
} from '../slices/problemSlice';
import { 
  Trophy, 
  Clock, 
  Calendar,
  Users,
  Award,
  ChevronRight,
  Home,
  Folder,
  BarChart,
  Users as UsersIcon
} from 'lucide-react';
import logo from '../assets/logo2.png';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems, filters, loading, error } = useSelector((state) => state.problems);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [contests, setContests] = useState([]);
  const [contestLoading, setContestLoading] = useState(false);
  const [showContestDropdown, setShowContestDropdown] = useState(false);
  const [ongoingContests, setOngoingContests] = useState([]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const result = await dispatch(updateProfilePicture(formData)).unwrap();
      
      setPopupMessage("✅ Profile picture updated successfully!");
      setPopupType("success");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);

    } catch (err) {
      setPopupMessage("❌ Failed to update profile picture");
      setPopupType("error");
      setShowPopup(true);
      
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  // Add this function near the top of your Homepage component, after the other helper functions
  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return 'Ended';
    
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  useEffect(() => {
    // Fetch problems only if not already loaded
    if (problems.length === 0) {
      dispatch(fetchProblems());
    }
    
    // Fetch solved problems only if user exists and not already loaded
    if (user && solvedProblems.length === 0) {
      dispatch(fetchSolvedProblems(user.id));
    }

    // Fetch contests
    fetchContests();
  }, [dispatch, user, problems.length, solvedProblems.length]);

  const formatDate = (dateString) => {
  try {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid date';
  }
};


  const fetchContests = async () => {
    setContestLoading(true);
    try {
      // REMOVED localStorage token logic
      // Just make the request - cookies will handle authentication automatically
      const response = await fetch('/api/contests?status=ongoing&limit=3', {
        credentials: 'include' // Important for sending cookies
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContests(data.contests || []);
        // Filter for ongoing contests only
        setOngoingContests(data.contests?.filter(c => c.status === 'ongoing') || []);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setContestLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Optimized lookup for solved problems
  const solvedSet = useMemo(() =>
    new Set(solvedProblems.map(p => p._id || p.problemId)),
    [solvedProblems]
  );

  const filteredProblems = problems.filter(problem => {
    if (!problem) return false;

    const difficultyMatch =
      filters.difficulty === 'all' ||
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

    const tagMatch =
      filters.tag === 'all' ||
      problem.tags?.toLowerCase() === filters.tag.toLowerCase();

    const statusMatch =
      filters.status === 'all' ? true :
        filters.status === 'solved' ? solvedSet.has(problem._id) :
          !solvedSet.has(problem._id);

    return difficultyMatch && tagMatch && statusMatch;
  });

  // In your Homepage.jsx, update the getProfilePictureUrl function
const getProfilePictureUrl = () => {
  // First check if we have a profilePic in Redux state
  if (user?.profilePic) {
    const profilePic = user.profilePic;
    if (profilePic.startsWith("http") || profilePic.startsWith("data:")) {
      return profilePic;
    }
    return `http://localhost:5005/${profilePic}`;
  }
  
  // Fallback to localStorage (in case Redux hasn't synced yet)
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.profilePic) {
      const storedPic = storedUser.profilePic;
      if (storedPic.startsWith("http") || storedPic.startsWith("data:")) {
        return storedPic;
      }
      return `http://localhost:5005/${storedPic}`;
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
  }
  
  // Default fallback
  return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
};

// Also, add a useEffect to sync profile picture on mount
useEffect(() => {
  // Sync profile picture from localStorage to Redux on component mount
  if (user) {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.profilePic && (!user.profilePic || user.profilePic !== storedUser.profilePic)) {
        console.log('Syncing profile picture in Homepage...');
        dispatch(updateProfilePic(storedUser.profilePic));
      }
    } catch (error) {
      console.error('Error syncing profile picture:', error);
    }
  }
}, [user, dispatch]);

  if (loading && problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-purple-400"></div>
          <p className="text-white mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      {/* Popup Toast */}
      {showPopup && (
        <div className="toast toast-top toast-end z-50">
          <div className={`alert ${popupType === "success" ? "alert-success" : "alert-error"} shadow-lg`}>
            <span>{popupMessage}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar bg-black/80 text-white px-6 py-4 border-b border-purple-500 sticky top-0 z-40">
        <div className="flex-1 flex items-center gap-4">
          <img
            src={logo}
            alt="logo"
            className="w-10 h-10 rounded-lg"
          />
          <NavLink
            to="/"
            className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            CodeVerse
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex justify-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-purple-300 hover:bg-purple-600/50'
              }`
            }
          >
            <Home size={20} />
            Home
          </NavLink>
          
          <NavLink
            to="/problems"
            className={({ isActive }) => 
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-purple-600 text-white' 
                  : 'text-purple-300 hover:bg-purple-600/50'
              }`
            }
          >
            <Folder size={20} />
            Problems
          </NavLink>
          
          {/* Contests Dropdown */}
          <div className="relative" 
               onMouseEnter={() => setShowContestDropdown(true)}
               onMouseLeave={() => setShowContestDropdown(false)}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-600/60 transition-colors">
              <Trophy size={20} />
              Contests
              {ongoingContests.length > 0 && (
                <span className="badge badge-xs bg-red-500 border-0 text-white animate-pulse">
                  {ongoingContests.length}
                </span>
              )}
            </button>
            
            {showContestDropdown && (
              <div className="absolute top-full left-0  w-80 bg-black border border-purple-500 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">Live Contests</h3>
                    <NavLink 
                      to="/contests" 
                      className="text-sm text-purple-400 hover:text-purple-300"
                      onClick={() => setShowContestDropdown(false)}
                    >
                      View all
                    </NavLink>
                  </div>
                  
                  {contestLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="loading loading-spinner loading-sm text-purple-400"></div>
                    </div>
                  ) : ongoingContests.length > 0 ? (
                    <div className="space-y-3">
                      {ongoingContests.slice(0, 2).map(contest => (
                        <div 
                          key={contest._id}
                          className="p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg cursor-pointer hover:bg-purple-900/50 transition-colors"
                          onClick={() => {
                            navigate(`/contests/${contest._id}`);
                            setShowContestDropdown(false);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white text-sm truncate">{contest.title}</h4>
                            <span className="badge badge-xs bg-green-500/20 text-green-400 border-green-500">
                              LIVE
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-purple-300">
                            <Clock size={12} />
                            <span>{calculateTimeRemaining(contest.endTime)} left</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No active contests
                    </div>
                  )}
                  
                  <div className="border-t border-purple-500/30 mt-4 pt-4">
                    <button 
                      onClick={() => {
                        navigate('/contests');
                        setShowContestDropdown(false);
                      }}
                      className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700 w-full"
                    >
                      <Trophy size={16} className="mr-2" />
                      Browse All Contests
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          
          
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:bg-purple-600/50'
                }`
              }
            >
              <UsersIcon size={20} />
              Admin
            </NavLink>
          )}
        </div>

        {/* Profile Section */}
        <div className="flex-none gap-4 items-center">
          {/* Ongoing Contest Badge (if any) */}
          {ongoingContests.length > 0 && ongoingContests[0] && (
            <div 
              className="flex items-center gap-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg px-3 py-1.5 cursor-pointer hover:border-purple-400 transition-colors mr-3"
              onClick={() => navigate(`/contests/${ongoingContests[0]._id}`)}
            >
              <Trophy size={16} className="text-yellow-400" />
              <div>
                <p className="font-medium text-xs text-white truncate max-w-[120px]">
                  {ongoingContests[0].title}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Clock size={10} />
                  <span>{calculateTimeRemaining(ongoingContests[0].endTime)} left</span>
                </div>
              </div>
            </div>
          )}

          {/* Profile Image */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="cursor-pointer">
              <img
                src={getProfilePictureUrl()}
                className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover hover:border-purple-300 transition-colors"
                alt="profile"
              />
            </label>
            
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-black rounded-box w-52 border border-purple-500 mt-2">
              <li>
                <div className="flex items-center gap-3 p-2">
                  <img
                    src={getProfilePictureUrl()}
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                    alt="profile"
                  />
                  <div>
                    <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-purple-300">{user?.username}</p>
                  </div>
                </div>
              </li>
              <li className="divider my-1"></li>
              <li>
                <NavLink to="/profile" className="text-white hover:bg-purple-600">Profile</NavLink>
              </li>
              <li>
                <label htmlFor="profileUpload" className="cursor-pointer text-white hover:bg-purple-600">
                  Change Profile Picture
                </label>
              </li>
              <li>
                <NavLink to="/my-contests" className="text-white hover:bg-purple-600">
                  <Trophy size={16} className="mr-2" />
                  My Contests
                </NavLink>
              </li>
              <li className="divider my-1"></li>
              <li>
                <button onClick={handleLogout} className="text-white hover:bg-red-600">
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Hero Section with Contests */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-center text-white mb-6">
            Welcome to <span className="text-purple-400">CodeVerse</span>
          </h1>
          <p className="text-xl text-center text-purple-300 mb-10 max-w-3xl mx-auto">
            Master coding skills with interactive challenges, compete in contests, and track your progress.
          </p>
          
          {/* Stats & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Problems Stat */}
            <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Folder size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{problems.length}</p>
                  <p className="text-gray-400">Coding Problems</p>
                </div>
              </div>
            </div>
            
            {/* Contests Stat */}
            <div 
              className="bg-black/50 border border-purple-500/30 rounded-xl p-6 cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => navigate('/contests')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Trophy size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{ongoingContests.length}</p>
                  <p className="text-gray-400">Active Contests</p>
                  {ongoingContests.length > 0 && (
                    <p className="text-sm text-green-400 mt-1">Join now!</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Solved Problems */}
            <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Award size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{solvedSet.size}</p>
                  <p className="text-gray-400">Problems Solved</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ongoing Contests Section */}
          {ongoingContests.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  Ongoing Contests
                  <span className="badge badge-sm bg-green-500/20 text-green-400 border-green-500 animate-pulse">
                    LIVE
                  </span>
                </h2>
                <NavLink 
                  to="/contests" 
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View all <ChevronRight size={18} />
                </NavLink>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingContests.map(contest => (
                  <div 
                    key={contest._id} 
                    className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500 rounded-xl p-6 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => navigate(`/contests/${contest._id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-green-500/20 text-green-400 border-green-500 animate-pulse">
                          LIVE
                        </span>
                        <span className="badge bg-blue-500/20 text-blue-400 border-blue-500">
                          {contest.difficulty || 'Medium'}
                        </span>
                      </div>
                      <Trophy size={20} className="text-yellow-400" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{contest.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{contest.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-red-400" />
                        <span className="text-gray-400">Ends:</span>
                        <span className="text-white">{formatDate(contest.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-blue-400" />
                        <span className="text-gray-400">Participants:</span>
                        <span className="text-white">{contest.participants?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award size={16} className="text-yellow-400" />
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-white">{contest.prizePool || 'Certificate'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-purple-300">
                        {calculateTimeRemaining(contest.endTime)} remaining
                      </div>
                      <button className="btn btn-sm bg-green-600 border-green-600 text-white hover:bg-green-700">
                        Enter Contest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Problems Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Coding Problems</h2>
            <div className="flex items-center gap-4">
              <NavLink 
                to="/problems" 
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View all problems <ChevronRight size={18} />
              </NavLink>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
              <button 
                className="btn btn-sm" 
                onClick={() => dispatch(fetchProblems())}
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <select
              className="select bg-black text-white border-purple-500 focus:border-purple-300"
              value={filters.status}
              onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <select
              className="select bg-black text-white border-purple-500 focus:border-purple-300"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange({ ...filters, difficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              className="select bg-black text-white border-purple-500 focus:border-purple-300"
              value={filters.tag}
              onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linked list">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
              <option value="string">String</option>
              <option value="tree">Tree</option>
            </select>

            {/* Refresh Button */}
            <button
              className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
              onClick={() => {
                dispatch(fetchProblems());
                if (user) {
                  dispatch(fetchSolvedProblems(user.id));
                }
                fetchContests();
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Problems List */}
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12 bg-black/50 rounded-lg border border-purple-500">
              <div className="text-purple-300 text-lg mb-4">No problems found</div>
              <button
                className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                onClick={() => handleFilterChange({ difficulty: 'all', tag: 'all', status: 'all' })}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProblems.slice(0, 9).map(problem => (
                <div key={problem._id} className="card bg-black/50 border border-purple-500 hover:border-purple-300 transition-colors hover:scale-[1.02]">
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="card-title text-white text-lg">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="hover:text-purple-300 transition-colors"
                        >
                          {problem.title}
                        </NavLink>
                      </h2>
                      
                      <div className="flex flex-col gap-1 items-end">
                        {solvedSet.has(problem._id) && (
                          <div className="badge badge-success gap-1">
                            ✓
                          </div>
                        )}
                        <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty?.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {problem.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="badge badge-outline text-purple-300 border-purple-500">
                        {problem.tags}
                      </div>
                      <NavLink
                        to={`/problem/${problem._id}`}
                        className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                      >
                        Solve
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Problems Count */}
          <div className="mt-8 text-center text-purple-300">
            Showing {Math.min(filteredProblems.length, 9)} of {problems.length} problems
            {loading && <span className="loading loading-spinner loading-xs ml-2"></span>}
            <div className="mt-4">
              <NavLink 
                to="/problems" 
                className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
              >
                View All Problems
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  if (!difficulty) return 'badge-neutral';
  
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;

// import { useEffect, useMemo, useState } from 'react';
// import { NavLink } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../Utils/axiosClient';
// import { logoutUser } from '../slices/authSlice';
// import logo from '../assets/logo2.png';

// function Homepage() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all'
//   });

//   const [showPopup, setShowPopup] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");
//   const [popupType, setPopupType] = useState("success");

//   const handleImageSelect = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("profilePic", file);

//     try {
//       await axiosClient.put("/user/update-profile-pic", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       setPopupMessage("✅ Profile picture updated successfully!");
//       setPopupType("success");
//       setShowPopup(true);
//       setTimeout(() => setShowPopup(false), 3000);

//     } catch (err) {
//       setPopupMessage("❌ Failed to update profile picture");
//       setPopupType("error");
//       setShowPopup(true);
//       setTimeout(() => setShowPopup(false), 3000);
//     }
//   };

//   useEffect(() => {
//     const fetchProblems = async () => {
//       try {
//         const { data } = await axiosClient.get('/problem/getAllProblem');
//         setProblems(data || []);
//       } catch (error) {
//         console.error('Error fetching problems:', error);
//         setProblems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchSolvedProblems = async () => {
//       if (!user) {
//         setSolvedProblems([]);
//         return;
//       }

//       try {
//         const { data } = await axiosClient.get('/problem/problemSolvedByUser');
//         const solvedArray = Array.isArray(data)
//           ? data
//           : Array.isArray(data?.problems)
//             ? data.problems
//             : Array.isArray(data?.result)
//               ? data.result
//               : [];
//         setSolvedProblems(solvedArray);
//       } catch (error) {
//         console.error('Error fetching solved problems:', error);
//         setSolvedProblems([]);
//       }
//     };

//     fetchProblems();
//     fetchSolvedProblems();
//   }, [user]);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]);
//   };

//   const solvedSet = useMemo(() =>
//     new Set(solvedProblems.map(p => p._id || p.problemId)),
//     [solvedProblems]
//   );

//   const filteredProblems = problems.filter(problem => {
//     if (!problem) return false;

//     const difficultyMatch =
//       filters.difficulty === 'all' ||
//       problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

//     const tagMatch =
//       filters.tag === 'all' ||
//       problem.tags?.toLowerCase() === filters.tag.toLowerCase();

//     const statusMatch =
//       filters.status === 'all' ? true :
//         filters.status === 'solved' ? solvedSet.has(problem._id) :
//           !solvedSet.has(problem._id);

//     return difficultyMatch && tagMatch && statusMatch;
//   });

//   const getProfilePictureUrl = () => {
//     if (user?.profilePic) {
//       return user.profilePic.startsWith("http")
//         ? user.profilePic
//         : `http://localhost:5005/${user.profilePic}`;
//     }
//     return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="loading loading-spinner loading-lg text-purple-400"></div>
//           <p className="text-white mt-4">Loading problems...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
//       {/* Popup Toast */}
//       {showPopup && (
//         <div className="toast toast-top toast-end z-50">
//           <div className={`alert ${popupType === "success" ? "alert-success" : "alert-error"} shadow-lg`}>
//             <span>{popupMessage}</span>
//           </div>
//         </div>
//       )}

//       {/* Navbar */}
//       <nav className="navbar bg-black/80 text-white px-6 py-4 border-b border-purple-500">
//         <div className="flex-1 flex items-center gap-4">
//           <img
//             src={logo}
//             alt="logo"
//             className="w-10 h-10 rounded-lg"
//           />
//           <NavLink
//             to="/"
//             className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
//           >
//             CodeVerse
//           </NavLink>
//         </div>

//         <div className="flex-none gap-4 ">
//           {/* Profile Image */}
//           <div className="dropdown dropdown-end">
//             <label tabIndex={0} className="cursor-pointer">
//               <img
//                 src={getProfilePictureUrl()}
//                 className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover hover:border-purple-300 transition-colors mx-3 relative top-2.5"
//                 alt="profile"
//               />
//             </label>
            
//             <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-black rounded-box w-52 border border-purple-500">
//               <li>
//                 <label htmlFor="profileUpload" className="cursor-pointer text-white hover:bg-purple-600">
//                   Change Profile Picture
//                 </label>
//               </li>
//             </ul>
//           </div>

//           <input
//             type="file"
//             id="profileUpload"
//             accept="image/*"
//             onChange={handleImageSelect}
//             className="hidden"
//           />

//           {/* User Dropdown */}
//           <div className="dropdown dropdown-end items-center">
//             <div tabIndex={0} className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 relative top-[-5px]">
//               {user?.firstName || "User"}
//             </div>
//             <ul className="dropdown-content menu p-2 shadow bg-black rounded-box w-52 border border-purple-500 mt-2">
//               <li><NavLink to="/profile" className="text-white hover:bg-purple-600">Profile</NavLink></li>
//               {user?.role === 'admin' && (
//                 <li><NavLink to="/admin" className="text-white hover:bg-purple-600">Admin</NavLink></li>
//               )}
//               <li className="divider my-1"></li>
//               <li><button onClick={handleLogout} className="text-white hover:bg-red-600">Logout</button></li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto p-6">
//         <h1 className="text-4xl font-bold text-center text-white mb-8">Coding Problems</h1>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-4 mb-8 justify-center">
//           <select
//             className="select bg-black text-white border-purple-500 focus:border-purple-300"
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//           >
//             <option value="all">All Problems</option>
//             <option value="solved">Solved</option>
//             <option value="unsolved">Unsolved</option>
//           </select>

//           <select
//             className="select bg-black text-white border-purple-500 focus:border-purple-300"
//             value={filters.difficulty}
//             onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
//           >
//             <option value="all">All Difficulties</option>
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>

//           <select
//             className="select bg-black text-white border-purple-500 focus:border-purple-300"
//             value={filters.tag}
//             onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
//           >
//             <option value="all">All Tags</option>
//             <option value="array">Array</option>
//             <option value="linked list">Linked List</option>
//             <option value="graph">Graph</option>
//             <option value="dp">DP</option>
//             <option value="string">String</option>
//             <option value="tree">Tree</option>
//           </select>
//         </div>

//         {/* Problems List */}
//         {filteredProblems.length === 0 ? (
//           <div className="text-center py-12 bg-black/50 rounded-lg border border-purple-500">
//             <div className="text-purple-300 text-lg mb-4">No problems found</div>
//             <button
//               className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//               onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all' })}
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {filteredProblems.map(problem => (
//               <div key={problem._id} className="card bg-black/50 border border-purple-500 hover:border-purple-300 transition-colors">
//                 <div className="card-body">
//                   <div className="flex items-start justify-between mb-3">
//                     <h2 className="card-title text-white text-lg">
//                       <NavLink
//                         to={`/problem/${problem._id}`}
//                         className="hover:text-purple-300 transition-colors"
//                       >
//                         {problem.title}
//                       </NavLink>
//                     </h2>
                    
//                     <div className="flex flex-col gap-1 items-end">
//                       {solvedSet.has(problem._id) && (
//                         <div className="badge badge-success gap-1">
//                           ✓
//                         </div>
//                       )}
//                       <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
//                         {problem.difficulty?.toUpperCase()}
//                       </div>
//                     </div>
//                   </div>

//                   <p className="text-gray-300 text-sm mb-4 line-clamp-2">
//                     {problem.description}
//                   </p>

//                   <div className="flex justify-between items-center">
//                     <div className="badge badge-outline text-purple-300 border-purple-500">
//                       {problem.tags}
//                     </div>
//                     <NavLink
//                       to={`/problem/${problem._id}`}
//                       className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//                     >
//                       Solve
//                     </NavLink>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Problems Count */}
//         <div className="mt-8 text-center text-purple-300">
//           Showing {filteredProblems.length} of {problems.length} problems
//         </div>
//       </div>
//     </div>
//   );
// }

// const getDifficultyBadgeColor = (difficulty) => {
//   if (!difficulty) return 'badge-neutral';
  
//   switch (difficulty.toLowerCase()) {
//     case 'easy': return 'badge-success';
//     case 'medium': return 'badge-warning';
//     case 'hard': return 'badge-error';
//     default: return 'badge-neutral';
//   }
// };

// export default Homepage;

 // const handleImageSelect = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   // Validate file type and size
  //   if (!file.type.startsWith('image/')) {
  //     alert('Please select an image file (JPEG, PNG, etc.)');
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     alert('Image size should be less than 5MB');
  //     return;
  //   }

  //   setProfilePreview(URL.createObjectURL(file));

  //   const formData = new FormData();
  //   formData.append("profilePic", file);

  //   try {
  //     const response = await axiosClient.put(
  //       "/user/update-profile-pic",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data"
  //         }
  //       }
  //     );

  //     console.log("Profile updated:", response.data);

  //     // Update user in localStorage if needed
  //     if (response.data.user) {
  //       localStorage.setItem('user', JSON.stringify(response.data.user));
  //     }

  //   } catch (error) {
  //     console.error("Profile pic update failed", error.response?.data || error.message);
  //     alert('Failed to update profile picture');
  //   }
  // };