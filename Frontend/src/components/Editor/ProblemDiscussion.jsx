import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Send } from 'lucide-react';
import axiosClient from '../../Utils/axiosClient';

const ProblemDiscussion = () => {
  const [discussions, setDiscussions] = useState([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useSelector((state) => state.auth);
  const { problemId } = useParams();

  useEffect(() => {
    fetchProblemDiscussions();
  }, [problemId]);

  const fetchProblemDiscussions = async () => {
    try {
      const { data } = await axiosClient.get(`/discussion/problem/${problemId}`);
      setDiscussions(data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const createPost = async () => {
    try {
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axiosClient.post('/discussion', {
        ...newPost,
        tags,
        problemId // Include problemId in the post
      });
      setNewPost({ title: '', content: '', tags: '' });
      setShowNewPost(false);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // ... rest of the functions (addReply, handleLike, handleDislike, handleReplyLike) remain the same
  const addReply = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/reply`, {
        content: replyContent
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLike = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/like`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const handleDislike = async (discussionId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/dislike`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error disliking:', error);
    }
  };

  const handleReplyLike = async (discussionId, replyId) => {
    try {
      await axiosClient.post(`/discussion/${discussionId}/reply/${replyId}/like`);
      fetchProblemDiscussions();
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  return (
    <div className="h-[85vh] bg-gradient-to-br w-[800px] justify-between  from-purple-900 to-black p-6 ">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Problem Discussions</h1>
            <p className="text-purple-300">Discuss solutions and ask questions about this problem</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
          >
            <Plus size={20} className="mr-2" />
            New Question
          </button>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-purple-500 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Ask a Question</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Question Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="input input-bordered w-full bg-black border-purple-500 text-white"
                />
                <textarea
                  placeholder="Describe your question or share your approach..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="textarea textarea-bordered w-full h-32 bg-black border-purple-500 text-white"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated) e.g. algorithm, optimization, bug"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                  className="input input-bordered w-full bg-black border-purple-500 text-white"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="btn btn-ghost text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                  >
                    Post Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussions List */}
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion._id} className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
              {/* Discussion Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={discussion.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    className="w-10 h-10 rounded-full border-2 border-purple-500"
                    alt="profile"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{discussion.author.firstName}</h3>
                    <p className="text-purple-300 text-sm">
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {discussion.tags?.map((tag, index) => (
                    <span key={index} className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Discussion Content */}
              <h2 className="text-xl font-bold text-white mb-3">{discussion.title}</h2>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{discussion.content}</p>

              {/* Discussion Actions */}
              <div className="flex items-center gap-6 mb-4">
                <button
                  onClick={() => handleLike(discussion._id)}
                  className={`flex items-center gap-2 ${discussion.likes.includes(user?.id) ? 'text-green-400' : 'text-gray-400'}`}
                >
                  <ThumbsUp size={18} />
                  <span>{discussion.likes.length}</span>
                </button>
                <button
                  onClick={() => handleDislike(discussion._id)}
                  className={`flex items-center gap-2 ${discussion.dislikes.includes(user?.id) ? 'text-red-400' : 'text-gray-400'}`}
                >
                  <ThumbsDown size={18} />
                  <span>{discussion.dislikes.length}</span>
                </button>
                <button
                  onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                  className="flex items-center gap-2 text-purple-400"
                >
                  <MessageSquare size={18} />
                  <span>{discussion.replies.length} replies</span>
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === discussion._id && (
                <div className="mb-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="textarea textarea-bordered w-full bg-black border-purple-500 text-white mb-2"
                    rows="3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => addReply(discussion._id)}
                      className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-sm"
                    >
                      <Send size={16} className="mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="border-t border-purple-500/30 pt-4">
                  <h4 className="text-white font-semibold mb-3">Replies ({discussion.replies.length})</h4>
                  <div className="space-y-4">
                    {discussion.replies.map((reply) => (
                      <div key={reply._id} className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={reply.author.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                              className="w-8 h-8 rounded-full border border-purple-500"
                              alt="profile"
                            />
                            <span className="text-white text-sm font-medium">
                              {reply.author.firstName}
                            </span>
                            <span className="text-purple-300 text-xs">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleReplyLike(discussion._id, reply._id)}
                            className={`flex items-center gap-1 ${reply.likes.includes(user?.id) ? 'text-green-400' : 'text-gray-400'}`}
                          >
                            <ThumbsUp size={14} />
                            <span className="text-xs">{reply.likes.length}</span>
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {discussions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={64} className="mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
            <p className="text-purple-300 mb-6">Be the first to ask a question about this problem!</p>
            <button
              onClick={() => setShowNewPost(true)}
              className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
            >
              <Plus size={20} className="mr-2" />
              Start Discussion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDiscussion;