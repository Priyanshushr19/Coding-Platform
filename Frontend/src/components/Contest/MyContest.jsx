import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Trophy, Clock, Users, Calendar, Award, Target, 
  BarChart, ChevronLeft, Filter, Search, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Crown, TrendingUp,
  Download, Share2, Eye, Play, BookOpen, Zap
} from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const MyContestsPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, ended
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userStats, setUserStats] = useState({
    totalContests: 0,
    ongoingContests: 0,
    completedContests: 0,
    totalScore: 0,
    bestRank: null,
    averageRank: 0
  });
  console.log("object");

  useEffect(() => {
    fetchMyContests();
  }, [filter]);

  const fetchMyContests = async () => {
    setLoading(true);
    try {
      // Using axiosClient which should be configured with credentials
      const {data} = await axiosClient.get("/api/contests/user/my-contests");
      console.log(data);
      
      if (data.success) {
        let filteredContests = data.contests || [];
        
        // Apply status filter
        if (filter !== 'all') {
          filteredContests = filteredContests.filter(contest => contest.status === filter);
        }
        
        setContests(filteredContests);
        
        // Calculate user stats
        const ongoing = filteredContests.filter(c => c.status === 'ongoing').length;
        const completed = filteredContests.filter(c => c.status === 'ended').length;
        
        // Calculate rank and score stats
        let totalScore = 0;
        let bestRank = null;
        let totalRank = 0;
        let rankedContests = 0;
        
        filteredContests.forEach(contest => {
          if (contest.userStats?.score) {
            totalScore += contest.userStats.score;
          }
          if (contest.userStats?.rank && contest.userStats.rank > 0) {
            if (!bestRank || contest.userStats.rank < bestRank) {
              bestRank = contest.userStats.rank;
            }
            totalRank += contest.userStats.rank;
            rankedContests++;
          }
        });

        setUserStats({
          totalContests: filteredContests.length,
          ongoingContests: ongoing,
          completedContests: completed,
          totalScore,
          bestRank,
          averageRank: rankedContests > 0 ? Math.round(totalRank / rankedContests) : 0
        });
      } else {
        console.error('Error fetching contests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      if (error.response?.status === 401) {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    } finally {
      setLoading(false);
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

  const calculateTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'ended': return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getRankBadgeColor = (rank) => {
    if (!rank) return 'bg-gray-500/20 text-gray-400 border-gray-500';
    
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400';
    if (rank === 3) return 'bg-orange-500/20 text-orange-400 border-orange-500';
    if (rank <= 10) return 'bg-purple-500/20 text-purple-400 border-purple-500';
    if (rank <= 50) return 'bg-blue-500/20 text-blue-400 border-blue-500';
    return 'bg-green-500/20 text-green-400 border-green-500';
  };

  const handleExportData = () => {
    if (contests.length === 0) return;
    
    // Export contest data as CSV
    const csvData = contests.map(contest => ({
      'Contest Name': contest.title,
      'Status': contest.status,
      'Start Date': formatDate(contest.startTime),
      'End Date': formatDate(contest.endTime),
      'Your Score': contest.userStats?.score || 0,
      'Your Rank': contest.userStats?.rank || 'N/A',
      'Total Participants': contest.participants?.length || 0
    }));
    
    // Create CSV content
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-contests-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredContests = contests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-black/50 border-b border-purple-500/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button 
                onClick={() => navigate('/contests')}
                className="btn btn-ghost btn-sm text-purple-300 hover:text-white mb-4"
              >
                <ChevronLeft size={20} />
                Back to Contests
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Contests</h1>
              <p className="text-purple-300">Track your contest participation, performance, and achievements</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                disabled={contests.length === 0}
              >
                <Download size={18} className="mr-2" />
                Export Data
              </button>
              <button
                onClick={fetchMyContests}
                className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                disabled={loading}
              >
                <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{userStats.totalContests}</div>
              <div className="text-sm text-purple-300">Total Contests</div>
            </div>
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{userStats.ongoingContests}</div>
              <div className="text-sm text-green-300">Ongoing</div>
            </div>
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{userStats.completedContests}</div>
              <div className="text-sm text-blue-300">Completed</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {userStats.bestRank ? `#${userStats.bestRank}` : 'N/A'}
              </div>
              <div className="text-sm text-yellow-300">Best Rank</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
                <input
                  type="text"
                  placeholder="Search your contests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-black/50 border-purple-500 text-white placeholder-purple-300/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`btn btn-sm ${
                    filter === status 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-black/50 border-purple-500/50 text-purple-300'
                  }`}
                >
                  {status === 'all' ? 'All' : 
                   status === 'ongoing' ? 'Ongoing' : 
                   status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-purple-400"></div>
              <p className="text-purple-300 mt-4">Loading your contests...</p>
            </div>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={64} className="mx-auto text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">
              {searchTerm ? 'No matching contests found' : 'No contests found'}
            </h3>
            <p className="text-purple-300 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? `No contests match "${searchTerm}". Try a different search term.`
                : filter !== 'all' 
                  ? `You haven't participated in any ${filter} contests.`
                  : "You haven't participated in any contests yet."}
            </p>
            <button 
              onClick={() => navigate('/contests')}
              className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
            >
              <Eye size={18} className="mr-2" />
              Browse Contests
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredContests.map((contest) => (
              <div 
                key={contest._id}
                className="bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Left Column - Contest Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`badge ${getStatusColor(contest.status)}`}>
                          {contest.status.toUpperCase()}
                          {contest.status === 'ongoing' && (
                            <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                          )}
                        </span>
                        {contest.userStats?.rank && (
                          <span className={`badge ${getRankBadgeColor(contest.userStats.rank)}`}>
                            Rank: #{contest.userStats.rank}
                          </span>
                        )}
                        {contest.userStats?.score && (
                          <span className="badge bg-blue-500/20 text-blue-400 border-blue-500">
                            Score: {contest.userStats.score}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">{contest.title}</h3>
                      <p className="text-purple-300 mb-6 line-clamp-2">{contest.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Start Time</div>
                          <div className="text-white">{formatDate(contest.startTime)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">End Time</div>
                          <div className="text-white">{formatDate(contest.endTime)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Participants</div>
                          <div className="text-white">{contest.participants?.length || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Time Left</div>
                          <div className={`font-medium ${
                            contest.status === 'ongoing' ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {calculateTimeRemaining(contest.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Actions */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {contest.status === 'ongoing' ? (
                        <button
                          onClick={() => navigate(`/contests/${contest._id}`)}
                          className="btn bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white hover:from-green-700 hover:to-emerald-700"
                        >
                          <Play size={18} className="mr-2" />
                          Continue Contest
                        </button>
                      ) : contest.status === 'upcoming' ? (
                        <div className="text-center py-3">
                          <p className="text-green-400 font-medium mb-2 flex items-center justify-center gap-2">
                            <CheckCircle size={18} />
                            Registered
                          </p>
                          <p className="text-sm text-gray-400">Starts soon</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/contests/${contest._id}`)}
                          className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                        >
                          <BarChart size={18} className="mr-2" />
                          View Results
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/contests/${contest._id}`)}
                        className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                      >
                        <TrendingUp size={18} className="mr-2" />
                        View Leaderboard
                      </button>
                      
                      <button
                        onClick={() => navigate(`/contests/${contest._id}`)}
                        className="btn btn-outline border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white"
                      >
                        <BookOpen size={18} className="mr-2" />
                        View Problems
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar (for completed contests) */}
                  {contest.status === 'ended' && contest.userStats && (
                    <div className="mt-6 pt-6 border-t border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Your Performance</span>
                        <span className="text-sm text-white">
                          Solved: {contest.userStats.problemsSolved || 0}/{contest.problems?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ 
                            width: contest.problems?.length > 0 
                              ? `${((contest.userStats.problemsSolved || 0) / contest.problems.length) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Insights */}
        {!loading && contests.length > 0 && (
          <div className="mt-12 pt-8 border-t border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-6">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-yellow-400" />
                  Achievement Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Score:</span>
                    <span className="text-white font-bold">{userStats.totalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Rank:</span>
                    <span className="text-white font-bold">
                      {userStats.averageRank > 0 ? `#${userStats.averageRank}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contest Completion:</span>
                    <span className="text-white font-bold">
                      {userStats.totalContests > 0 
                        ? `${Math.round((userStats.completedContests / userStats.totalContests) * 100)}%` 
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-green-400" />
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/leaderboard')}
                    className="btn btn-outline w-full justify-start border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                  >
                    <TrendingUp size={18} className="mr-2" />
                    View Global Leaderboard
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="btn btn-outline w-full justify-start border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white"
                  >
                    <Download size={18} className="mr-2" />
                    Export Contest History
                  </button>
                  <button 
                    onClick={() => navigate('/contests')}
                    className="btn btn-outline w-full justify-start border-green-500 text-green-300 hover:bg-green-600 hover:text-white"
                  >
                    <Eye size={18} className="mr-2" />
                    Find New Contests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContestsPage;