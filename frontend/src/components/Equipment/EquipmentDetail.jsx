// Equipment Details
// src/components/Equipment/EquipmentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Calendar, User, MapPin, Package } from 'lucide-react';
import equipmentService from '../../services/equipment.service';
import toast from 'react-hot-toast';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      const equipmentData = await equipmentService.getById(id);
      const requestsData = await equipmentService.getRequests(id);
      
      setEquipment(equipmentData);
      setRequests(requestsData);
    } catch (error) {
      toast.error('Failed to load equipment details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Equipment not found</p>
      </div>
    );
  }

  const openRequests = requests.filter(r => r.status !== 'repaired' && r.status !== 'scrap');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipment')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
          <p className="text-gray-600">{equipment.serialNumber}</p>
        </div>
      </div>

      {/* Equipment Details Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem
            icon={Package}
            label="Category"
            value={equipment.category}
          />
          <DetailItem
            icon={MapPin}
            label="Location"
            value={equipment.location}
          />
          <DetailItem
            icon={User}
            label="Department"
            value={equipment.department}
          />
          <DetailItem
            icon={Calendar}
            label="Purchase Date"
            value={new Date(equipment.purchaseDate).toLocaleDateString()}
          />
          <DetailItem
            icon={Calendar}
            label="Warranty Until"
            value={equipment.warranty ? new Date(equipment.warranty).toLocaleDateString() : 'N/A'}
          />
          <DetailItem
            icon={User}
            label="Maintenance Team"
            value={`${equipment.teamId?.icon || ''} ${equipment.teamId?.name || 'N/A'}`}
          />
          <DetailItem
            icon={User}
            label="Default Technician"
            value={`${equipment.technicianId?.avatar || ''} ${equipment.technicianId?.name || 'N/A'}`}
          />
          <DetailItem
            icon={Wrench}
            label="Status"
            value={equipment.status}
            statusColor={
              equipment.status === 'operational' ? 'text-green-600' :
              equipment.status === 'maintenance' ? 'text-yellow-600' :
              'text-red-600'
            }
          />
        </div>
      </div>

      {/* Maintenance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Requests"
          value={requests.length}
          color="blue"
        />
        <StatCard
          title="Open Requests"
          value={openRequests.length}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={requests.filter(r => r.status === 'repaired').length}
          color="green"
        />
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance History</h2>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
            {requests.length} Total
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{request.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'repaired' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded ${
                    request.type === 'corrective' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {request.type === 'corrective' ? '🔧 Corrective' : '🔁 Preventive'}
                  </span>
                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                  {request.assignedTo && (
                    <span>Assigned to: {request.assignedTo.name}</span>
                  )}
                  {request.duration && (
                    <span>Duration: {request.duration}h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No maintenance history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value, statusColor }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-semibold ${statusColor || 'text-gray-900'}`}>{value}</p>
    </div>
  </div>
);

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 text-white`}>
      <p className="text-white/80 text-sm mb-2">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
};

export default EquipmentDetail;