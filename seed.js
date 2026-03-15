const mongoose = require('mongoose');
const User = require('./src/models/User');
const Resort = require('./src/models/Resort');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Create Super Admin
    const superAdminEmail = 'superadmin@resort.com';
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: superAdminEmail,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'superadmin',
        phone: '1234567890'
      });
      await superAdmin.save();
      console.log('Super Admin created: superadmin@resort.com / password123');
    } else {
      console.log('Super Admin already exists');
    }

    // Create a Resort Owner
    const ownerEmail = 'owner@resort.com';
    const existingOwner = await User.findOne({ email: ownerEmail });
    let ownerId;

    if (!existingOwner) {
      const owner = new User({
        name: 'Resort Owner',
        email: ownerEmail,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'resort_owner',
        phone: '9876543210'
      });
      const savedOwner = await owner.save();
      ownerId = savedOwner._id;
      console.log('Resort Owner created: owner@resort.com / password123');
    } else {
      ownerId = existingOwner._id;
      console.log('Resort Owner already exists');
    }

    // Create a Resort Manager
    const managerEmail = 'manager@resort.com';
    const existingManager = await User.findOne({ email: managerEmail });
    let managerId;

    if (!existingManager) {
      const manager = new User({
        name: 'Resort Manager',
        email: managerEmail,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'resort_manager',
        phone: '5556667777',
        createdBy: ownerId
      });
      const savedManager = await manager.save();
      managerId = savedManager._id;
      console.log('Resort Manager created: manager@resort.com / password123');
    } else {
      managerId = existingManager._id;
      console.log('Resort Manager already exists');
    }

    // Create some Resorts for the owner
    const resortCount = await Resort.countDocuments({ owner: ownerId });
    if (resortCount === 0) {
      const resorts = [
        {
          name: 'Blue Lagoon Resort',
          description: 'A beautiful resort by the lagoon.',
          location: 'Maldives',
          address: '123 Lagoon Way',
          area: 'South Atoll',
          pricePerNight: 500,
          amenities: ['Pool', 'Beach', 'Spa'],
          maxGuests: 2,
          rooms: 10,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6'
        },
        {
          name: 'Mountain View Retreat',
          description: 'Quiet retreat in the mountains.',
          location: 'Switzerland',
          address: '456 Alpine Road',
          area: 'Zermatt',
          pricePerNight: 300,
          amenities: ['Hiking', 'Fireplace', 'Sauna'],
          maxGuests: 4,
          rooms: 5,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
        }
      ];
      await Resort.insertMany(resorts);
      console.log('Sample resorts created for owner and linked to manager');
    } else {
      console.log('Resorts already exist for owner');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
