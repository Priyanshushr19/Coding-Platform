import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../Utils/axiosClient';

const UpdateProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProblem();
    } else {
      setError('No problem ID provided');
      setLoading(false);
    }
  }, [id]);

  // In the fetchProblem function, update it to:
  const fetchProblem = async () => {
    try {
      console.log('Fetching problem with ID:', id);
      const response = await axiosClient.get(`/problem/problemById/${id}`);
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Type of data:', typeof response.data);
      console.log('Keys in data:', Object.keys(response.data));

      // If data is nested inside another property
      const data = response.data.data || response.data.problem || response.data;
      console.log('Extracted data:', data);

      if (!data) {
        throw new Error('No data returned from server');
      }

      setProblem(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        difficulty: data.difficulty || 'medium',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
        visibleTestCases: data.visibleTestCases || [],
        hiddenTestCases: data.hiddenTestCases || [],
        startCode: data.startCode || [],
        referenceSolution: data.referenceSolution || []
      });

      console.log('Reference solution from API:', data.referenceSolution);
      console.log('Type of referenceSolution:', typeof data.referenceSolution);

    } catch (err) {
      console.error('Error fetching problem:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch problem');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setUpdating(true);
    setError('');
    
    console.log('Submitting update for problem ID:', id);
    console.log('Form tags value:', formData.tags);
    
    // Convert tags back to string format (matching the original 'array' string)
    // If tags is a comma-separated string like "array, string", keep it as is
    // If it's an array, join it back to a string
    let tagsToSend = formData.tags;
    
    // If formData.tags is already a string (which it should be), use it directly
    if (typeof tagsToSend !== 'string') {
      // If somehow it's an array, join it
      tagsToSend = Array.isArray(tagsToSend) ? tagsToSend.join(', ') : String(tagsToSend);
    }
    
    // Send tags as a STRING, not an array
    const submitData = {
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      tags: tagsToSend, // Send as string
      visibleTestCases: problem?.visibleTestCases || [],
      hiddenTestCases: problem?.hiddenTestCases || [],
      startCode: problem?.startCode || [],
      referenceSolution: problem?.referenceSolution || []
    };
    
    console.log('Submit data:', submitData);
    console.log('Tags type:', typeof submitData.tags);
    console.log('Tags value:', submitData.tags);
    
    const response = await axiosClient.put(`/problem/update/${id}`, submitData);
    console.log('Update response:', response);
    
    alert('Problem updated successfully!');
    navigate('/admin/update');
    
  } catch (err) {
    console.error('Update error:', err);
    console.error('Error response:', err.response);
    console.error('Error data:', err.response?.data);
    
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        'Failed to update problem';
    setError(errorMessage);
  } finally {
    setUpdating(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <p>Loading problem details...</p>
        <p className="text-sm text-gray-500">ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <button
        onClick={() => navigate('/admin/update')}
        className="btn btn-ghost mb-4"
      >
        ← Back to Problems List
      </button>

      <h1 className="text-3xl font-bold mb-2">Update Problem</h1>
      <p className="text-gray-600 mb-6">Problem ID: {id}</p>

      {/* Debug info (remove in production) */}
      {problem && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <strong>Debug:</strong> Found problem: {problem.title}
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <div className="flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
            </svg>
            <label>{error}</label>
          </div>
          <button
            onClick={() => setError('')}
            className="btn btn-sm btn-ghost"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-base-100 p-6 rounded-lg shadow">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Title *</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
            disabled={updating}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Description *</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full h-48"
            required
            disabled={updating}
            placeholder="Enter problem description..."
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Difficulty *</span>
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={updating}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Tags</span>
            <span className="label-text-alt text-gray-500">Comma separated</span>
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="input input-bordered w-full"
            disabled={updating}
            placeholder="e.g., array, string, dynamic-programming"
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Current tags will appear as: {formData.tags}
            </span>
          </label>
        </div>

        <div className="divider"></div>

        <div className="flex justify-between items-center pt-4">
          <div>
            <button
              type="button"
              onClick={() => navigate('/admin/update')}
              className="btn btn-outline"
              disabled={updating}
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchProblem}
              className="btn btn-ghost"
              disabled={updating || loading}
            >
              Reload Original
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating}
            >
              {updating ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Updating...
                </>
              ) : 'Update Problem'}
            </button>
          </div>
        </div>
      </form>

      {/* Additional debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <p className="text-sm">Problem ID from URL: <code>{id}</code></p>
        <p className="text-sm">Current form data: <code>{JSON.stringify(formData, null, 2)}</code></p>
        <p className="text-sm">API Endpoint: <code>PUT /problem/update/{id}</code></p>
      </div>
    </div>
  );
};

export default UpdateProblemForm;