import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProblems, 
  fetchSolvedProblems, 
  setFilters 
} from '../slices/problemSlice';
import { 
  Search, Filter, ChevronRight, ChevronLeft,
  TrendingUp, TrendingDown, Clock, Award,
  CheckCircle, XCircle, AlertCircle, RefreshCw,
  BarChart, Target, Users, Star
} from 'lucide-react';

const AllProblemsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems, filters, loading, error } = useSelector((state) => state.problems);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch problems if not already loaded
    if (problems.length === 0) {
      dispatch(fetchProblems());
    }
    
    // Fetch solved problems if user exists
    if (user && solvedProblems.length === 0) {
      dispatch(fetchSolvedProblems(user.id));
    }
  }, [dispatch, user, problems.length, solvedProblems.length]);

  // Create solved problems set for quick lookup
  const solvedSet = new Set(solvedProblems.map(p => p._id || p.problemId));

  // Filter and sort problems
  const filteredAndSortedProblems = problems
    .filter(problem => {
      if (!problem) return false;

      // Search filter
      const searchMatch = searchTerm === '' || 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags?.toLowerCase().includes(searchTerm.toLowerCase());

      // Difficulty filter
      const difficultyMatch = 
        filters.difficulty === 'all' ||
        problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

      // Tag filter
      const tagMatch = 
        filters.tag === 'all' ||
        problem.tags?.toLowerCase().includes(filters.tag.toLowerCase());

      // Status filter
      const statusMatch =
        filters.status === 'all' ? true :
        filters.status === 'solved' ? solvedSet.has(problem._id) :
        !solvedSet.has(problem._id);

      return searchMatch && difficultyMatch && tagMatch && statusMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'difficulty-asc':
          const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          return (diffOrder[a.difficulty?.toLowerCase()] || 0) - (diffOrder[b.difficulty?.toLowerCase()] || 0);
        
        case 'difficulty-desc':
          const diffOrderDesc = { 'easy': 3, 'medium': 2, 'hard': 1 };
          return (diffOrderDesc[a.difficulty?.toLowerCase()] || 0) - (diffOrderDesc[b.difficulty?.toLowerCase()] || 0);
        
        case 'title-asc':
          return a.title?.localeCompare(b.title);
        
        case 'title-desc':
          return b.title?.localeCompare(a.title);
        
        case 'acceptance-desc':
          return (b.acceptanceRate || 0) - (a.acceptanceRate || 0);
        
        case 'acceptance-asc':
          return (a.acceptanceRate || 0) - (b.acceptanceRate || 0);
        
        default:
          return 0; // Default order
      }
    });

  // Pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredAndSortedProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredAndSortedProblems.length / problemsPerPage);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    dispatch(setFilters({ difficulty: 'all', tag: 'all', status: 'all' }));
    setSearchTerm('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const getDifficultyBadgeColor = (difficulty) => {
    if (!difficulty) return 'badge-neutral';
    
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getAcceptanceColor = (rate) => {
    if (!rate) return 'text-gray-400';
    if (rate >= 70) return 'text-green-400';
    if (rate >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleRefresh = () => {
    dispatch(fetchProblems());
    if (user) {
      dispatch(fetchSolvedProblems(user.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-black/50 border-b border-purple-500/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-ghost btn-sm text-purple-300 hover:text-white mb-4"
              >
                <ChevronLeft size={20} />
                Back to Home
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Coding Problems</h1>
              <p className="text-purple-300">Practice coding problems to improve your skills</p>
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
              >
                <Filter size={18} className="mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{problems.length}</div>
              <div className="text-sm text-purple-300">Total Problems</div>
            </div>
            <div className="bg-black/40 border border-green-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">{solvedSet.size}</div>
              <div className="text-sm text-green-300">Solved</div>
            </div>
            <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {problems.length > 0 
                  ? Math.round(problems.reduce((sum, p) => sum + (p.acceptanceRate || 0), 0) / problems.length)
                  : 0}%
              </div>
              <div className="text-sm text-blue-300">Avg. Acceptance</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length}
              </div>
              <div className="text-sm text-yellow-300">Hard Problems</div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="text"
                placeholder="Search problems by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10 bg-black/50 border-purple-500 text-white placeholder-purple-300/50"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Filter Problems</h3>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-ghost text-purple-300 hover:text-white"
                >
                  Reset All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Status</label>
                  <div className="space-y-2">
                    {['all', 'solved', 'unsolved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange({ ...filters, status })}
                        className={`btn btn-sm w-full justify-start ${
                          filters.status === status 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-black/50 border-purple-500/50 text-purple-300'
                        }`}
                      >
                        {status === 'all' && 'All Problems'}
                        {status === 'solved' && (
                          <>
                            <CheckCircle size={16} className="mr-2 text-green-400" />
                            Solved
                          </>
                        )}
                        {status === 'unsolved' && (
                          <>
                            <XCircle size={16} className="mr-2 text-red-400" />
                            Unsolved
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Difficulty</label>
                  <div className="space-y-2">
                    {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => handleFilterChange({ ...filters, difficulty })}
                        className={`btn btn-sm w-full justify-start ${
                          filters.difficulty === difficulty 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-black/50 border-purple-500/50 text-purple-300'
                        }`}
                      >
                        {difficulty === 'all' && 'All Difficulties'}
                        {difficulty === 'easy' && (
                          <>
                            <div className={`badge badge-xs mr-2 ${getDifficultyBadgeColor('easy')}`}></div>
                            Easy
                          </>
                        )}
                        {difficulty === 'medium' && (
                          <>
                            <div className={`badge badge-xs mr-2 ${getDifficultyBadgeColor('medium')}`}></div>
                            Medium
                          </>
                        )}
                        {difficulty === 'hard' && (
                          <>
                            <div className={`badge badge-xs mr-2 ${getDifficultyBadgeColor('hard')}`}></div>
                            Hard
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Tags</label>
                  <select
                    value={filters.tag}
                    onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
                    className="select select-bordered w-full bg-black/50 border-purple-500 text-white"
                  >
                    <option value="all">All Tags</option>
                    <option value="array">Array</option>
                    <option value="string">String</option>
                    <option value="linked list">Linked List</option>
                    <option value="tree">Tree</option>
                    <option value="graph">Graph</option>
                    <option value="dynamic programming">Dynamic Programming</option>
                    <option value="sorting">Sorting</option>
                    <option value="searching">Searching</option>
                    <option value="matrix">Matrix</option>
                    <option value="hash table">Hash Table</option>
                    <option value="stack">Stack</option>
                    <option value="queue">Queue</option>
                    <option value="heap">Heap</option>
                    <option value="greedy">Greedy</option>
                    <option value="backtracking">Backtracking</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="text-sm text-purple-300">
              Showing {filteredAndSortedProblems.length} of {problems.length} problems
              {filteredAndSortedProblems.length !== problems.length && (
                <span className="ml-2">
                  ({solvedSet.size} solved)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-purple-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered bg-black/50 border-purple-500 text-white"
              >
                <option value="default">Default</option>
                <option value="difficulty-asc">Difficulty (Easy → Hard)</option>
                <option value="difficulty-desc">Difficulty (Hard → Easy)</option>
                <option value="title-asc">Title (A → Z)</option>
                <option value="title-desc">Title (Z → A)</option>
                <option value="acceptance-desc">Acceptance (High → Low)</option>
                <option value="acceptance-asc">Acceptance (Low → High)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
            <button 
              className="btn btn-sm ml-auto" 
              onClick={() => dispatch(fetchProblems())}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && problems.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg text-purple-400"></div>
              <p className="text-purple-300 mt-4">Loading problems...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Problems Table */}
            {currentProblems.length === 0 ? (
              <div className="text-center py-16 bg-black/40 border border-purple-500/30 rounded-xl">
                <Search size={64} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No problems found</h3>
                <p className="text-purple-300 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `No problems match "${searchTerm}". Try a different search term.`
                    : 'No problems match your current filters.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden mb-8">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-purple-900/20 border-b border-purple-500/30">
                  <div className="col-span-1 text-sm font-medium text-purple-300 text-center">#</div>
                  <div className="col-span-5 text-sm font-medium text-purple-300">Problem</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Difficulty</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Acceptance</div>
                  <div className="col-span-2 text-sm font-medium text-purple-300 text-center">Action</div>
                </div>

                {/* Problems List */}
                <div className="divide-y divide-purple-500/10">
                  {currentProblems.map((problem, index) => (
                    <div 
                      key={problem._id} 
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-purple-500/5 transition-colors"
                    >
                      {/* Problem Number */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-gray-400">
                          {indexOfFirstProblem + index + 1}
                        </span>
                      </div>

                      {/* Problem Info */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-white hover:text-purple-300 transition-colors">
                            <NavLink to={`/problem/${problem._id}`}>
                              {problem.title}
                            </NavLink>
                          </h3>
                          {solvedSet.has(problem._id) && (
                            <CheckCircle size={16} className="text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {problem.description}
                        </p>
                        {problem.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {problem.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="badge badge-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {problem.tags.split(',').length > 2 && (
                              <span className="badge badge-xs bg-gray-500/10 text-gray-400 border-gray-500/30">
                                +{problem.tags.split(',').length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>

                      {/* Acceptance Rate */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`font-medium ${getAcceptanceColor(problem.acceptanceRate)}`}>
                            {problem.acceptanceRate ? `${problem.acceptanceRate}%` : 'N/A'}
                          </div>
                          {problem.submissionsCount && (
                            <div className="text-xs text-gray-400">
                              {problem.submissionsCount.toLocaleString()} submissions
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="col-span-2 flex items-center justify-center">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="btn btn-sm bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                        >
                          Solve
                        </NavLink>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-purple-300">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-ghost text-purple-300 hover:text-white disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`btn btn-sm ${
                          currentPage === pageNum
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'btn-ghost text-purple-300 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-ghost text-purple-300 hover:text-white disabled:opacity-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        {!loading && problems.length > 0 && (
          <div className="mt-12 pt-8 border-t border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-6">Problem Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{solvedSet.size}</div>
                    <div className="text-sm text-green-300">Problems Solved</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {problems.length > 0 
                    ? `${Math.round((solvedSet.size / problems.length) * 100)}% of total` 
                    : 'No problems'}
                </div>
              </div>
              
              <div className="bg-black/40 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length}
                    </div>
                    <div className="text-sm text-blue-300">Easy Problems</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Great for beginners and warm-ups
                </div>
              </div>
              
              <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Target size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-300">Medium Problems</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Most common in coding interviews
                </div>
              </div>
              
              <div className="bg-black/40 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Star size={24} className="text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length}
                    </div>
                    <div className="text-sm text-red-300">Hard Problems</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Challenge your problem-solving skills
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProblemsPage;