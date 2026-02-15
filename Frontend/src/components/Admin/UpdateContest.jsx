// pages/admin/UpdateContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import { 
  Edit, ArrowLeft, Calendar, Users, Clock, Award, 
  Loader, CheckCircle, XCircle, Search, Trophy, 
  Filter, Eye, Save, Tag, Lock, Globe, AlertCircle
} from 'lucide-react';

const UpdateContestPage = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedContest, setSelectedContest] = useState(null);
  const [loadingContest, setLoadingContest] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    rules: [],
    prizePool: '',
    tags: [],
    difficulty: 'medium',
    isPublic: true,
    problems: []
  });
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [searchProblem, setSearchProblem] = useState('');

  useEffect(() => {
    fetchContests();
    fetchAllProblems();
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

  const fetchAllProblems = async () => {
    try {
      const { data } = await axiosClient.get('/api/problems');
      if (data.success) {
        setProblems(data.problems || []);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const fetchContestDetails = async (contestId) => {
    setLoadingContest(true);
    try {
      const { data } = await axiosClient.get(`/api/contests/${contestId}`);
      if (data.success) {
        const contest = data.contest;
        
        // Format dates for input
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: contest.title || '',
          description: contest.description || '',
          startTime: contest.startTime ? formatDateForInput(contest.startTime) : '',
          endTime: contest.endTime ? formatDateForInput(contest.endTime) : '',
          rules: contest.rules || [],
          prizePool: contest.prizePool || '',
          tags: contest.tags || [],
          difficulty: contest.difficulty || 'medium',
          isPublic: contest.isPublic !== undefined ? contest.isPublic : true,
          problems: contest.problems || []
        });

        // Set selected problems
        if (contest.problems && contest.problems.length > 0) {
          const problemsWithDetails = contest.problems.map(p => ({
            ...p,
            _id: p.problemId?._id || p.problemId,
            title: p.problemId?.title || `Problem ${p.order}`,
            difficulty: p.problemId?.difficulty || 'medium'
          }));
          setSelectedProblems(problemsWithDetails);
        }
        
        setSelectedContest(contest);
        setError('');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      setError('Failed to load contest details');
    } finally {
      setLoadingContest(false);
    }
  };

  const handleSelectContest = (contest) => {
    setSelectedContest(contest);
    fetchContestDetails(contest._id);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleRuleAdd = () => {
    const newRule = prompt('Enter a new rule:');
    if (newRule && newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()]
      });
    }
  };

  const handleRuleRemove = (index) => {
    const newRules = [...formData.rules];
    newRules.splice(index, 1);
    setFormData({ ...formData, rules: newRules });
  };

  const handleAddProblem = (problem) => {
    if (!selectedProblems.find(p => p._id === problem._id)) {
      const problemWithPoints = {
        problemId: problem._id,
        points: 100,
        order: selectedProblems.length + 1,
        title: problem.title,
        difficulty: problem.difficulty,
        _id: problem._id
      };
      setSelectedProblems([...selectedProblems, problemWithPoints]);
    }
  };

  const handleRemoveProblem = (problemId) => {
    setSelectedProblems(selectedProblems.filter(p => p._id !== problemId));
  };

  const handleProblemPointsChange = (problemId, points) => {
    setSelectedProblems(selectedProblems.map(p => 
      p._id === problemId ? { ...p, points: parseInt(points) || 100 } : p
    ));
  };

  const handleProblemOrderChange = (problemId, order) => {
    setSelectedProblems(selectedProblems.map(p => 
      p._id === problemId ? { ...p, order: parseInt(order) || 1 } : p
    ));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();
    
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    else if (startTime < now) newErrors.startTime = 'Start time must be in the future';
    
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    else if (endTime <= startTime) newErrors.endTime = 'End time must be after start time';
    
    if (selectedProblems.length === 0) {
      newErrors.problems = 'At least one problem is required';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    if (!validateForm() || !selectedContest) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare problems array
      const contestProblems = selectedProblems.map(p => ({
        problemId: p.problemId || p._id,
        points: p.points || 100,
        order: p.order || selectedProblems.indexOf(p) + 1
      }));
      
      const contestData = {
        ...formData,
        problems: contestProblems
      };
      
      const { data } = await axiosClient.put(`/api/contests/${selectedContest._id}`, contestData);
      
      if (data.success) {
        setSuccess('Contest updated successfully!');
        // Refresh contest list
        fetchContests();
        // Update selected contest with new data
        setSelectedContest(data.contest);
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to update contest');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
      console.error('Error updating contest:', error);
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

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchProblem.toLowerCase()) ||
    problem.tags?.some(tag => tag.toLowerCase().includes(searchProblem.toLowerCase()))
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500 mb-4">
              <Edit size={36} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Update Contests</h1>
            <p className="text-purple-300">
              Select a contest to update its details, problems, and settings
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
            <AlertCircle size={20} />
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
                          ? 'bg-blue-500/10 border-blue-500'
                          : 'bg-black/30 border-purple-500/30 hover:border-purple-500'
                      }`}
                      onClick={() => handleSelectContest(contest)}
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
                            <div className="flex items-center gap-1">
                              <Award size={14} className="text-yellow-400" />
                              <span>{contest.problems?.length || 0} problems</span>
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
                              handleSelectContest(contest);
                            }}
                            className="btn btn-xs btn-outline border-green-500 text-green-400 hover:bg-green-600"
                            title="Edit Contest"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Update Form */}
          <div>
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6 sticky top-6">
              {selectedContest ? (
                <>
                  {loadingContest ? (
                    <div className="text-center py-8">
                      <Loader className="animate-spin text-blue-400 mx-auto mb-4" size={30} />
                      <p>Loading contest details...</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-4">Update Contest</h2>
                      
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`badge ${getStatusColor(selectedContest.status)}`}>
                            {selectedContest.status}
                          </span>
                          <span className="text-sm text-gray-400">
                            ID: {selectedContest._id.substring(0, 8)}...
                          </span>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Basic Info */}
                          <div className="space-y-4">
                            <div>
                              <label className="label">
                                <span className="label-text text-white">Title</span>
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
                                  formErrors.title ? 'border-red-500' : ''
                                }`}
                                placeholder="Contest Title"
                              />
                              {formErrors.title && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>
                              )}
                            </div>

                            <div>
                              <label className="label">
                                <span className="label-text text-white">Description</span>
                              </label>
                              <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`textarea textarea-bordered w-full bg-black/50 border-purple-500 text-white ${
                                  formErrors.description ? 'border-red-500' : ''
                                }`}
                                rows="3"
                                placeholder="Contest description"
                              />
                              {formErrors.description && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text text-white flex items-center gap-2">
                                  <Calendar size={14} />
                                  Start Time
                                </span>
                              </label>
                              <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
                                  formErrors.startTime ? 'border-red-500' : ''
                                }`}
                              />
                              {formErrors.startTime && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.startTime}</p>
                              )}
                            </div>

                            <div>
                              <label className="label">
                                <span className="label-text text-white flex items-center gap-2">
                                  <Calendar size={14} />
                                  End Time
                                </span>
                              </label>
                              <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${
                                  formErrors.endTime ? 'border-red-500' : ''
                                }`}
                              />
                              {formErrors.endTime && (
                                <p className="text-red-400 text-sm mt-1">{formErrors.endTime}</p>
                              )}
                            </div>
                          </div>

                          {/* Difficulty & Privacy */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="label">
                                <span className="label-text text-white">Difficulty</span>
                              </label>
                              <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                className="select select-bordered w-full bg-black/50 border-purple-500 text-white"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-center pt-8">
                              <label className="label cursor-pointer">
                                <span className="label-text text-white mr-2">
                                  {formData.isPublic ? (
                                    <span className="flex items-center gap-1">
                                      <Globe size={14} /> Public
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Lock size={14} /> Private
                                    </span>
                                  )}
                                </span>
                                <input
                                  type="checkbox"
                                  name="isPublic"
                                  checked={formData.isPublic}
                                  onChange={handleInputChange}
                                  className="toggle toggle-primary"
                                />
                              </label>
                            </div>
                          </div>

                          {/* Prize Pool */}
                          <div>
                            <label className="label">
                              <span className="label-text text-white flex items-center gap-2">
                                <Award size={14} />
                                Prize Pool (Optional)
                              </span>
                            </label>
                            <input
                              type="text"
                              name="prizePool"
                              value={formData.prizePool}
                              onChange={handleInputChange}
                              className="input input-bordered w-full bg-black/50 border-purple-500 text-white"
                              placeholder="e.g., $1000"
                            />
                          </div>

                          {/* Tags */}
                          <div>
                            <label className="label">
                              <span className="label-text text-white flex items-center gap-2">
                                <Tag size={14} />
                                Tags
                              </span>
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                className="input input-bordered flex-1 bg-black/50 border-purple-500 text-white"
                                placeholder="Add a tag"
                              />
                              <button
                                type="button"
                                onClick={handleTagAdd}
                                className="btn btn-outline border-purple-500 text-purple-300"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map((tag, index) => (
                                <span key={index} className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => handleTagRemove(tag)}
                                    className="ml-2 hover:text-white"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Problems Section */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <label className="label">
                                <span className="label-text text-white font-bold">Problems</span>
                              </label>
                              <span className="text-sm text-gray-400">
                                {selectedProblems.length} selected
                              </span>
                            </div>
                            
                            {formErrors.problems && (
                              <p className="text-red-400 text-sm mb-2">{formErrors.problems}</p>
                            )}

                            {/* Search Problems */}
                            <div className="mb-4">
                              <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                                <input
                                  type="text"
                                  placeholder="Search problems..."
                                  value={searchProblem}
                                  onChange={(e) => setSearchProblem(e.target.value)}
                                  className="input input-sm input-bordered pl-10 w-full bg-black/50 border-purple-500 text-white"
                                />
                              </div>
                              
                              {/* Available Problems */}
                              <div className="max-h-40 overflow-y-auto mb-4">
                                {filteredProblems.slice(0, 5).map((problem) => (
                                  <div
                                    key={problem._id}
                                    className="flex justify-between items-center p-2 hover:bg-purple-500/10 rounded"
                                  >
                                    <div>
                                      <span className="font-medium">{problem.title}</span>
                                      <span className={`badge badge-xs ml-2 ${
                                        problem.difficulty === 'easy' ? 'badge-success' :
                                        problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                                      }`}>
                                        {problem.difficulty}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleAddProblem(problem)}
                                      disabled={selectedProblems.find(p => p._id === problem._id)}
                                      className="btn btn-xs btn-outline border-green-500 text-green-400"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Selected Problems */}
                            <div className="space-y-3">
                              {selectedProblems.map((problem, index) => (
                                <div key={problem._id} className="p-3 bg-black/30 rounded border border-purple-500/30">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="font-bold">{problem.order}. {problem.title}</span>
                                      <span className={`badge badge-xs ml-2 ${
                                        problem.difficulty === 'easy' ? 'badge-success' :
                                        problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                                      }`}>
                                        {problem.difficulty}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProblem(problem._id)}
                                      className="btn btn-xs btn-outline border-red-500 text-red-400"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="label label-text text-xs">Points</label>
                                      <input
                                        type="number"
                                        value={problem.points}
                                        onChange={(e) => handleProblemPointsChange(problem._id, e.target.value)}
                                        className="input input-xs w-full bg-black/50 border-purple-500"
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <label className="label label-text text-xs">Order</label>
                                      <input
                                        type="number"
                                        value={problem.order}
                                        onChange={(e) => handleProblemOrderChange(problem._id, e.target.value)}
                                        className="input input-xs w-full bg-black/50 border-purple-500"
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rules */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="label">
                                <span className="label-text text-white">Rules</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleRuleAdd}
                                className="btn btn-xs btn-outline border-purple-500 text-purple-300"
                              >
                                Add Rule
                              </button>
                            </div>
                            <ul className="space-y-2">
                              {formData.rules.map((rule, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-black/30 rounded">
                                  <span>{rule}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRuleRemove(index)}
                                    className="btn btn-xs btn-ghost text-red-400"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Submit Buttons */}
                          <div className="space-y-3 pt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className={`btn w-full ${
                                loading ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white hover:from-blue-700 hover:to-purple-700'
                              }`}
                            >
                              {loading ? (
                                <>
                                  <Loader className="animate-spin mr-2" size={20} />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Save size={20} className="mr-2" />
                                  Update Contest
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedContest(null)}
                              className="btn btn-outline w-full border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                            >
                              Select Different Contest
                            </button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/30 border border-gray-600 mb-4">
                    <Edit size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No Contest Selected</h3>
                  <p className="text-gray-400 text-sm">
                    Select a contest from the list to update its details
                  </p>
                </div>
              )}
            </div>

            {/* Alternative Actions */}
            {/* <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                Need to perform other actions?
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin/contests/create"
                  className="btn btn-outline btn-sm border-green-500 text-green-300 hover:bg-green-600"
                >
                  Create New Contest
                </Link>
                <Link
                  to="/admin/contests/delete"
                  className="btn btn-outline btn-sm border-red-500 text-red-300 hover:bg-red-600"
                >
                  Delete Contests
                </Link>
                <Link
                  to="/contests"
                  className="btn btn-outline btn-sm border-purple-500 text-purple-300 hover:bg-purple-600"
                >
                  View All Contests
                </Link>
              </div> 
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateContestPage;