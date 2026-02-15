import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video, Trophy,Calendar } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    // Problem Management
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    // Video Management
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    },
    // Contest Management (ONLY CREATE)
    {
      id: 'create-contest',
      title: 'Create Contest',
      description: 'Organize a new coding competition',
      icon: Trophy,
      color: 'btn-primary',
      bgColor: 'bg-blue-500/10',
      route: '/admin/contests/create'
    },
    // For Update Contest - show list to select which contest to update
    {
      id: 'update-contest',
      title: 'Update Contest',
      description: 'Modify existing contest details',
      icon: Calendar,
      color: 'btn-warning',
      bgColor: 'bg-yellow-500/10',
      route: '/admin/contests/update' // Page that lists all contests with edit buttons
    },
    // For Delete Contest - show list to select which contest to delete
    {
      id: 'delete-contest',
      title: 'Delete Contest',
      description: 'Remove contests permanently',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-red-500/10',
      route: '/admin/contests/delete' // Same page, but with delete options
    }

  ];

  // Group options by category
  const problemOptions = adminOptions.filter(opt =>
    opt.id.includes('create') || opt.id.includes('update') || opt.id.includes('delete')
  ).filter(opt => !opt.id.includes('contest'));

  const contestOptions = adminOptions.filter(opt =>
    opt.id.includes('contest')
  );

  const videoOptions = adminOptions.filter(opt =>
    opt.id.includes('video')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-purple-300 text-lg">
            Manage your platform's content and competitions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Plus size={22} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Create</p>
                <p className="text-sm text-purple-300">New Problems & Contests</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Edit size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Update</p>
                <p className="text-sm text-blue-300">Existing Content</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Delete</p>
                <p className="text-sm text-red-300">Remove Content</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Trophy size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Contests</p>
                <p className="text-sm text-green-300">Organize Competitions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Management Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap size={24} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Problem Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div
                  key={option.id}
                  className="card bg-black/50 border border-purple-500/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="card-body items-center text-center p-6">
                    <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
                      <IconComponent size={28} className="text-purple-400" />
                    </div>
                    <h3 className="card-title text-lg mb-2 text-white">
                      {option.title}
                    </h3>
                    <p className="text-purple-300 text-sm mb-4">
                      {option.description}
                    </p>
                    <div className="card-actions">
                      <NavLink
                        to={option.route}
                        className="btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 btn-sm"
                      >
                        Go to {option.title.split(' ')[0]}
                      </NavLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Management Section */}
        {videoOptions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Video size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Video Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className="card bg-black/50 border border-blue-500/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="card-body items-center text-center p-6">
                      <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
                        <IconComponent size={28} className="text-blue-400" />
                      </div>
                      <h3 className="card-title text-lg mb-2 text-white">
                        {option.title}
                      </h3>
                      <p className="text-blue-300 text-sm mb-4">
                        {option.description}
                      </p>
                      <div className="card-actions">
                        <NavLink
                          to={option.route}
                          className="btn bg-blue-600 border-blue-600 text-white hover:bg-blue-700 btn-sm"
                        >
                          Manage Videos
                        </NavLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Contest Management Section - CREATE, UPDATE, DELETE */}
        {contestOptions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Trophy size={24} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contest Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contestOptions.map((option) => {
                const IconComponent = option.icon;
                const isCreate = option.id.includes('create');
                const isUpdate = option.id.includes('update');
                const isDelete = option.id.includes('delete');

                // Determine button color and text based on action
                let buttonColor = "bg-green-600 border-green-600 hover:bg-green-700";
                let buttonText = option.title.split(' ')[0];

                if (isUpdate) {
                  buttonColor = "bg-yellow-600 border-yellow-600 hover:bg-yellow-700";
                } else if (isDelete) {
                  buttonColor = "bg-red-600 border-red-600 hover:bg-red-700";
                }

                return (
                  <div
                    key={option.id}
                    className="card bg-black/50 border border-green-500/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="card-body items-center text-center p-6">
                      <div className={`${option.bgColor} p-3 rounded-full mb-3`}>
                        <IconComponent size={28} className="text-green-400" />
                      </div>
                      <h3 className="card-title text-lg mb-2 text-white">
                        {option.title}
                      </h3>
                      <p className="text-green-300 text-sm mb-4">
                        {option.description}
                      </p>
                      <div className="card-actions">
                        <NavLink
                          to={option.route}
                          className={`btn ${buttonColor} text-white btn-sm`}
                        >
                          {isCreate && 'Create New Contest'}
                          {isUpdate && 'Update Contest'}
                          {isDelete && 'Delete Contest'}
                        </NavLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="card bg-black/40 border border-purple-500/30 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Quick Navigation</h3>
              <p className="text-purple-300">Access key admin functions quickly</p>
            </div>
            <div className="flex gap-3">
              <NavLink
                to="/contests"
                className="btn bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white"
              >
                View All Contests
              </NavLink>
              <NavLink
                to="/"
                className="btn btn-outline border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
              >
                <Home size={20} className="mr-2" />
                Home
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;