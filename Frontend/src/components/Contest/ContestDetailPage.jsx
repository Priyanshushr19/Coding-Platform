import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Trophy, Clock, Users, Calendar, Award, Target,
  BarChart, ChevronLeft, Play, BookOpen,
  Flag, Star, Zap, Lock, Unlock, UserCheck,
  MessageSquare, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchContestDetails();
  }, [id]);

  const fetchContestDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient(`/api/contests/${id}`);


      if (data.success) {
        setContest(data.contest);
        setIsRegistered(data.userStats?.isRegistered || false);
      } else {
        console.error('Error fetching contest:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/contests/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();

      if (data.success) {
        setIsRegistered(true);
        alert('Successfully registered for contest!');
        fetchContestDetails();
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  const handleStartContest = () => {
    navigate(`/contests/${id}/problems`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Trophy size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Contest not found</h2>
          <button
            onClick={() => navigate('/contests')}
            className="btn bg-purple-600 text-white hover:bg-purple-700"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-gray-900/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <button
            onClick={() => navigate('/contests')}
            className="btn btn-ghost btn-sm mb-4"
          >
            <ChevronLeft size={20} />
            Back to Contests
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`badge ${contest.status === 'ongoing' ? 'bg-green-500/20 text-green-400 border-green-500 animate-pulse' : 'bg-blue-500/20 text-blue-400 border-blue-500'}`}>
                  {contest.status.toUpperCase()}
                </span>
                {contest.isPublic ? (
                  <span className="badge bg-blue-500/20 text-blue-400 border-blue-500">
                    <Unlock size={12} className="mr-1" /> Public
                  </span>
                ) : (
                  <span className="badge bg-yellow-500/20 text-yellow-400 border-yellow-500">
                    <Lock size={12} className="mr-1" /> Private
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{contest.title}</h1>
              <p className="text-gray-300 text-lg mb-6 max-w-3xl">{contest.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  <span className="text-gray-400">Prize:</span>
                  <span className="font-medium">{contest.prizePool || 'No prize pool'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-500" />
                  <span className="text-gray-400">Participants:</span>
                  <span className="font-medium">{contest.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-green-500" />
                  <span className="text-gray-400">Problems:</span>
                  <span className="font-medium">{contest.problems?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-xl p-6 min-w-[300px]">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-blue-400" />
                    <span className="text-gray-400">Starts:</span>
                  </div>
                  <span>{formatDate(contest.startTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-red-400" />
                    <span className="text-gray-400">Ends:</span>
                  </div>
                  <span>{formatDate(contest.endTime)}</span>
                </div>
              </div>

              {!isRegistered ? (
                <button
                  onClick={handleRegister}
                  className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white w-full hover:from-purple-700 hover:to-blue-700"
                >
                  <UserCheck size={20} className="mr-2" />
                  Register Now
                </button>
              ) : contest.status === 'ongoing' ? (
                <button
                  onClick={handleStartContest}
                  className="btn bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white w-full hover:from-green-700 hover:to-emerald-700"
                >
                  <Play size={20} className="mr-2" />
                  Enter Contest
                </button>
              ) : contest.status === 'upcoming' ? (
                <div className="text-center py-3">
                  <p className="text-green-400 font-medium mb-2">✓ Registered</p>
                  <p className="text-sm text-gray-400">Contest starts soon</p>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-gray-400">Contest has ended</p>
                  <button className="btn btn-ghost btn-sm mt-2">View Results</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <div className="flex space-x-1">
            {['overview', 'problems', 'leaderboard', 'rules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium text-sm md:text-base relative ${activeTab === tab
                    ? 'text-white border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contest Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Problems</div>
                    <div className="text-2xl font-bold">{contest.problems?.length || 0}</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Points</div>
                    <div className="text-2xl font-bold">
                      {contest.problems?.reduce((sum, p) => sum + (p.points || 100), 0) || 0}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Difficulty</div>
                    <div className="text-2xl font-bold capitalize">{contest.difficulty}</div>
                  </div>
                </div>

                {/* Problem List Preview */}
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BookOpen size={20} />
                      Contest Problems
                    </h3>
                    <span className="text-gray-400">{contest.problems?.length || 0} problems</span>
                  </div>
                  <div className="space-y-3">
                    {contest.problems?.slice(0, 3).map((problem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded">
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{problem.problemId?.title || `Problem ${index + 1}`}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="text-purple-300">{problem.points || 100} points</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/contests/${contest._id}/problem/${problem.problemId?._id}`)}
                          className="btn btn-ghost btn-sm"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Contest Problems</h3>
                <div className="space-y-4">
                  {contest.problems?.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">{problem.problemId?.title || `Problem ${index + 1}`}</div>
                          <div className="text-sm text-gray-400">
                            {problem.points || 100} points • {problem.problemId?.difficulty || 'Medium'}
                          </div>
                        </div>
                      </div>
                      {/* CHANGE THIS: Navigate to contest problem page instead of regular problem page */}
                      <button
                        onClick={() => navigate(`/contests/${contest._id}/problem/${problem.problemId?._id}`)}
                        className="btn bg-purple-600 text-white hover:bg-purple-700"
                      >
                        Solve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
                <div className="text-center py-12">
                  <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Leaderboard will be available after contest starts</p>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Flag size={20} />
                  Contest Rules
                </h3>
                <ul className="space-y-3">
                  {contest.rules?.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-yellow-500 mt-1" />
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                  {(!contest.rules || contest.rules.length === 0) && (
                    <li className="text-gray-400">No specific rules for this contest.</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${contest.status === 'ongoing' ? 'text-green-400' : 'text-blue-400'}`}>
                    {contest.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-medium">{contest.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium">
                    {Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Organized By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Trophy size={24} className="text-purple-400" />
                </div>
                <div>
                  <div className="font-medium">{contest.createdBy?.username || "CodeVerse"}</div>
                  <div className="text-sm text-gray-400">Contest Organizer</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {contest.tags && contest.tags.length > 0 && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {contest.tags.map((tag, index) => (
                    <span key={index} className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetail;