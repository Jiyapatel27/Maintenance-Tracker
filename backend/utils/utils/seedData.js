// utils/seedData.js
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db'); // use your db.js
const User = require('../models/User.model');
const Team = require('../models/Team.model');
const Equipment = require('../models/Equipment.model');
const Request = require('../models/Request.model');

const seedData = async () => {
  try {
    // Connect to MongoDB using config/db.js
    await connectDB();
    console.log('✅ MongoDB Connected for seeding');

    // Clear existing data
    await User.deleteMany();
    await Team.deleteMany();
    await Equipment.deleteMany();
    await Request.deleteMany();
    console.log('🗑️ Existing data cleared');

    // Teams
    const teams = await Team.create([
      { name: 'Mechanics', icon: '⚙️', description: 'Mechanical maintenance team' },
      { name: 'Electricians', icon: '⚡', description: 'Electrical maintenance team' },
      { name: 'IT Support', icon: '💻', description: 'IT support team' }
    ]);
    console.log('✅ Teams created');

    // Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@gearguard.com',
        password: 'admin123',
        role: 'admin',
        avatar: '👨‍💼'
      },
      {
        name: 'John Manager',
        email: 'manager@gearguard.com',
        password: 'manager123',
        role: 'manager',
        avatar: '👨‍💼'
      },
      {
        name: 'Mike Technician',
        email: 'mike@gearguard.com',
        password: 'tech123',
        role: 'technician',
        avatar: '👨‍🔧',
        teamId: teams[0]._id
      },
      {
        name: 'Sarah Technician',
        email: 'sarah@gearguard.com',
        password: 'tech123',
        role: 'technician',
        avatar: '👩‍🔧',
        teamId: teams[1]._id
      },
      {
        name: 'Bob Employee',
        email: 'employee@gearguard.com',
        password: 'emp123',
        role: 'employee',
        avatar: '👨‍💻'
      }
    ]);
    console.log('✅ Users created');

    // Update team members
    await Team.findByIdAndUpdate(teams[0]._id, { members: [users[2]._id] });
    await Team.findByIdAndUpdate(teams[1]._id, { members: [users[3]._id] });
    console.log('✅ Team members assigned');

    // Equipment
    const equipment = await Equipment.create([
      {
        name: 'CNC Machine 01',
        serialNumber: 'CNC-2024-001',
        category: 'Production',
        department: 'Production',
        location: 'Factory Floor A',
        purchaseDate: new Date('2024-01-15'),
        warranty: new Date('2026-01-15'),
        teamId: teams[0]._id,
        technicianId: users[2]._id
      },
      {
        name: 'Laptop Dell XPS',
        serialNumber: 'LAP-2024-045',
        category: 'IT Equipment',
        department: 'IT',
        location: 'Office 3B',
        purchaseDate: new Date('2024-06-10'),
        warranty: new Date('2027-06-10'),
        assignedEmployee: 'Bob Employee',
        teamId: teams[2]._id,
        technicianId: users[3]._id
      },
      {
        name: 'Forklift Toyota',
        serialNumber: 'FLT-2023-012',
        category: 'Logistics',
        department: 'Logistics',
        location: 'Warehouse',
        purchaseDate: new Date('2023-03-20'),
        warranty: new Date('2025-03-20'),
        teamId: teams[0]._id,
        technicianId: users[2]._id
      }
    ]);
    console.log('✅ Equipment created');

    // Requests
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Request.create([
      {
        subject: 'Oil Leaking from hydraulic system',
        description: 'Urgent: Oil leak detected from hydraulic system',
        equipmentId: equipment[0]._id,
        type: 'corrective',
        status: 'new',
        priority: 'high',
        createdBy: users[4]._id,
        teamId: teams[0]._id,
        category: 'Production',
        scheduledDate: tomorrow
      },
      {
        subject: 'Monthly preventive checkup',
        description: 'Routine monthly maintenance',
        equipmentId: equipment[2]._id,
        type: 'preventive',
        status: 'in-progress',
        priority: 'medium',
        createdBy: users[1]._id,
        assignedTo: users[2]._id,
        teamId: teams[0]._id,
        category: 'Logistics',
        scheduledDate: nextWeek
      },
      {
        subject: 'Screen flickering issue',
        description: 'Laptop screen flickering intermittently',
        equipmentId: equipment[1]._id,
        type: 'corrective',
        status: 'new',
        priority: 'low',
        createdBy: users[4]._id,
        teamId: teams[2]._id,
        category: 'IT Equipment'
      }
    ]);
    console.log('✅ Requests created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@gearguard.com / admin123');
    console.log('Manager: manager@gearguard.com / manager123');
    console.log('Technician: mike@gearguard.com / tech123');
    console.log('Employee: employee@gearguard.com / emp123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
