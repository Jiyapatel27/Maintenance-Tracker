// Equipment List
import React, { useState, useEffect } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import equipmentService from '../../services/equipment.service';
import requestService from '../../services/request.service';
import EquipmentModal from './EquipmentModal';
import toast from 'react-hot-toast';

const EquipmentList = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getAll();
      setEquipment(data);
    } catch (error) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleShowRequests = async (equip) => {
    try {
      const requests = await equipmentService.getRequests(equip._id);
      toast.success(`${requests.length} maintenance requests found`);
    } catch (error) {
      toast.error('Failed to load requests');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading equipment...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
        {user.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.serialNumber}</p>
              </div>
              <span className="text-3xl">{item.teamId?.icon || '⚙️'}</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-900">{item.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Department:</span>
                <span className="font-semibold text-gray-900">{item.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold text-gray-900">{item.location}</span>
              </div>
            </div>

            <button
              onClick={() => handleShowRequests(item)}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              View Maintenance
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <EquipmentModal
          onClose={() => {
            setShowModal(false);
            fetchEquipment();
          }}
        />
      )}
    </div>
  );
};

export default EquipmentList;