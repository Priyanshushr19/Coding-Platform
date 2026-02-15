// pages/ContestResultsPage.jsx - FULL FIXED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../../Utils/axiosClient';
import {
  Trophy, Award, Users, Clock, Calendar, CheckCircle,
  BarChart3, Download, Medal, Target, Percent, Timer,
  Crown, Search, ChevronUp, ChevronDown, Loader, AlertCircle, Home
} from 'lucide-react';

const ContestResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [contestStats, setContestStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchContestResults();
  }, [id]);

  const fetchContestResults = async () => {
    setLoading(true);
    try {
      // Fetch contest details
      const { data: contestData } = await axiosClient.get(`/api/contests/${id}`);
      if (!contestData.success) throw new Error('Failed to fetch contest');
      setContest(contestData.contest);

      console.log('Contest data:', contestData);

      // Fetch leaderboard
      const { data: leaderboardData } = await axiosClient.get(`/api/contests/${id}/leaderboard`);
      console.log('Leaderboard API response:', leaderboardData);
      
      if (leaderboardData.success) {
        const leaderboardEntries = leaderboardData.leaderboard || [];
        console.log('Leaderboard entries:', leaderboardEntries);
        
        // Check data structure
        if (leaderboardEntries.length > 0) {
          console.log('First entry:', leaderboardEntries[0]);
        }
        
        setLeaderboard(leaderboardEntries);
        
        // Find user's rank
        if (user) {
          const userRank = leaderboardEntries.findIndex(
            entry => {
              // Check multiple possible user ID locations
              const entryUserId = entry.userId || entry.user?._id || entry._id;
              const currentUserId = user.id || user._id;
              return entryUserId && entryUserId.toString() === currentUserId.toString();
            }
          );
          
          if (userRank !== -1) {
            setMyRank(leaderboardEntries[userRank]);
          }
        }
      } else {
        console.error('Leaderboard API error:', leaderboardData.error);
      }

      // Fetch contest statistics
      const { data: statsData } = await axiosClient.get(`/api/contests/${id}/stats`);
      if (statsData.success) {
        setContestStats(statsData.stats || statsData.data);
      }

    } catch (error) {
      console.error('Error fetching contest results:', error);
      setError('Failed to load contest results');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortedLeaderboard = () => {
    const filtered = leaderboard.filter(entry => {
      const firstName = entry.firstName || '';
      const lastName = entry.lastName || '';
      const username = entry.username || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        username.toLowerCase().includes(searchLower) ||
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'score':
          aVal = a.score || 0;
          bVal = b.score || 0;
          break;
        case 'problemsSolved':
          aVal = a.problemsSolved || 0;
          bVal = b.problemsSolved || 0;
          break;
        case 'username':
          aVal = (entry.username || '').toLowerCase();
          bVal = (entry.username || '').toLowerCase();
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getUserName = (entry) => {
    if (entry.firstName && entry.lastName) {
      return `${entry.firstName} ${entry.lastName}`;
    }
    return entry.username || `User ${entry.rank || ''}`;
  };

  const getUserProfilePic = (entry) => {
    if (entry.profilePic) {
      return entry.profilePic;
    }
    
    // Generate avatar from name
    const name = getUserName(entry);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  const getUserInitials = (entry) => {
    const name = getUserName(entry);
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-purple-400 mx-auto mb-4" size={40} />
          <p className="text-gray-300">Loading contest results...</p>
        </div>
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Contest Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/contests')}
            className="btn btn-primary"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/contests')}
              className="btn btn-ghost btn-sm"
            >
              <Home size={16} className="mr-2" />
              All Contests
            </button>
            <button
              onClick={() => navigate(`/contests/${id}`)}
              className="btn btn-ghost btn-sm"
            >
              ← Back to Contest
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500 mb-4">
              <Trophy size={28} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Contest Results</h1>
            <p className="text-2xl font-bold text-yellow-300 mb-1">{contest?.title || 'Contest'}</p>
            <p className="text-gray-400">Final Rankings</p>
          </div>
        </div>

        {/* Contest Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Calendar className="inline-block text-blue-400 mb-2" size={24} />
              <p className="text-sm text-gray-400">Start</p>
              <p className="font-medium">
                {contest?.startTime ? new Date(contest.startTime).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <Clock className="inline-block text-red-400 mb-2" size={24} />
              <p className="text-sm text-gray-400">End</p>
              <p className="font-medium">
                {contest?.endTime ? new Date(contest.endTime).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <Users className="inline-block text-green-400 mb-2" size={24} />
              <p className="text-sm text-gray-400">Participants</p>
              <p className="font-medium">{leaderboard.length}</p>
            </div>
            
            <div className="text-center">
              <Award className="inline-block text-yellow-400 mb-2" size={24} />
              <p className="text-sm text-gray-400">Status</p>
              <p className="font-medium capitalize">{contest?.status || 'ended'}</p>
            </div>
          </div>
        </div>

        {/* Your Rank */}
        {myRank && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl font-bold">
                    #{myRank.rank}
                  </div>
                  {getMedal(myRank.rank) && (
                    <div className="absolute -top-2 -right-2 text-2xl">
                      {getMedal(myRank.rank)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Your Performance</h3>
                  <p className="text-gray-300">{getUserName(myRank)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Score</p>
                  <p className="text-xl font-bold text-yellow-300">{myRank.score || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Solved</p>
                  <p className="text-xl font-bold text-green-300">{myRank.problemsSolved || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Rank</p>
                  <p className="text-xl font-bold text-blue-300">#{myRank.rank}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="text-xl font-bold text-purple-300">{formatTime(myRank.timePenalty)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Crown className="text-yellow-500" />
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <div 
                  key={entry._id || entry.userId || index}
                  className={`rounded-xl p-6 text-center ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-2 border-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-2 border-gray-500' :
                    'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-2 border-orange-500'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {getMedal(entry.rank)}
                  </div>
                  <div className="text-2xl font-bold mb-2">#{entry.rank}</div>
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 mx-auto mb-3 overflow-hidden">
                    <img
                      src={getUserProfilePic(entry)}
                      className="w-full h-full object-cover"
                      alt={getUserName(entry)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold">
                            ${getUserInitials(entry)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{getUserName(entry)}</h4>
                  <p className="text-gray-400 text-sm mb-3">@{entry.username || 'user'}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score:</span>
                      <span className="font-bold">{entry.score || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Solved:</span>
                      <span className="font-bold">{entry.problemsSolved || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Full Leaderboard</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered pl-10 bg-gray-900 border-gray-600 text-white w-64"
                />
              </div>
              <span className="text-sm text-gray-400">
                {sortedLeaderboard.length} of {leaderboard.length} participants
              </span>
            </div>
          </div>

          {sortedLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No participants found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn btn-sm btn-ghost mt-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-gray-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        onClick={() => handleSort('rank')}
                      >
                        Rank
                        {sortBy === 'rank' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-gray-400 font-medium">Participant</th>
                    <th className="text-gray-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        onClick={() => handleSort('score')}
                      >
                        Score
                        {sortBy === 'score' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-gray-400 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-white transition-colors"
                        onClick={() => handleSort('problemsSolved')}
                      >
                        Solved
                        {sortBy === 'problemsSolved' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-gray-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((entry, index) => {
                    const medal = getMedal(entry.rank);
                    const isCurrentUser = myRank && (
                      entry.userId === user?.id || 
                      entry.user?._id === user?.id ||
                      entry._id === user?.id
                    );

                    return (
                      <tr 
                        key={entry._id || entry.userId || index}
                        className={`border-b border-gray-800 hover:bg-gray-700/30 transition-colors ${
                          isCurrentUser ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              entry.rank <= 3 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50' :
                              'bg-gray-700'
                            }`}>
                              {medal || <span className="font-bold text-sm">{entry.rank}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-gray-600 overflow-hidden">
                              <img
                                src={getUserProfilePic(entry)}
                                className="w-full h-full object-cover"
                                alt={getUserName(entry)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-700 text-white text-xs font-bold">
                                      ${getUserInitials(entry)}
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{getUserName(entry)}</p>
                              <p className="text-sm text-gray-400">
                                @{entry.username || 'user'}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-lg font-bold text-yellow-300">{entry.score || 0}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="font-bold">{entry.problemsSolved || 0}</span>
                            {contest?.problems?.length > 0 && (
                              <span className="text-sm text-gray-400">
                                / {contest.problems.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-gray-400">{formatTime(entry.timePenalty)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Contest ended on {contest?.endTime ? new Date(contest.endTime).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const csvHeaders = 'Rank,Name,Username,Score,Problems Solved,Time Penalty\n';
                  const csvRows = sortedLeaderboard.map(entry => 
                    `${entry.rank},"${getUserName(entry)}","${entry.username || ''}",${entry.score || 0},${entry.problemsSolved || 0},"${formatTime(entry.timePenalty)}"`
                  ).join('\n');
                  
                  const csvContent = csvHeaders + csvRows;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${contest?.title?.replace(/\s+/g, '_') || 'contest'}_leaderboard.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn btn-sm btn-outline border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download size={14} className="mr-1" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {contestStats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded">
                  <Target className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg Score</p>
                  <p className="text-xl font-bold">
                    {contestStats.averageScore?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded">
                  <Percent className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Accuracy Rate</p>
                  <p className="text-xl font-bold">
                    {contestStats.accuracyRate?.toFixed(1) || '0'}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded">
                  <Timer className="text-yellow-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Submissions</p>
                  <p className="text-xl font-bold">
                    {contestStats.totalSubmissions || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded">
                  <BarChart3 className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Max Score</p>
                  <p className="text-xl font-bold">
                    {contestStats.maxScore || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchContestResults}
            className="btn btn-outline border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Refreshing...
              </>
            ) : (
              'Refresh Results'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestResultsPage;
