// pages/ContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Trophy, Clock, Users, Calendar, Award, Target, 
  BarChart, ChevronRight, Filter, Search,
  RefreshCw, Zap, Sparkles, Loader, Globe, Lock
} from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const ContestPage = () => {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    active: 0,
    participants: 0,
    prizePool: 0,
    upcoming: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      let url = `/api/contests?page=1&limit=20`;
      
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const { data } = await axiosClient.get(url);
      
      if (data.success) {
        setContests(data.contests || []);
        
        // Calculate stats
        const activeContests = data.contests?.filter(c => c.status === 'ongoing').length || 0;
        const upcomingContests = data.contests?.filter(c => c.status === 'upcoming').length || 0;
        const totalParticipants = data.contests?.reduce((sum, contest) => 
          sum + (contest.participantsCount || contest.participants?.length || 0), 0
        ) || 0;
        
        setStats({
          active: activeContests,
          upcoming: upcomingContests,
          participants: totalParticipants,
          prizePool: data.contests?.reduce((sum, contest) => 
            sum + (contest.prizePool ? parseInt(contest.prizePool.replace(/[^0-9]/g, '')) || 0 : 0), 0
          ) || 0
        });
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'ended': return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchContests();
    }
  };

  const filteredContests = contests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle contest click - check registration status
  const handleContestClick = (contest) => {
    navigate(`/contests/${contest._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-yellow-500" size={36} />
                <h1 className="text-3xl font-bold">Coding Contests</h1>
              </div>
              <p className="text-purple-300">Participate in contests and climb the leaderboard</p>
            </div>
            {/* Removed Create Contest button */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-sm text-purple-300">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
                  <p className="text-sm text-blue-300">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.participants}</p>
                  <p className="text-sm text-green-300">Participants</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Award size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${stats.prizePool > 1000 ? `${(stats.prizePool/1000).toFixed(1)}K` : stats.prizePool}
                  </p>
                  <p className="text-sm text-orange-300">Prize Pool</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="input input-bordered w-full pl-10 bg-black/50 border-purple-500 text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      fetchContests();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`btn btn-sm ${filter === status ? 'bg-purple-600 text-white' : 'btn-ghost'}`}
                >
                  {status === 'all' ? 'All' : 
                   status === 'ongoing' ? 'Live' : 
                   status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'ongoing' && filter === 'ongoing' && (
                    <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  )}
                </button>
              ))}
              <button
                onClick={fetchContests}
                className="btn btn-sm bg-purple-600 text-white"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Contest Banner */}
        {filter === 'all' && stats.active > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-yellow-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-white">Live Contests Running!</h3>
                  <p className="text-green-300 text-sm">
                    {stats.active} contest{stats.active > 1 ? 's' : ''} currently active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilter('ongoing')}
                className="btn btn-sm bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white hover:from-green-700 hover:to-emerald-700"
              >
                <Sparkles size={16} className="mr-2" />
                Join Now
              </button>
            </div>
          </div>
        )}

        {/* Contests Grid */}
        {/* Contests Grid */}
{loading ? (
  <div className="flex justify-center items-center h-64">
    <Loader className="animate-spin text-purple-400" size={40} />
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredContests.map((contest) => (
      <div 
        key={contest._id} 
        className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
        onClick={() => handleContestClick(contest)}
      >
        <div className="p-6">
          {/* Contest Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge badge-sm ${getStatusColor(contest.status)}`}>
                  {contest.status.toUpperCase()}
                </span>
                {contest.isPublic ? (
                  <span className="badge badge-sm bg-blue-500/20 text-blue-400 border-blue-500">
                    <Globe size={12} className="mr-1" /> Public
                  </span>
                ) : (
                  <span className="badge badge-sm bg-yellow-500/20 text-yellow-400 border-yellow-500">
                    <Lock size={12} className="mr-1" /> Private
                  </span>
                )}
                {/* Show results badge for ended contests */}
                {contest.status === 'ended' && (
                  <span className="badge badge-sm bg-yellow-500/20 text-yellow-400 border-yellow-500">
                    <Trophy size={12} className="mr-1" /> Results Available
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                {contest.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {contest.description}
              </p>
            </div>
            <ChevronRight size={20} className="text-gray-500 group-hover:text-purple-400 ml-2" />
          </div>

          {/* Contest Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-gray-400">Starts:</span>
              <span>{formatDate(contest.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-red-400" />
              <span className="text-gray-400">Ends:</span>
              <span>{formatDate(contest.endTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target size={16} className="text-green-400" />
              <span className="text-gray-400">Duration:</span>
              <span>{contest.duration || '2'} hours</span>
            </div>
            {/* Time Remaining */}
            {contest.timeRemaining && (
              <div className={`mt-3 p-2 rounded-lg text-sm text-center ${
                contest.status === 'ongoing' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : contest.status === 'upcoming'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}>
                {contest.timeRemaining.type === 'starts_in' && '⏳ Starts in: '}
                {contest.timeRemaining.type === 'ends_in' && '⏰ Ends in: '}
                {contest.timeRemaining.type === 'ended' && '🏁 Contest Ended'}
                {contest.timeRemaining.value}
              </div>
            )}
          </div>

          {/* Contest Stats (for ended contests) */}
          {contest.status === 'ended' && contest.stats && (
            <div className="mb-4 p-3 bg-black/30 rounded-lg border border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Participants</p>
                  <p className="font-bold text-white">{contest.stats.participants || contest.participants?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Score</p>
                  <p className="font-bold text-yellow-300">{contest.stats.averageScore?.toFixed(1) || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Accuracy</p>
                  <p className="font-bold text-green-300">{contest.stats.accuracy || 0}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Contest Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Users size={16} className="text-gray-400" />
                <span>{contest.participantsCount || contest.participants?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <BarChart size={16} className="text-gray-400" />
                <span className="text-gray-400">{contest.problemsCount || contest.problems?.length || 0} problems</span>
              </div>
              {/* Show top performer for ended contests */}
              {contest.status === 'ended' && contest.topPerformer && (
                <div className="flex items-center gap-1 text-sm" title="Top Performer">
                  <Crown size={14} className="text-yellow-500" />
                  <span className="text-yellow-300">{contest.topPerformer}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Results button for ended contests */}
              {contest.status === 'ended' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/contests/${contest._id}/results`);
                  }}
                  className="btn btn-sm bg-gradient-to-r from-yellow-600 to-orange-600 border-0 text-white hover:from-yellow-700 hover:to-orange-700"
                >
                  <Trophy size={16} className="mr-1" />
                  View Results
                </button>
              )}
              
              {/* Main action button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleContestClick(contest);
                }}
                className={`btn btn-sm ${
                  contest.status === 'ongoing' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                    : contest.status === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}
              >
                          {contest.status === 'ongoing' 
                            ? 'Enter Contest' 
                            : contest.status === 'upcoming'
                            ? 'Register'
                            : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Empty State */}
        {!loading && filteredContests.length === 0 && (
          <div className="text-center py-16">
            <Trophy size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No contests found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try a different search term' : 'No contests available'}
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setFilter('all')}
                className="btn bg-purple-600 text-white hover:bg-purple-700"
              >
                View All Contests
              </button>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  fetchContests();
                }}
                className="btn btn-outline border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {filteredContests.length > 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            Showing {filteredContests.length} contest{filteredContests.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestPage;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
// import { 
//   Trophy, Clock, Users, Calendar, Award, Target, 
//   BarChart, ChevronRight, Plus, Filter, Search, 
//   TrendingUp, Shield, Lock, Globe, Star, CheckCircle,
//   RefreshCw, AlertCircle, Crown, Zap, Sparkles
// } from 'lucide-react';
// import axiosClient from '../Utils/axiosClient';

// const ContestPage = () => {
//   const [contests, setContests] = useState([]);
//   const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, ended
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [stats, setStats] = useState({
//     active: 0,
//     participants: 0,
//     prizePool: 0,
//     satisfaction: 98
//   });
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchContests();
//   }, [filter, searchTerm]);

//   const fetchContests = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const headers = {
//         'Content-Type': 'application/json',
//       };
      
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }
      
//       let url = `/api/contests?page=1&limit=20`;
      
//       if (filter !== 'all') {
//         url += `&status=${filter}`;
//       }
      
//       if (searchTerm) {
//         url += `&search=${encodeURIComponent(searchTerm)}`;
//       }

//       const {data}=await axiosClient.get(url)
      
//       // const response = await fetch(url, { headers });
//       // const data = await response.json();
      
//       if (data.success) {
//         setContests(data.contests || []);
        
//         // Calculate stats from contests
//         const activeContests = data.contests?.filter(c => c.status === 'ongoing').length || 0;
//         const totalParticipants = data.contests?.reduce((sum, contest) => 
//           sum + (contest.participants?.length || 0), 0
//         ) || 0;
        
//         setStats({
//           active: activeContests,
//           participants: totalParticipants,
//           prizePool: data.contests?.reduce((sum, contest) => 
//             sum + (contest.prizePool ? parseInt(contest.prizePool.replace(/[^0-9]/g, '')) || 0 : 0), 0
//           ) || 0,
//           satisfaction: 98
//         });
//       } else {
//         console.error('Error fetching contests:', data.error);
//       }
//     } catch (error) {
//       console.error('Error fetching contests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500';
//       case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500';
//       case 'ended': return 'bg-gray-500/20 text-gray-400 border-gray-500';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const calculateTimeRemaining = (endTime) => {
//     const end = new Date(endTime);
//     const now = new Date();
//     const diff = end - now;
    
//     if (diff <= 0) return 'Ended';
    
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
//     if (days > 0) return `${days}d ${hours}h`;
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     return `${minutes}m`;
//   };

//   const getDifficultyBadgeColor = (difficulty) => {
//     switch(difficulty?.toLowerCase()) {
//       case 'easy': return 'bg-green-500/20 text-green-400 border-green-500';
//       case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
//       case 'hard': return 'bg-red-500/20 text-red-400 border-red-500';
//       case 'expert': return 'bg-purple-500/20 text-purple-400 border-purple-500';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
//     }
//   };

//   const handleCreateContest = () => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       const user = JSON.parse(userStr);
//       if (user.role === 'admin') {
//         navigate('/admin/contests/create');
//       } else {
//         alert('Only admins can create contests');
//       }
//     } else {
//       alert('Please login to create contests');
//       navigate('/login');
//     }
//   };

//   const handleRefresh = () => {
//     fetchContests();
//   };

//   const filteredContests = contests.filter(contest => 
//     contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     contest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     contest.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <Trophy className="text-yellow-500" size={36} />
//                 <h1 className="text-3xl font-bold">Coding Contests</h1>
//               </div>
//               <p className="text-purple-300">Participate in contests, solve problems, and climb the leaderboard</p>
//             </div>
//             <div className="flex gap-3">
//               <button 
//                 onClick={handleRefresh}
//                 className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//                 disabled={loading}
//               >
//                 <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
//                 {loading ? 'Loading...' : 'Refresh'}
//               </button>
//               <button 
//                 onClick={handleCreateContest}
//                 className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white hover:from-purple-700 hover:to-blue-700 px-6"
//               >
//                 <Plus size={20} className="mr-2" />
//                 Create Contest
//               </button>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//             <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-5 hover:border-purple-400 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-500/20 rounded-lg">
//                   <Trophy size={22} className="text-purple-400" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-white">{stats.active}</p>
//                   <p className="text-sm text-purple-300">Active Contests</p>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-5 hover:border-blue-400 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-500/20 rounded-lg">
//                   <Users size={22} className="text-blue-400" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-white">{stats.participants.toLocaleString()}</p>
//                   <p className="text-sm text-blue-300">Participants</p>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-5 hover:border-green-400 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-green-500/20 rounded-lg">
//                   <Award size={22} className="text-green-400" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-white">
//                     ${stats.prizePool > 1000 ? `${(stats.prizePool/1000).toFixed(1)}K` : stats.prizePool}
//                   </p>
//                   <p className="text-sm text-green-300">Prize Pool</p>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl p-5 hover:border-orange-400 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-orange-500/20 rounded-lg">
//                   <TrendingUp size={22} className="text-orange-400" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-white">{stats.satisfaction}%</p>
//                   <p className="text-sm text-orange-300">Satisfaction</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Search and Filter */}
//           <div className="flex flex-col md:flex-row gap-4 mb-8">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search contests by title, description, or tags..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="input input-bordered w-full pl-10 bg-black/50 border-purple-500 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
//                 <button
//                   key={status}
//                   onClick={() => setFilter(status)}
//                   className={`btn btn-sm font-medium ${
//                     filter === status 
//                       ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700' 
//                       : 'bg-black/50 border-purple-500/50 text-purple-300 hover:bg-purple-600/30 hover:text-white'
//                   }`}
//                 >
//                   {status === 'all' ? 'All' : 
//                    status === 'ongoing' ? 'Live' : 
//                    status.charAt(0).toUpperCase() + status.slice(1)}
//                   {status === 'ongoing' && (
//                     <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Featured Contest Banner */}
//         {contests.some(c => c.status === 'ongoing') && (
//           <div className="mb-8">
//             <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20 border border-purple-500/50 rounded-2xl p-6">
//               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Zap size={24} className="text-yellow-400" />
//                     <span className="badge bg-green-500/20 text-green-400 border-green-500 animate-pulse">
//                       LIVE NOW
//                     </span>
//                   </div>
//                   <h2 className="text-2xl font-bold text-white mb-2">
//                     Don't miss out on ongoing contests!
//                   </h2>
//                   <p className="text-purple-300">
//                     Join now to compete with other coders and win exciting prizes.
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setFilter('ongoing')}
//                   className="btn bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white hover:from-green-700 hover:to-emerald-700 px-8"
//                 >
//                   <Sparkles size={20} className="mr-2" />
//                   View Live Contests
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Contests Grid */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="text-center">
//               <div className="loading loading-spinner loading-lg text-purple-400"></div>
//               <p className="text-purple-300 mt-4">Loading contests...</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredContests.map((contest) => (
//                 <div 
//                   key={contest._id} 
//                   className="bg-gradient-to-br from-black/60 to-purple-900/20 border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
//                   onClick={() => navigate(`/contests/${contest._id}`)}
//                 >
//                   <div className="p-6">
//                     {/* Contest Header */}
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-3">
//                           <span className={`badge ${getStatusColor(contest.status)}`}>
//                             {contest.status.toUpperCase()}
//                             {contest.status === 'ongoing' && (
//                               <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
//                             )}
//                           </span>
//                           {contest.isPublic ? (
//                             <span className="badge bg-blue-500/20 text-blue-400 border-blue-500">
//                               <Globe size={12} className="mr-1" /> Public
//                             </span>
//                           ) : (
//                             <span className="badge bg-yellow-500/20 text-yellow-400 border-yellow-500">
//                               <Lock size={12} className="mr-1" /> Private
//                             </span>
//                           )}
//                           <span className={`badge ${getDifficultyBadgeColor(contest.difficulty)}`}>
//                             {contest.difficulty}
//                           </span>
//                         </div>
//                         <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors line-clamp-1">
//                           {contest.title}
//                         </h3>
//                         <p className="text-purple-300 text-sm mb-4 line-clamp-2">
//                           {contest.description}
//                         </p>
//                       </div>
//                       <ChevronRight size={20} className="text-purple-500 group-hover:text-purple-300 ml-2 flex-shrink-0" />
//                     </div>

//                     {/* Contest Details */}
//                     <div className="space-y-3 mb-6">
//                       <div className="flex items-center gap-2 text-sm">
//                         <Calendar size={16} className="text-blue-400" />
//                         <span className="text-gray-400">Starts:</span>
//                         <span className="text-white">{formatDate(contest.startTime)}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         <Clock size={16} className="text-red-400" />
//                         <span className="text-gray-400">Ends:</span>
//                         <span className="text-white">{formatDate(contest.endTime)}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         <Target size={16} className="text-green-400" />
//                         <span className="text-gray-400">Time Left:</span>
//                         <span className={`font-medium ${
//                           contest.status === 'ongoing' ? 'text-green-400' : 'text-gray-400'
//                         }`}>
//                           {calculateTimeRemaining(contest.endTime)}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         <Award size={16} className="text-yellow-400" />
//                         <span className="text-gray-400">Prize:</span>
//                         <span className="text-white">{contest.prizePool || 'Certificate'}</span>
//                       </div>
//                     </div>

//                     {/* Contest Footer */}
//                     <div className="flex items-center justify-between pt-4 border-t border-purple-500/30">
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-1 text-sm">
//                           <Users size={16} className="text-blue-400" />
//                           <span className="text-white">{contest.participants?.length || 0}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-sm">
//                           <BarChart size={16} className="text-purple-400" />
//                           <span className="text-white">{contest.problems?.length || 0} problems</span>
//                         </div>
//                       </div>
                      
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/contests/${contest._id}`);
//                         }}
//                         className={`btn btn-sm ${
//                           contest.status === 'ongoing' 
//                             ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white hover:from-green-700 hover:to-emerald-700' 
//                             : 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
//                         }`}
//                       >
//                         {contest.status === 'ongoing' ? 'Enter Contest' : 'View Details'}
//                       </button>
//                     </div>

//                     {/* Tags */}
//                     {contest.tags && contest.tags.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-4">
//                         {contest.tags.slice(0, 3).map((tag, index) => (
//                           <span key={index} className="badge badge-xs bg-purple-500/10 text-purple-300 border-purple-500/30">
//                             {tag}
//                           </span>
//                         ))}
//                         {contest.tags.length > 3 && (
//                           <span className="badge badge-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
//                             +{contest.tags.length - 3}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Empty State */}
//             {!loading && filteredContests.length === 0 && (
//               <div className="text-center py-16">
//                 <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-900/30 border border-purple-500/50 mb-6">
//                   <Trophy size={48} className="text-purple-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-3">No contests found</h3>
//                 <p className="text-purple-300 mb-8 max-w-md mx-auto">
//                   {searchTerm 
//                     ? `No contests match "${searchTerm}". Try a different search term.`
//                     : `No contests available ${filter !== 'all' ? `with status "${filter}"` : ''}.`}
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                   <button 
//                     onClick={() => setFilter('all')}
//                     className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
//                   >
//                     View All Contests
//                   </button>
//                   <button 
//                     onClick={() => setSearchTerm('')}
//                     className="btn btn-outline border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white"
//                   >
//                     Clear Search
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Load More (if paginated) */}
//             {filteredContests.length > 0 && contests.length > filteredContests.length && (
//               <div className="text-center mt-12">
//                 <button className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white hover:from-purple-700 hover:to-blue-700 px-8">
//                   Load More Contests
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {/* Help Section */}
//         <div className="mt-16 pt-8 border-t border-purple-500/30">
//           <div className="text-center max-w-3xl mx-auto">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 border border-blue-500/50 mb-6">
//               <Shield size={32} className="text-blue-400" />
//             </div>
//             <h3 className="text-2xl font-bold text-white mb-4">How Contests Work</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <div className="bg-black/30 border border-purple-500/20 rounded-xl p-5">
//                 <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
//                   <Calendar size={24} className="text-purple-400" />
//                 </div>
//                 <h4 className="font-bold text-white mb-2">Register</h4>
//                 <p className="text-purple-300 text-sm">
//                   Sign up for contests before they start. Some contests may require registration fees.
//                 </p>
//               </div>
//               <div className="bg-black/30 border border-purple-500/20 rounded-xl p-5">
//                 <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
//                   <Clock size={24} className="text-green-400" />
//                 </div>
//                 <h4 className="font-bold text-white mb-2">Compete</h4>
//                 <p className="text-purple-300 text-sm">
//                   Solve problems within the time limit. Faster solutions earn more points.
//                 </p>
//               </div>
//               <div className="bg-black/30 border border-purple-500/20 rounded-xl p-5">
//                 <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4 mx-auto">
//                   <Crown size={24} className="text-yellow-400" />
//                 </div>
//                 <h4 className="font-bold text-white mb-2">Win Prizes</h4>
//                 <p className="text-purple-300 text-sm">
//                   Top performers win cash prizes, certificates, and recognition on the leaderboard.
//                 </p>
//               </div>
//             </div>
//             <p className="text-purple-300">
//               Need help? Check out our <a href="/help" className="text-blue-400 hover:text-blue-300 underline">contest guidelines</a> or <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact support</a>.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContestPage;