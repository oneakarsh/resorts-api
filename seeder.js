const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Resort = require('./src/models/Resort');
const Room = require('./src/models/Room');

dotenv.config();

const resorts = [
    {
        name: 'Ocean Whisper Resort',
        description: 'A beautiful resort with ocean views and private beaches.',
        location: 'Maldives',
        amenities: ['WiFi', 'Pool', 'Spa', 'Beach Access', 'Gym'],
        images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6'],
        pricePerNight: 450,
        maxGuests: 4,
        rating: 4.8,
        verified: true
    },
    {
        name: 'Mountain Peak Retreat',
        description: 'Escape to the mountains in this cozy retreat.',
        location: 'Swiss Alps',
        amenities: ['Skiing', 'Fireplace', 'Hot Tub', 'Wi-Fi'],
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
        pricePerNight: 350,
        maxGuests: 2,
        rating: 4.7,
        verified: true
    },
    {
        name: 'Desert Oasis Hotel',
        description: 'Modern luxury in the heart of the desert.',
        location: 'Dubai, UAE',
        amenities: ['Infinity Pool', 'Desert Safari', 'Luxury Spa'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
        pricePerNight: 600,
        maxGuests: 6,
        rating: 4.9,
        verified: true
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany();
        await Resort.deleteMany();
        await Room.deleteMany();

        // Create a SuperAdmin and a ResortOwner
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'superadmin@example.com',
            password: 'password123',
            role: 'SuperAdmin'
        });

        const owner = await User.create({
            name: 'Resort Owner',
            email: 'owner@example.com',
            password: 'password123',
            role: 'ResortOwner'
        });

        console.log('Users created');

        // Create resorts
        for (const resortData of resorts) {
            const resort = await Resort.create({
                ...resortData,
                ownerId: owner._id
            });

            // Create some rooms for each resort
            await Room.create({
                resortId: resort._id,
                name: 'Deluxe Suite',
                pricePerNight: resortData.pricePerNight,
                maxGuests: resortData.maxGuests
            });

            await Room.create({
                resortId: resort._id,
                name: 'Standard Room',
                pricePerNight: resortData.pricePerNight * 0.7,
                maxGuests: Math.max(1, resortData.maxGuests - 2)
            });
        }

        console.log('Resorts and rooms created');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
