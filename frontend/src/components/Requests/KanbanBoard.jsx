// Kanban Board
// src/components/Requests/KanbanBoard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import requestService from '../../services/request.service';
import RequestModal from './RequestModal';
import toast from 'react-hot-toast';

const KanbanBoard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [draggedRequest, setDraggedRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const stages = {
    new: { label: 'New', color: 'bg-blue-500', borderColor: 'border-blue-500' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-500', borderColor: 'border-yellow-500' },
    repaired: { label: 'Repaired', color: 'bg-green-500', borderColor: 'border-green-500' },
    scrap: { label: 'Scrap', color: 'bg-red-500', borderColor: 'border-red-500' }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getAll();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestsForStage = (status) => {
    let filtered = requests.filter(r => r.status === status);
    
    // Technicians only see their assigned requests or unassigned new requests
    if (user.role === 'technician') {
      filtered = filtered.filter(r => 
        r.assignedTo?._id === user._id || 
        (status === 'new' && !r.assignedTo && r.teamId?._id === user.teamId)
      );
    }
    
    return filtered;
  };

  const handleDragStart = (e, request) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedRequest) return;

    // Don't update if status is the same
    if (draggedRequest.status === newStatus) {
      setDraggedRequest(null);
      return;
    }

    try {
      const updateData = { status: newStatus };
      
      // If moving to repaired, set completion date
      if (newStatus === 'repaired') {
        updateData.completedDate = new Date().toISOString();
      }

      await requestService.update(draggedRequest._id, updateData);
      
      // Update local state
      setRequests(requests.map(req => 
        req._id === draggedRequest._id 
          ? { ...req, status: newStatus, ...updateData }
          : req
      ));

      toast.success(`Request moved to ${stages[newStatus].label}`);
    } catch (error) {
      toast.error('Failed to update request status');
      console.error(error);
    } finally {
      setDraggedRequest(null);
    }
  };

  const handleAssignToMe = async (requestId) => {
    try {
      await requestService.assign(requestId);
      fetchRequests();
      toast.success('Request assigned to you');
    } catch (error) {
      toast.error('Failed to assign request');
      console.error(error);
    }
  };

  const handleCardClick = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user.role === 'technician' ? 'My Tasks' : 'Kanban Board'}
        </h1>
        <p className="text-gray-600 mt-1">Drag and drop to update request status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(stages).map(([status, config]) => {
          const stageRequests = getRequestsForStage(status);
          
          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="bg-gray-50 rounded-2xl p-4 min-h-[600px] transition-colors"
            >
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <h3 className="font-bold text-gray-900">{config.label}</h3>
                <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {stageRequests.length}
                </span>
              </div>

              {/* Request Cards */}
              <div className="space-y-3">
                {stageRequests.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    borderColor={config.borderColor}
                    onDragStart={handleDragStart}
                    onAssignToMe={handleAssignToMe}
                    onClick={handleCardClick}
                    canAssign={status === 'new' && (user.role === 'technician' || user.role === 'manager') && !request.assignedTo}
                  />
                ))}
                
                {stageRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No requests</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Modal */}
      {showModal && (
        <RequestModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
};

const RequestCard = ({ request, borderColor, onDragStart, onAssignToMe, onClick, canAssign }) => {
  const isOverdue = request.scheduledDate && 
                    new Date(request.scheduledDate) < new Date() && 
                    request.status !== 'repaired' && 
                    request.status !== 'scrap';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request)}
      onClick={() => onClick(request)}
      className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-move border-l-4 ${borderColor} ${
        isOverdue ? 'ring-2 ring-red-500' : ''
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {request.subject}
        </h4>
        {request.assignedTo && (
          <span className="text-2xl flex-shrink-0 ml-2">{request.assignedTo.avatar}</span>
        )}
      </div>

      {/* Equipment Name */}
      <p className="text-xs text-gray-600 mb-2 truncate">
        {request.equipmentId?.name || 'N/A'}
      </p>

      {/* Priority & Type */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            request.priority === 'high'
              ? 'bg-red-100 text-red-700'
              : request.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {request.priority}
        </span>
        <span className="text-xs text-gray-500">
          {request.type === 'corrective' ? '🔧' : '🔁'}
        </span>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="mt-2 text-xs text-red-600 font-semibold">
          ⚠️ OVERDUE
        </div>
      )}

      {/* Scheduled Date */}
      {request.scheduledDate && (
        <div className="mt-2 text-xs text-gray-500">
          📅 {new Date(request.scheduledDate).toLocaleDateString()}
        </div>
      )}

      {/* Assign Button */}
      {canAssign && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignToMe(request._id);
          }}
          className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
        >
          Assign to Me
        </button>
      )}
    </div>
  );
};

export default KanbanBoard;