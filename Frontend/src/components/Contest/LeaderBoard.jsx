import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
  Trophy, Crown, Users, Award, TrendingUp, Star,
  Filter, Search, RefreshCw, Calendar, Clock,
  ChevronLeft, Globe, Target, BarChart, Zap,
  Medal, Flag, TrendingDown, UserCheck, Shield
} from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [filterBy, setFilterBy] = useState('overall');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    avgScore: 0,
    topScore: 0
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange, filterBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/api/leaderboard?timeRange=${timeRange}&filter=${filterBy}`);
      
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank || null);
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          avgScore: data.avgScore || 0,
          topScore: data.topScore || 0
        });
      } else {
        console.error('Error fetching leaderboard:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white';
    if (rank <= 50) return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white';
    if (rank <= 100) return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
    return 'bg-gradient-to-r from-gray-700 to-gray-800 text-white';
  };

  const getCountryFlag = (country) => {
    const flags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'UK': '🇬🇧', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵'
    };
    return flags[country] || '🌐';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-black/50 border-b border-purple-500/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-ghost btn-sm text-purple-300 hover:text-white mb-4"
              >
                <ChevronLeft size={20} />
                Back to Home
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Trophy className="text-yellow-500" size={36} />
                Global Leaderboard
              </h1>
              <p className="text-purple-300">See where you stand among the top coders worldwide</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                disabled={loading}
              >
                <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats.totalUsers)}</div>
              <div className="text-sm text-purple-300">Total Coders</div>
            </div>
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats.activeUsers)}</div>
              <div className="text-sm text-green-300">Active This Week</div>
            </div>
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats.avgScore)}</div>
              <div className="text-sm text-blue-300">Average Score</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{formatNumber(stats.topScore)}</div>
              <div className="text-sm text-yellow-300">Top Score</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
                <input
                  type="text"
                  placeholder="Search coders by name or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-black/50 border-purple-500 text-white placeholder-purple-300/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="select select-bordered bg-black/50 border-purple-500 text-white"
              >
                <option value="all">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
                <option value="daily">Today</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="select select-bordered bg-black/50 border-purple-500 text-white"
              >
                <option value="overall">Overall Score</option>
                <option value="contests">Contest Performance</option>
                <option value="problems">Problems Solved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Top 3 Winners */}
        {leaderboard.length >= 3 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="text-yellow-500" />
              Top Performers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaderboard.slice(0, 3).map((user, index) => (
                <div 
                  key={user._id}
                  className={`rounded-2xl p-6 text-center relative ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-2 border-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-800/30 to-gray-700/20 border-2 border-gray-500' :
                    'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-2 border-orange-500'
                  }`}
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-500 text-black'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <img
                      src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      className="w-24 h-24 rounded-full border-4 border-white/20 mx-auto mb-4"
                      alt={user.username}
                    />
                    <h4 className="text-xl font-bold text-white mb-1">{user.firstName} {user.lastName}</h4>
                    <p className="text-gray-300 mb-2">@{user.username}</p>
                    
                    {user.country && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl">{getCountryFlag(user.country)}</span>
                        <span className="text-sm text-gray-400">{user.country}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Score:</span>
                        <span className="text-white font-bold">{formatNumber(user.score)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Problems:</span>
                        <span className="text-white font-bold">{user.problemsSolved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contests:</span>
                        <span className="text-white font-bold">{user.contestsJoined}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Rank (if logged in) */}
        {userRank && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="text-green-400" />
              Your Position
            </h3>
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${getRankBadgeColor(userRank.rank)}`}>
                    #{userRank.rank}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Your Rank</h4>
                    <p className="text-purple-300">
                      You're in the top {Math.round((userRank.rank / stats.totalUsers) * 100)}% of all coders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">{formatNumber(userRank.score)}</div>
                  <div className="text-sm text-gray-400">Your Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-2">
              Global Rankings
              <span className="text-sm font-normal text-purple-300 ml-3">
                Showing {filteredLeaderboard.length} of {leaderboard.length} coders
              </span>
            </h3>
            <p className="text-purple-300">
              Rankings are based on {filterBy === 'overall' ? 'overall performance score' : 
                                 filterBy === 'contests' ? 'contest performance' : 
                                 'problems solved'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-purple-400"></div>
                <p className="text-purple-300 mt-4">Loading leaderboard...</p>
              </div>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center py-16">
              <Trophy size={64} className="mx-auto text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-purple-300 mb-6">
                {searchTerm ? 'Try a different search term' : 'No data available'}
              </p>
              <button 
                onClick={() => setSearchTerm('')}
                className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-purple-300 font-bold">Rank</th>
                    <th className="text-purple-300 font-bold">Coder</th>
                    <th className="text-purple-300 font-bold">Score</th>
                    <th className="text-purple-300 font-bold">Problems</th>
                    <th className="text-purple-300 font-bold">Contests</th>
                    <th className="text-purple-300 font-bold">Country</th>
                    <th className="text-purple-300 font-bold">Last Active</th>
                    <th className="text-purple-300 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`border-b border-purple-500/10 hover:bg-purple-500/5 ${
                        userRank && user._id === userRank._id ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <td>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(user.rank)}`}>
                          {user.rank}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            className="w-10 h-10 rounded-full border border-purple-500"
                            alt={user.username}
                          />
                          <div>
                            <div className="font-bold text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">@{user.username}</div>
                          </div>
                          {user.rank <= 3 && (
                            <Medal size={16} className={
                              user.rank === 1 ? 'text-yellow-500' :
                              user.rank === 2 ? 'text-gray-400' :
                              'text-orange-500'
                            } />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-white">{formatNumber(user.score)}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Target size={16} className="text-green-400" />
                          <span className="text-white">{user.problemsSolved}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Trophy size={16} className="text-yellow-400" />
                          <span className="text-white">{user.contestsJoined}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCountryFlag(user.country)}</span>
                          <span className="text-sm text-gray-400">{user.country}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-400">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => navigate(`/profile/${user.username}`)}
                          className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredLeaderboard.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-purple-500/30">
              <div className="text-sm text-purple-300">
                Showing 1-{Math.min(filteredLeaderboard.length, 50)} of {leaderboard.length} entries
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-ghost text-purple-300 hover:text-white">
                  Previous
                </button>
                <button className="btn btn-sm bg-purple-600 border-purple-600 text-white">
                  1
                </button>
                {leaderboard.length > 50 && (
                  <>
                    <button className="btn btn-sm btn-ghost text-purple-300 hover:text-white">
                      2
                    </button>
                    <span className="px-2 text-purple-300">...</span>
                    <button className="btn btn-sm btn-ghost text-purple-300 hover:text-white">
                      Next
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" />
              How Rankings Work
            </h4>
            <ul className="space-y-2 text-sm text-purple-300">
              <li className="flex items-start gap-2">
                <Star size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Score based on problem difficulty and solve time</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Contest performance boosts your rank</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Consistency is rewarded with bonus points</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="text-blue-400" />
              Fair Play Policy
            </h4>
            <p className="text-sm text-blue-300 mb-4">
              We maintain a fair competitive environment through:
            </p>
            <ul className="space-y-2 text-sm text-blue-300">
              <li>• Anti-cheat detection systems</li>
              <li>• Plagiarism checks</li>
              <li>• Regular ranking audits</li>
              <li>• Transparent scoring system</li>
            </ul>
          </div>
          
          <div className="bg-black/40 border border-green-500/30 rounded-xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Improve Your Rank
            </h4>
            <ul className="space-y-3 text-sm text-green-300">
              <li>
                <Link to="/contests" className="flex items-center gap-2 hover:text-green-200">
                  <Trophy size={16} />
                  Participate in contests
                </Link>
              </li>
              <li>
                <Link to="/problems" className="flex items-center gap-2 hover:text-green-200">
                  <Target size={16} />
                  Solve daily problems
                </Link>
              </li>
              <li>
                <Link to="/practice" className="flex items-center gap-2 hover:text-green-200">
                  <BarChart size={16} />
                  Practice with tutorials
                </Link>
              </li>
              <li>
                <Link to="/community" className="flex items-center gap-2 hover:text-green-200">
                  <Users size={16} />
                  Learn from top coders
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;