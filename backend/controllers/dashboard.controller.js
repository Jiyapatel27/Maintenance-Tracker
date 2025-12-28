// Dashboard Controller
// controllers/dashboard.controller.js
const Request = require('../models/Request.model');
const Equipment = require('../models/Equipment.model');
const User = require('../models/User.model');
const Team = require('../models/Team.model');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total counts
    const totalEquipment = await Equipment.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalTeams = await Team.countDocuments({ isActive: true });

    // Request statistics
    const totalRequests = await Request.countDocuments();
    const activeRequests = await Request.countDocuments({ 
      status: { $nin: ['repaired', 'scrap'] } 
    });
    const newRequests = await Request.countDocuments({ status: 'new' });
    const inProgressRequests = await Request.countDocuments({ status: 'in-progress' });
    const completedRequests = await Request.countDocuments({ status: 'repaired' });

    // Overdue requests
    const overdueRequests = await Request.countDocuments({
      scheduledDate: { $lt: today },
      status: { $nin: ['repaired', 'scrap'] }
    });

    // Requests by type
    const correctiveRequests = await Request.countDocuments({ type: 'corrective' });
    const preventiveRequests = await Request.countDocuments({ type: 'preventive' });

    // Requests by priority
    const highPriorityRequests = await Request.countDocuments({ 
      priority: 'high',
      status: { $nin: ['repaired', 'scrap'] }
    });

    // Recent requests
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Requests per team
    const requestsByTeam = await Request.aggregate([
      {
        $match: { status: { $nin: ['repaired', 'scrap'] } }
      },
      {
        $group: {
          _id: '$teamId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: '_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      {
        $unwind: '$team'
      },
      {
        $project: {
          teamName: '$team.name',
          teamIcon: '$team.icon',
          count: 1
        }
      }
    ]);

    // Equipment by category
    const equipmentByCategory = await Equipment.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEquipment,
          totalUsers,
          totalTeams,
          totalRequests,
          activeRequests,
          overdueRequests,
          completedRequests
        },
        requests: {
          new: newRequests,
          inProgress: inProgressRequests,
          completed: completedRequests,
          overdue: overdueRequests,
          corrective: correctiveRequests,
          preventive: preventiveRequests,
          highPriority: highPriorityRequests
        },
        recentRequests,
        requestsByTeam,
        equipmentByCategory
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };