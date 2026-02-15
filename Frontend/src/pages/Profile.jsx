import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import { Trophy, Star, Calendar, Code } from 'lucide-react';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { problems, solvedProblems } = useSelector((state) => state.problems);
  
  const [userStats, setUserStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      const totalSolved = solvedProblems.length;
      const easySolved = solvedProblems.filter(p => p.difficulty === 'easy').length;
      const mediumSolved = solvedProblems.filter(p => p.difficulty === 'medium').length;
      const hardSolved = solvedProblems.filter(p => p.difficulty === 'hard').length;

      setUserStats({
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved
      });
      setLoading(false);
    };

    calculateStats();
  }, [solvedProblems]);

  const getProfilePictureUrl = () => {
    if (user?.profilePic) {
      return user.profilePic.startsWith("http")
        ? user.profilePic
        : `http://localhost:5005/${user.profilePic}`;
    }
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-purple-400"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <NavLink to="/" className="btn btn-ghost text-purple-400 mb-6">
            ← Back to Problems
          </NavLink>
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="card bg-black/50 border border-purple-500 rounded-2xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src={getProfilePictureUrl()}
                  className="w-24 h-24 rounded-full border-2 border-purple-500 object-cover"
                  alt="Profile"
                />
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user?.firstName} {user?.lastName}
                </h2>
                
                <p className="text-gray-300 mb-4">
                  {user?.email}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="badge bg-purple-500/20 text-purple-300 border-purple-500">
                    {user?.role || 'Member'}
                  </div>
                  <div className="badge bg-gray-500/20 text-gray-300 border-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined Jan 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Overall Stats */}
          <div className="card bg-black/50 border border-purple-500 rounded-2xl">
            <div className="card-body">
              <h3 className="card-title text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Coding Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                  <span className="text-purple-300">Total Solved</span>
                  <span className="text-white font-bold text-lg">{userStats.totalSolved}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                  <span className="text-purple-300">Total Problems</span>
                  <span className="text-white font-bold text-lg">{problems.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                  <span className="text-purple-300">Completion Rate</span>
                  <span className="text-white font-bold text-lg">
                    {problems.length > 0 ? Math.round((userStats.totalSolved / problems.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="card bg-black/50 border border-purple-500 rounded-2xl">
            <div className="card-body">
              <h3 className="card-title text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                Difficulty Breakdown
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <span className="text-green-300">Easy</span>
                  <span className="text-white font-bold">
                    {userStats.easySolved} / {problems.filter(p => p.difficulty === 'easy').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-300">Medium</span>
                  <span className="text-white font-bold">
                    {userStats.mediumSolved} / {problems.filter(p => p.difficulty === 'medium').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <span className="text-red-300">Hard</span>
                  <span className="text-white font-bold">
                    {userStats.hardSolved} / {problems.filter(p => p.difficulty === 'hard').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Achievements */}
        <div className="card bg-black/50 border border-purple-500 rounded-2xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              Milestones
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  name: 'First Problem', 
                  earned: userStats.totalSolved > 0, 
                  description: 'Solve your first coding problem'
                },
                { 
                  name: '5 Problems', 
                  earned: userStats.totalSolved >= 5, 
                  description: 'Solve 5 coding problems'
                },
                { 
                  name: '10 Problems', 
                  earned: userStats.totalSolved >= 10, 
                  description: 'Solve 10 coding problems'
                },
                { 
                  name: 'All Easy', 
                  earned: userStats.easySolved >= problems.filter(p => p.difficulty === 'easy').length && problems.filter(p => p.difficulty === 'easy').length > 0, 
                  description: 'Solve all easy problems'
                },
              ].map((milestone, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    milestone.earned 
                      ? 'bg-green-500/10 border-green-500 text-white' 
                      : 'bg-gray-500/10 border-gray-500 text-gray-400'
                  }`}
                >
                  <div className="font-semibold mb-1">{milestone.name}</div>
                  <div className="text-sm opacity-75">{milestone.description}</div>
                  <div className="text-xs mt-2">
                    {milestone.earned ? '✅ Completed' : '🔒 Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <NavLink to="/" className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-lg">
            Continue Solving Problems
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { NavLink } from 'react-router';
// import axiosClient from '../Utils/axiosClient';
// import { Crown, Trophy, Star, Calendar, Target, Zap, Clock, Award, Users, Code } from 'lucide-react';

// function ProfilePage() {
//   const { user } = useSelector((state) => state.auth);
//   const { problems, solvedProblems } = useSelector((state) => state.problems);
  
//   const [userStats, setUserStats] = useState({
//     totalSolved: 0,
//     easySolved: 0,
//     mediumSolved: 0,
//     hardSolved: 0,
//     submissionCount: 0,
//     accuracy: 0,
//     streak: 0,
//     rank: 0
//   });
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const calculateStats = () => {
//       const totalSolved = solvedProblems.length;
//       const easySolved = solvedProblems.filter(p => p.difficulty === 'easy').length;
//       const mediumSolved = solvedProblems.filter(p => p.difficulty === 'medium').length;
//       const hardSolved = solvedProblems.filter(p => p.difficulty === 'hard').length;
      
//       const accuracy = totalSolved > 0 ? Math.round((totalSolved / (totalSolved + 10)) * 100) : 0;
//       const rank = Math.max(1, 1000 - totalSolved * 10);

//       setUserStats({
//         totalSolved,
//         easySolved,
//         mediumSolved,
//         hardSolved,
//         submissionCount: totalSolved * 3, // Simulated submission count
//         accuracy,
//         streak: Math.floor(Math.random() * 15), // Simulated streak
//         rank
//       });
//     };

//     const fetchRecentActivity = async () => {
//       try {
//         // Simulate recent activity data
//         const activity = solvedProblems.slice(0, 5).map(problem => ({
//           id: problem._id,
//           title: problem.title,
//           difficulty: problem.difficulty,
//           timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
//           type: 'solved'
//         }));
//         setRecentActivity(activity);
//       } catch (error) {
//         console.error('Error fetching activity:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (solvedProblems.length > 0) {
//       calculateStats();
//       fetchRecentActivity();
//     } else {
//       setLoading(false);
//     }
//   }, [solvedProblems]);

//   const getProfilePictureUrl = () => {
//     if (user?.profilePic) {
//       return user.profilePic.startsWith("http")
//         ? user.profilePic
//         : `http://localhost:5005/${user.profilePic}`;
//     }
//     return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty?.toLowerCase()) {
//       case 'easy': return 'text-green-400';
//       case 'medium': return 'text-yellow-400';
//       case 'hard': return 'text-red-400';
//       default: return 'text-gray-400';
//     }
//   };

//   const getDifficultyBgColor = (difficulty) => {
//     switch (difficulty?.toLowerCase()) {
//       case 'easy': return 'bg-green-500/20';
//       case 'medium': return 'bg-yellow-500/20';
//       case 'hard': return 'bg-red-500/20';
//       default: return 'bg-gray-500/20';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
//         <div className="text-center">
//           <div className="loading loading-spinner loading-lg text-purple-400"></div>
//           <p className="text-white mt-4">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
        
//         {/* Header Section */}
//         <div className="text-center mb-8">
//           <NavLink to="/" className="btn btn-ghost text-purple-400 mb-6">
//             ← Back to Problems
//           </NavLink>
//           <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
//             Profile
//           </h1>
//         </div>

//         {/* Main Profile Card */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
//           {/* Profile Info Card */}
//           <div className="lg:col-span-1">
//             <div className="card bg-black/50 border border-purple-500/30 backdrop-blur-xl rounded-2xl">
//               <div className="card-body">
//                 {/* Profile Picture and Basic Info */}
//                 <div className="text-center">
//                   <div className="relative inline-block mb-4">
//                     <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75"></div>
//                     <img
//                       src={getProfilePictureUrl()}
//                       className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover relative z-10"
//                       alt="Profile"
//                     />
//                   </div>
                  
//                   <h2 className="text-2xl font-bold text-white mb-2">
//                     {user?.firstName} {user?.lastName}
//                   </h2>
                  
//                   <div className="flex items-center justify-center gap-2 mb-4">
//                     <div className="badge bg-purple-500/20 text-purple-300 border-purple-500/50">
//                       {user?.role || 'Member'}
//                     </div>
//                     {user?.role === 'admin' && (
//                       <div className="badge bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
//                         <Crown className="w-3 h-3 mr-1" />
//                         Admin
//                       </div>
//                     )}
//                   </div>

//                   <p className="text-gray-300 text-sm mb-6">
//                     {user?.email}
//                   </p>

//                   {/* Join Date */}
//                   <div className="flex items-center justify-center gap-2 text-purple-300 mb-6">
//                     <Calendar className="w-4 h-4" />
//                     <span className="text-sm">Joined January 2024</span>
//                   </div>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
//                     <span className="text-purple-300">Member Since</span>
//                     <span className="text-white font-semibold">2 months</span>
//                   </div>
                  
//                   <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
//                     <span className="text-purple-300">Active Streak</span>
//                     <span className="text-white font-semibold flex items-center gap-1">
//                       <Zap className="w-4 h-4 text-yellow-400" />
//                       {userStats.streak} days
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Stats and Progress Cards */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Overall Stats Card */}
//             <div className="card bg-black/50 border border-purple-500/30 backdrop-blur-xl rounded-2xl">
//               <div className="card-body">
//                 <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
//                   <Trophy className="w-6 h-6 text-yellow-400" />
//                   Coding Statistics
//                 </h3>
                
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                   <div className="text-center p-4 bg-purple-500/10 rounded-xl">
//                     <div className="text-2xl font-bold text-white mb-1">{userStats.totalSolved}</div>
//                     <div className="text-purple-300 text-sm">Solved</div>
//                   </div>
                  
//                   <div className="text-center p-4 bg-purple-500/10 rounded-xl">
//                     <div className="text-2xl font-bold text-white mb-1">{problems.length}</div>
//                     <div className="text-purple-300 text-sm">Total</div>
//                   </div>
                  
//                   <div className="text-center p-4 bg-purple-500/10 rounded-xl">
//                     <div className="text-2xl font-bold text-white mb-1">{userStats.accuracy}%</div>
//                     <div className="text-purple-300 text-sm">Accuracy</div>
//                   </div>
                  
//                   <div className="text-center p-4 bg-purple-500/10 rounded-xl">
//                     <div className="text-2xl font-bold text-white mb-1">#{userStats.rank}</div>
//                     <div className="text-purple-300 text-sm">Rank</div>
//                   </div>
//                 </div>

//                 {/* Progress Bars */}
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between text-sm text-purple-300 mb-2">
//                       <span>Easy</span>
//                       <span>{userStats.easySolved} solved</span>
//                     </div>
//                     <progress 
//                       className="progress progress-success w-full" 
//                       value={userStats.easySolved} 
//                       max={problems.filter(p => p.difficulty === 'easy').length || 1}
//                     ></progress>
//                   </div>
                  
//                   <div>
//                     <div className="flex justify-between text-sm text-purple-300 mb-2">
//                       <span>Medium</span>
//                       <span>{userStats.mediumSolved} solved</span>
//                     </div>
//                     <progress 
//                       className="progress progress-warning w-full" 
//                       value={userStats.mediumSolved} 
//                       max={problems.filter(p => p.difficulty === 'medium').length || 1}
//                     ></progress>
//                   </div>
                  
//                   <div>
//                     <div className="flex justify-between text-sm text-purple-300 mb-2">
//                       <span>Hard</span>
//                       <span>{userStats.hardSolved} solved</span>
//                     </div>
//                     <progress 
//                       className="progress progress-error w-full" 
//                       value={userStats.hardSolved} 
//                       max={problems.filter(p => p.difficulty === 'hard').length || 1}
//                     ></progress>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Achievements Card */}
//             <div className="card bg-black/50 border border-purple-500/30 backdrop-blur-xl rounded-2xl">
//               <div className="card-body">
//                 <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
//                   <Award className="w-6 h-6 text-purple-400" />
//                   Achievements
//                 </h3>
                
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   {[
//                     { icon: <Target className="w-8 h-8" />, name: 'First Problem', earned: userStats.totalSolved > 0, color: 'text-green-400' },
//                     { icon: <Star className="w-8 h-8" />, name: '5 Problems', earned: userStats.totalSolved >= 5, color: 'text-yellow-400' },
//                     { icon: <Trophy className="w-8 h-8" />, name: '10 Problems', earned: userStats.totalSolved >= 10, color: 'text-purple-400' },
//                     { icon: <Zap className="w-8 h-8" />, name: '7-Day Streak', earned: userStats.streak >= 7, color: 'text-orange-400' },
//                     { icon: <Users className="w-8 h-8" />, name: 'Top 100', earned: userStats.rank <= 100, color: 'text-blue-400' },
//                     { icon: <Code className="w-8 h-8" />, name: 'All Easy', earned: userStats.easySolved >= problems.filter(p => p.difficulty === 'easy').length, color: 'text-pink-400' },
//                   ].map((achievement, index) => (
//                     <div 
//                       key={index}
//                       className={`text-center p-4 rounded-xl border-2 transition-all ${
//                         achievement.earned 
//                           ? 'bg-green-500/10 border-green-500/50' 
//                           : 'bg-gray-500/10 border-gray-500/30 opacity-50'
//                       }`}
//                     >
//                       <div className={`mb-2 ${achievement.earned ? achievement.color : 'text-gray-400'}`}>
//                         {achievement.icon}
//                       </div>
//                       <div className={`text-sm font-semibold ${
//                         achievement.earned ? 'text-white' : 'text-gray-400'
//                       }`}>
//                         {achievement.name}
//                       </div>
//                       <div className="text-xs text-purple-300 mt-1">
//                         {achievement.earned ? 'Unlocked' : 'Locked'}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="card bg-black/50 border border-purple-500/30 backdrop-blur-xl rounded-2xl">
//           <div className="card-body">
//             <h3 className="card-title text-white text-xl mb-6 flex items-center gap-2">
//               <Clock className="w-6 h-6 text-purple-400" />
//               Recent Activity
//             </h3>
            
//             {recentActivity.length > 0 ? (
//               <div className="space-y-3">
//                 {recentActivity.map((activity) => (
//                   <div key={activity.id} className="flex items-center justify-between p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
//                     <div className="flex items-center gap-4">
//                       <div className={`p-2 rounded-lg ${getDifficultyBgColor(activity.difficulty)}`}>
//                         <Trophy className={`w-5 h-5 ${getDifficultyColor(activity.difficulty)}`} />
//                       </div>
//                       <div>
//                         <div className="text-white font-semibold">{activity.title}</div>
//                         <div className="text-purple-300 text-sm">
//                           Solved • {activity.timestamp.toLocaleDateString()}
//                         </div>
//                       </div>
//                     </div>
//                     <div className={`badge ${getDifficultyBgColor(activity.difficulty)} text-white border-0`}>
//                       {activity.difficulty}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <Code className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
//                 <p className="text-purple-300 text-lg">No recent activity yet</p>
//                 <p className="text-purple-400 text-sm mt-2">Start solving problems to see your activity here!</p>
//                 <NavLink to="/" className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 mt-4">
//                   Start Solving
//                 </NavLink>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Call to Action */}
//         <div className="text-center mt-8">
//           <NavLink to="/" className="btn bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white hover:from-purple-700 hover:to-pink-700 btn-lg">
//             Continue Solving Problems
//           </NavLink>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;