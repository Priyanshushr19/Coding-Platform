// pages/admin/CreateContestPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../../Utils/axiosClient';
import {
  Save, X, Plus, Trash2, Clock, Award, Tag,
  Lock, Globe, Calendar, Users, FileText,
  AlertCircle, CheckCircle, Loader, Settings, Search
} from 'lucide-react';

const CreateContestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [searchProblem, setSearchProblem] = useState('');
  const [selectedProblems, setSelectedProblems] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    rules: ['No plagiarism allowed', 'Submissions must be original'],
    prizePool: '',
    tags: [],
    difficulty: 'medium',
    isPublic: true,
    problems: []
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Fetch available problems
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      console.log('Problems API Response:', data);
      
      if (Array.isArray(data)) {
        console.log('Found problems:', data.length);
        setProblems(data);
      } else if (data && Array.isArray(data.problems)) {
        console.log('Found problems in data.problems:', data.problems.length);
        setProblems(data.problems);
      } else if (data && data.success && Array.isArray(data.data)) {
        console.log('Found problems in data.data:', data.data.length);
        setProblems(data.data);
      } else {
        console.error('Unexpected response format:', data);
        setProblems([]);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  // Helper function to safely format tags
  const formatTags = (tags) => {
    if (!tags) return 'No tags';
    if (Array.isArray(tags)) {
      return tags.slice(0, 2).map(tag => `#${tag}`).join(', ');
    }
    if (typeof tags === 'string') {
      return `#${tags}`;
    }
    return 'No tags';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
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

  // Add problem to contest
  const handleAddProblem = (problem) => {
    console.log('Adding problem:', problem);
    
    if (!selectedProblems.find(p => p.problemId === problem._id)) {
      // Ensure tags is always an array
      let tagsArray = [];
      if (Array.isArray(problem.tags)) {
        tagsArray = problem.tags;
      } else if (typeof problem.tags === 'string') {
        tagsArray = [problem.tags];
      } else if (problem.tags) {
        tagsArray = [String(problem.tags)];
      }
      
      const problemWithPoints = {
        _id: problem._id,
        problemId: problem._id,
        points: 100,
        order: selectedProblems.length + 1,
        title: problem.title || 'Untitled',
        difficulty: problem.difficulty || 'medium',
        tags: tagsArray
      };
      console.log('Problem added:', problemWithPoints);
      setSelectedProblems([...selectedProblems, problemWithPoints]);
    }
  };

  // Remove problem from contest
  const handleRemoveProblem = (problemId) => {
    console.log('Removing problem:', problemId);
    setSelectedProblems(selectedProblems.filter(p => p.problemId !== problemId && p._id !== problemId));
  };

  // Update problem points
  const handleProblemPointsChange = (problemId, points) => {
    setSelectedProblems(selectedProblems.map(p => 
      (p.problemId === problemId || p._id === problemId) ? { ...p, points: parseInt(points) || 100 } : p
    ));
  };

  // Update problem order
  const handleProblemOrderChange = (problemId, order) => {
    setSelectedProblems(selectedProblems.map(p => 
      (p.problemId === problemId || p._id === problemId) ? { ...p, order: parseInt(order) || 1 } : p
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');

    if (!validateForm()) {
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

      const { data } = await axiosClient.post('/api/contests', contestData);

      if (data.success) {
        setSuccess('Contest created successfully!');
        setTimeout(() => {
          navigate('/contests');
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Failed to create contest' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'An error occurred' });
      console.error('Error creating contest:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter problems based on search
  const filteredProblems = problems.filter(problem => {
    const searchLower = searchProblem.toLowerCase();
    const titleMatch = problem.title?.toLowerCase().includes(searchLower) || false;
    
    // Handle tags - could be string, array, or undefined
    let tagsMatch = false;
    if (problem.tags) {
      if (Array.isArray(problem.tags)) {
        tagsMatch = problem.tags.some(tag => 
          typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
        );
      } else if (typeof problem.tags === 'string') {
        tagsMatch = problem.tags.toLowerCase().includes(searchLower);
      }
    }
    
    return titleMatch || tagsMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="btn btn-ghost btn-sm text-purple-300 hover:text-white"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Create New Contest</h1>
          </div>
          <p className="text-purple-300">
            Fill in the details below to create a new coding contest
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-6 bg-green-500/20 border-green-500 text-green-300">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="alert alert-error mb-6 bg-red-500/20 border-red-500 text-red-300">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-400" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="label">
                  <span className="label-text text-white">Contest Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekly Coding Challenge #1"
                  className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="label">
                  <span className="label-text text-white">Difficulty Level</span>
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
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text text-white">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the contest, themes, target audience..."
                  className={`textarea textarea-bordered w-full bg-black/50 border-purple-500 text-white ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text text-white">Tags</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    placeholder="Add a tag and press Enter"
                    className="input input-bordered flex-1 bg-black/50 border-purple-500 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="btn bg-purple-600 border-purple-600 text-white"
                  >
                    <Plus size={20} />
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
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div>
                <label className="label">
                  <span className="label-text text-white">Start Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${errors.startTime ? 'border-red-500' : ''}`}
                />
                {errors.startTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="label">
                  <span className="label-text text-white">End Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full bg-black/50 border-purple-500 text-white ${errors.endTime ? 'border-red-500' : ''}`}
                />
                {errors.endTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contest Settings */}
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-purple-400" />
              Contest Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prize Pool */}
              <div>
                <label className="label">
                  <span className="label-text text-white">Prize Pool</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    placeholder="e.g., 1000 or Certificate"
                    className="input input-bordered w-full pl-8 bg-black/50 border-purple-500 text-white"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="label">
                  <span className="label-text text-white">Visibility</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: true })}
                      className="radio radio-primary"
                    />
                    <div className="flex items-center gap-1">
                      <Globe size={16} />
                      <span>Public</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      checked={!formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: false })}
                      className="radio radio-primary"
                    />
                    <div className="flex items-center gap-1">
                      <Lock size={16} />
                      <span>Private</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rules */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text text-white">Contest Rules</span>
                </label>
                <div className="space-y-2 mb-3">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-black/30 rounded">
                      <span className="flex-1">{rule}</span>
                      <button
                        type="button"
                        onClick={() => handleRuleRemove(index)}
                        className="btn btn-xs btn-ghost text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleRuleAdd}
                  className="btn btn-sm btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                >
                  <Plus size={16} className="mr-1" />
                  Add Rule
                </button>
              </div>
            </div>
          </div>

          {/* Problems Selection - Fixed Section */}
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-400" />
              Select Problems
            </h2>

            {errors.problems && (
              <div className="alert alert-error mb-4 bg-red-500/20 border-red-500 text-red-300">
                <AlertCircle size={16} />
                <span>{errors.problems}</span>
              </div>
            )}

            {/* Debug Info */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-blue-300">Debug Info:</span>
                  <span className="text-sm text-gray-400 ml-2">
                    Problems: {problems.length}, Filtered: {filteredProblems.length}, Selected: {selectedProblems.length}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => console.log('Problems:', problems)} 
                  className="btn btn-xs btn-outline border-blue-500 text-blue-300"
                >
                  Log Data
                </button>
              </div>
              {problems.length > 0 && (
                <div className="mt-2 text-xs text-gray-300">
                  <div>Sample: "{problems[0].title}" (ID: {problems[0]._id?.substring(0, 8)}...)</div>
                  <div>Has difficulty: {problems[0].difficulty ? 'Yes' : 'No'}, Has tags: {problems[0].tags ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>

            {/* Search Problems */}
            <div className="mb-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search problems by title or tags..."
                  value={searchProblem}
                  onChange={(e) => setSearchProblem(e.target.value)}
                  className="input input-bordered w-full bg-black/50 border-purple-500 text-white pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={18} />
              </div>

              {/* Selected Problems Count */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-300">
                  Selected Problems ({selectedProblems.length})
                </h3>
                <span className="text-sm text-gray-400">
                  {selectedProblems.length} of {problems.length} selected
                </span>
              </div>

              {/* Two Column Layout: Available Problems and Selected Problems */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Problems Column */}
                <div>
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 h-full">
                    <h4 className="font-bold mb-3 text-lg">Available Problems</h4>
                    {loadingProblems ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader className="animate-spin text-purple-400 mr-2" size={20} />
                        <span>Loading problems...</span>
                      </div>
                    ) : filteredProblems.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>No problems found</p>
                        <p className="text-sm mt-1">
                          {searchProblem.trim() ? 'Try a different search term' : 'No problems available in the system'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {filteredProblems.map(problem => (
                          <div
                            key={problem._id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedProblems.find(p => p.problemId === problem._id)
                                ? 'bg-purple-600/30 border-purple-500'
                                : 'bg-black/30 border-purple-500/30 hover:border-purple-400'
                            }`}
                            onClick={() => handleAddProblem(problem)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-bold text-white mb-1">{problem.title || 'Untitled Problem'}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`badge badge-sm ${
                                    problem.difficulty === 'easy' ? 'badge-success' :
                                    problem.difficulty === 'medium' ? 'badge-warning' :
                                    problem.difficulty === 'hard' ? 'badge-error' : 'badge-neutral'
                                  }`}>
                                    {problem.difficulty || 'medium'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatTags(problem.tags)}
                                  </span>
                                </div>
                              </div>
                              {selectedProblems.find(p => p.problemId === problem._id) ? (
                                <CheckCircle size={18} className="text-green-400 flex-shrink-0 ml-2" />
                              ) : (
                                <Plus size={18} className="text-purple-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Problems Column */}
                <div>
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 h-full">
                    <h4 className="font-bold mb-3 text-lg">Selected Problems Details</h4>

                    {selectedProblems.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No problems selected yet</p>
                        <p className="text-sm mt-1">Click on problems from the left panel to add them</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {selectedProblems.sort((a, b) => (a.order || 0) - (b.order || 0)).map((problem, index) => (
                          <div key={problem._id} className="p-4 bg-black/40 border border-purple-500/50 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-blue-300">#{problem.order || index + 1}</span>
                                  <h4 className="font-bold text-white">{problem.title || 'Untitled'}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`badge badge-sm ${
                                    problem.difficulty === 'easy' ? 'badge-success' :
                                    problem.difficulty === 'medium' ? 'badge-warning' :
                                    problem.difficulty === 'hard' ? 'badge-error' : 'badge-neutral'
                                  }`}>
                                    {problem.difficulty || 'medium'}
                                  </span>
                                  {Array.isArray(problem.tags) && problem.tags.length > 0 && (
                                    <span className="text-xs text-gray-400">
                                      {problem.tags.slice(0, 2).map(tag => `#${tag}`).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProblem(problem._id)}
                                className="btn btn-xs btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                title="Remove problem"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Points</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    value={problem.points || 100}
                                    onChange={(e) => handleProblemPointsChange(problem._id, e.target.value)}
                                    className="range range-xs range-primary flex-1"
                                  />
                                  <input
                                    type="number"
                                    value={problem.points || 100}
                                    onChange={(e) => handleProblemPointsChange(problem._id, e.target.value)}
                                    className="input input-xs w-16 bg-black/50 border-purple-500 text-center"
                                    min="1"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Order</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleProblemOrderChange(problem._id, Math.max(1, (problem.order || index + 1) - 1))}
                                    className="btn btn-xs btn-outline border-purple-500 text-purple-300"
                                    disabled={(problem.order || index + 1) <= 1}
                                  >
                                    ↑
                                  </button>
                                  <input
                                    type="number"
                                    value={problem.order || index + 1}
                                    onChange={(e) => handleProblemOrderChange(problem._id, e.target.value)}
                                    className="input input-xs w-16 bg-black/50 border-purple-500 text-center"
                                    min="1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleProblemOrderChange(problem._id, (problem.order || index + 1) + 1)}
                                    className="btn btn-xs btn-outline border-purple-500 text-purple-300"
                                    disabled={(problem.order || index + 1) >= selectedProblems.length}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/contests')}
              className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Create Contest
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContestPage;