// pages/admin/DeleteContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import { 
  Trash2, AlertTriangle, ArrowLeft, Calendar, 
  Users, Clock, Award, Loader, CheckCircle, XCircle,
  Search, Trophy, Filter, Eye, Edit
} from 'lucide-react';

const DeleteContestPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedContest, setSelectedContest] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      let url = `/api/contests?page=1&limit=50`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      
      const { data } = await axiosClient.get(url);
      if (data.success) {
        setContests(data.contests || []);
      } else {
        setError('Failed to load contests');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contestId, contestTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contestTitle}"? This action cannot be undone.`)) {
      setDeleting(true);
      setError('');
      
      try {
        const { data } = await axiosClient.delete(`/api/contests/${contestId}`);
        
        if (data.success) {
          setSuccess(`Contest "${contestTitle}" deleted successfully!`);
          // Remove from local state
          setContests(contests.filter(contest => contest._id !== contestId));
          // Reset selected contest if it was deleted
          if (selectedContest && selectedContest._id === contestId) {
            setSelectedContest(null);
            setConfirmText('');
          }
        } else {
          setError(data.error || 'Failed to delete contest');
        }
      } catch (error) {
        setError(error.response?.data?.error || 'An error occurred');
        console.error('Error deleting contest:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDeleteWithConfirmation = async () => {
    if (!selectedContest) return;
    
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    await handleDelete(selectedContest._id, selectedContest.title);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'badge-success';
      case 'upcoming': return 'badge-info';
      case 'ended': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const filteredContests = contests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <Loader className="animate-spin text-purple-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-ghost btn-sm text-purple-300 hover:text-white mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Admin Dashboard
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500 mb-4">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Delete Contests</h1>
            <p className="text-purple-300">
              Select contests to delete. This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="alert alert-success mb-6 bg-green-500/20 border-green-500 text-green-300">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6 bg-red-500/20 border-red-500 text-red-300">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contest List */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">All Contests ({filteredContests.length})</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search contests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input input-bordered pl-10 bg-black/50 border-purple-500 text-white"
                    />
                  </div>
                  <div className="tabs tabs-boxed bg-black/30">
                    {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                      <button
                        key={status}
                        className={`tab ${filter === status ? 'tab-active' : ''}`}
                        onClick={() => setFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contest List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredContests.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No contests found</p>
                  </div>
                ) : (
                  filteredContests.map((contest) => (
                    <div
                      key={contest._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedContest?._id === contest._id
                          ? 'bg-red-500/10 border-red-500'
                          : 'bg-black/30 border-purple-500/30 hover:border-purple-500'
                      }`}
                      onClick={() => setSelectedContest(contest)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`badge ${getStatusColor(contest.status)}`}>
                              {contest.status}
                            </span>
                            <span className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                              {contest.difficulty}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{contest.title}</h3>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-1">
                            {contest.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-blue-400" />
                              <span>{formatDate(contest.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-green-400" />
                              <span>{contest.participants?.length || 0} participants</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/contests/${contest._id}`}
                            className="btn btn-xs btn-outline border-blue-500 text-blue-400 hover:bg-blue-600"
                            onClick={(e) => e.stopPropagation()}
                            title="View Contest"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(contest._id, contest.title);
                            }}
                            className="btn btn-xs btn-outline border-red-500 text-red-400 hover:bg-red-600"
                            title="Delete Contest"
                            disabled={deleting}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Contest Details */}
          <div>
            <div className="bg-black/40 border border-red-500/30 rounded-xl p-6 sticky top-6">
              {selectedContest ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">{selectedContest.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{selectedContest.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-sm text-gray-400">Status</div>
                        <div className={`badge ${getStatusColor(selectedContest.status)}`}>
                          {selectedContest.status}
                        </div>
                      </div>
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-sm text-gray-400">Participants</div>
                        <div className="text-lg font-bold">{selectedContest.participants?.length || 0}</div>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={18} className="text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-300 mb-1">Warning</h4>
                          <p className="text-red-300/80 text-sm">
                            Deleting this contest will permanently remove all data including submissions, leaderboard, and participant registrations.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="label">
                        <span className="label-text text-white">
                          Type <span className="font-bold text-red-400">DELETE</span> to confirm:
                        </span>
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => {
                          setConfirmText(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Type DELETE here"
                        className="input input-bordered w-full bg-black/50 border-red-500 text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleDeleteWithConfirmation}
                        disabled={deleting || confirmText !== 'DELETE'}
                        className={`btn w-full ${
                          confirmText === 'DELETE'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 border-0 text-white hover:from-red-700 hover:to-orange-700'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {deleting ? (
                          <>
                            <Loader className="animate-spin mr-2" size={20} />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={20} className="mr-2" />
                            Delete Contest Permanently
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedContest(null);
                          setConfirmText('');
                        }}
                        className="btn btn-outline w-full border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                      >
                        Select Different Contest
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/30 border border-gray-600 mb-4">
                    <AlertTriangle size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No Contest Selected</h3>
                  <p className="text-gray-400 text-sm">
                    Select a contest from the list to view deletion details
                  </p>
                </div>
              )}
            </div>

            {/* Alternative Actions */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                Instead of deleting, you can also:
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin/contests/create"
                  className="btn btn-outline btn-sm border-blue-500 text-blue-300 hover:bg-blue-600"
                >
                  Create New Contest
                </Link>
                <Link
                  to="/contests"
                  className="btn btn-outline btn-sm border-purple-500 text-purple-300 hover:bg-purple-600"
                >
                  View All Contests
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-6 border border-red-500/30 rounded-xl bg-red-500/5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-400" />
            <h3 className="text-xl font-bold text-red-300">Danger Zone</h3>
          </div>
          <p className="text-red-300/80 mb-4">
            Deleting contests is a permanent action. Consider archiving or disabling contests instead if you might need the data later.
          </p>
          <div className="text-sm text-gray-400">
            <p>⚠️ Contest deletion will remove:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All contest submissions and solutions</li>
              <li>Leaderboard rankings and scores</li>
              <li>Participant registrations</li>
              <li>Contest statistics and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteContestPage;