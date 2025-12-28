// Team List
// src/components/Teams/TeamList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import teamService from '../../services/team.service';
import TeamModal from './TeamModal';
import toast from 'react-hot-toast';

const TeamList = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setShowModal(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await teamService.delete(teamId);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error('Failed to delete team');
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTeam(null);
    fetchTeams();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Teams</h1>
          <p className="text-gray-600 mt-1">Manage your maintenance teams and members</p>
        </div>
        {user.role === 'admin' && (
          <button
            onClick={handleAddTeam}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            {/* Team Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{team.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-600">{team.description}</p>
                  )}
                </div>
              </div>
              
              {user.role === 'admin' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Team Stats */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {team.members?.length || 0}
                </span>
                <span className="text-sm text-gray-600">members</span>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Team Members:</p>
              {team.members && team.members.length > 0 ? (
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl">{member.avatar}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold capitalize">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">
                  No members assigned yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No teams created yet</p>
          {user.role === 'admin' && (
            <button
              onClick={handleAddTeam}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Team
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TeamModal
          team={selectedTeam}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default TeamList; 