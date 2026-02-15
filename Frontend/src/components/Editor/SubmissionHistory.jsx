import { useState, useEffect } from 'react';
import axiosClient from '../../Utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        console.log(response);
        
        // Validate and normalize the response data
        const responseData = response.data;
        
        if (Array.isArray(responseData)) {
          setSubmissions(responseData);
        } else if (responseData && Array.isArray(responseData.submissions)) {
          setSubmissions(responseData.submissions);
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setSubmissions(responseData.data);
        } else {
          console.warn('Unexpected API response format:', responseData);
          setSubmissions([]); // Set to empty array if format is unexpected
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to fetch submission history');
        setSubmissions([]); // Ensure submissions is always an array
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    } else {
      setLoading(false);
      setError('No problem ID provided');
      setSubmissions([]);
    }
  }, [problemId]);

  const getStatusColor = (status) => {
    if (!status) return 'badge-neutral';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted':
      case 'success': 
      case 'passed': return 'badge-success';
      case 'wrong answer':
      case 'wrong': 
      case 'failed': return 'badge-error';
      case 'error':
      case 'runtime error':
      case 'compilation error': return 'badge-warning';
      case 'pending':
      case 'processing': return 'badge-info';
      case 'time limit exceeded': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const getStatusDisplayText = (status) => {
    if (!status) return 'Unknown';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted': return 'Accepted';
      case 'wrong answer': return 'Wrong Answer';
      case 'runtime error': return 'Runtime Error';
      case 'compilation error': return 'Compilation Error';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'time limit exceeded': return 'Time Limit Exceeded';
      case 'success': return 'Success';
      case 'failed': return 'Failed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatMemory = (memory) => {
    if (memory === undefined || memory === null) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatRuntime = (runtime) => {
    if (runtime === undefined || runtime === null) return 'N/A';
    return `${runtime} sec`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Debug: Log the submissions data to see what we're getting
  useEffect(() => {
    if (submissions) {
      console.log('Submissions data:', submissions);
      console.log('Type of submissions:', typeof submissions);
      console.log('Is array:', Array.isArray(submissions));
    }
  }, [submissions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Ensure submissions is always an array before mapping
  const submissionsArray = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
      {submissionsArray.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>No submissions found for this problem</span>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissionsArray.map((sub, index) => (
                  <tr key={sub._id || sub.id || index}>
                    <td>{index + 1}</td>
                    <td className="font-mono">{sub.language || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getStatusColor(sub.status)}`}>
                        {getStatusDisplayText(sub.status)}
                      </span>
                    </td>
                    <td className="font-mono">{formatRuntime(sub.runtime)}</td>
                    <td className="font-mono">{formatMemory(sub.memory)}</td>
                    <td className="font-mono">
                      {sub.testCasesPassed ?? 'N/A'}/{sub.testCasesTotal ?? 'N/A'}
                    </td>
                    <td>{formatDate(sub.createdAt || sub.submittedAt)}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {submissionsArray.length} submission{submissionsArray.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-4">
              Submission Details: {selectedSubmission.language || 'Unknown Language'}
            </h3>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
                  {getStatusDisplayText(selectedSubmission.status)}
                </span>
                <span className="badge badge-outline">
                  Runtime: {formatRuntime(selectedSubmission.runtime)}
                </span>
                <span className="badge badge-outline">
                  Memory: {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="badge badge-outline">
                  Passed: {selectedSubmission.testCasesPassed ?? 'N/A'}/{selectedSubmission.testCasesTotal ?? 'N/A'}
                </span>
              </div>
              
              {(selectedSubmission.errorMessage || selectedSubmission.error) && (
                <div className="alert alert-error mt-2">
                  <div>
                    <span className="break-words">
                      {selectedSubmission.errorMessage || selectedSubmission.error}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="max-h-96 overflow-auto">
              <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
                <code className="whitespace-pre-wrap break-words">
                  {selectedSubmission.code || selectedSubmission.solution || 'No code available'}
                </code>
              </pre>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;