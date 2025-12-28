// CalendarView
// src/components/Requests/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import requestService from '../../services/request.service';
import RequestModal from './RequestModal';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getAll();
      // Filter only preventive requests with scheduled dates
      const preventiveRequests = data.filter(
        r => r.type === 'preventive' && r.scheduledDate
      );
      setRequests(preventiveRequests);
    } catch (error) {
      toast.error('Failed to load calendar data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getRequestsForDay = (day) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return requests.filter(r => {
      if (!r.scheduledDate) return false;
      const requestDate = r.scheduledDate.split('T')[0];
      return requestDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    if (!day) return;
    
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowModal(true);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day) => {
    if (!day) return false;
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return cellDate < today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and view preventive maintenance</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((day, index) => {
            const dayRequests = getRequestsForDay(day);
            const today = isToday(day);
            const past = isPastDate(day);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-28 p-2 border rounded-lg transition-all ${
                  day
                    ? `cursor-pointer ${
                        today
                          ? 'border-blue-500 border-2 bg-blue-50'
                          : past
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                {day && (
                  <>
                    {/* Day Number */}
                    <div className={`font-semibold mb-1 ${
                      today ? 'text-blue-600' : past ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>

                    {/* Requests */}
                    <div className="space-y-1">
                      {dayRequests.slice(0, 3).map(request => (
                        <div
                          key={request._id}
                          className={`text-xs p-1 rounded truncate ${
                            request.status === 'repaired'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                          title={request.subject}
                        >
                          {request.subject.substring(0, 15)}
                          {request.subject.length > 15 && '...'}
                        </div>
                      ))}
                      
                      {dayRequests.length > 3 && (
                        <div className="text-xs text-gray-500 font-semibold">
                          +{dayRequests.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
            <span className="text-gray-700">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-gray-700">New Request</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-gray-700">Completed</span>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <RequestModal
          request={null}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
            fetchRequests();
          }}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
};

export default CalendarView;