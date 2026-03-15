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

    // Create 10 Resorts for the owner
    const resortCount = await Resort.countDocuments({ owner: ownerId });
    if (resortCount === 0) {
      const resorts = [
        {
          name: 'Blue Lagoon Resort',
          description: 'An exclusive overwater villa resort nestled in the pristine turquoise waters of the Maldives. Enjoy private infinity pools, world-class diving, and sunset dining on the ocean.',
          location: 'Maldives',
          address: '123 Lagoon Way, North Malé Atoll',
          area: 'North Malé Atoll',
          latitude: 4.1755,
          longitude: 73.5093,
          pricePerNight: 850,
          amenities: ['Infinity Pool', 'Private Beach', 'Spa', 'Diving Center', 'Water Sports', 'Fine Dining', 'Butler Service'],
          maxGuests: 4,
          rooms: 24,
          contactNumber: '+960-332-1100',
          rating: 4.9,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6'
        },
        {
          name: 'Alpine Summit Retreat',
          description: 'A charming luxury chalet resort perched high in the Swiss Alps with breathtaking panoramic views of the Matterhorn. Perfect for skiing in winter and hiking in summer.',
          location: 'Switzerland',
          address: '456 Alpine Road, Zermatt',
          area: 'Zermatt',
          latitude: 46.0207,
          longitude: 7.7491,
          pricePerNight: 620,
          amenities: ['Ski-in/Ski-out', 'Fireplace Lounge', 'Sauna', 'Mountain Biking', 'Fondue Restaurant', 'Heated Pool'],
          maxGuests: 6,
          rooms: 18,
          contactNumber: '+41-27-966-0000',
          rating: 4.7,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
        },
        {
          name: 'Bali Serenity Villas',
          description: 'Tucked among terraced rice paddies and tropical gardens in Ubud, this boutique resort offers traditional Balinese architecture with modern luxury. Rejuvenate at the holistic spa or explore sacred temples.',
          location: 'Bali, Indonesia',
          address: '88 Jalan Raya Tegallalang, Ubud',
          area: 'Ubud',
          latitude: -8.4312,
          longitude: 115.2865,
          pricePerNight: 320,
          amenities: ['Yoga Pavilion', 'Organic Restaurant', 'Spa', 'Rice Terrace Views', 'Cooking Classes', 'Private Pool Villas'],
          maxGuests: 3,
          rooms: 15,
          contactNumber: '+62-361-977-577',
          rating: 4.8,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'
        },
        {
          name: 'Santorini Cliff Hotel',
          description: 'A stunning whitewashed boutique hotel carved into the volcanic cliffs of Oia, offering iconic caldera views, cave-style suites, and legendary Aegean sunsets from your private terrace.',
          location: 'Santorini, Greece',
          address: '12 Caldera View Street, Oia',
          area: 'Oia',
          latitude: 36.4618,
          longitude: 25.3753,
          pricePerNight: 550,
          amenities: ['Caldera View', 'Cave Suites', 'Rooftop Jacuzzi', 'Wine Tasting', 'Sunset Lounge', 'Concierge'],
          maxGuests: 2,
          rooms: 12,
          contactNumber: '+30-228-607-1234',
          rating: 4.9,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff'
        },
        {
          name: 'Costa Rica Eco Lodge',
          description: 'An award-winning eco-luxury lodge surrounded by pristine rainforest canopy near Arenal Volcano. Encounter exotic wildlife, soak in natural hot springs, and zip-line through the treetops.',
          location: 'Costa Rica',
          address: '789 Ruta Arenal, La Fortuna',
          area: 'La Fortuna de San Carlos',
          latitude: 10.4679,
          longitude: -84.6427,
          pricePerNight: 280,
          amenities: ['Hot Springs', 'Zip-lining', 'Wildlife Tours', 'Rainforest Spa', 'Volcano Views', 'Organic Farm-to-Table'],
          maxGuests: 5,
          rooms: 20,
          contactNumber: '+506-2479-1234',
          rating: 4.6,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'
        },
        {
          name: 'Kyoto Garden Ryokan',
          description: 'An authentic Japanese ryokan experience in the heart of Kyoto\'s historic Higashiyama district. Tatami rooms, kaiseki cuisine, private onsen baths, and serene zen garden views.',
          location: 'Kyoto, Japan',
          address: '34 Gion Shinbashi, Higashiyama-ku',
          area: 'Higashiyama',
          latitude: 35.0036,
          longitude: 135.7756,
          pricePerNight: 450,
          amenities: ['Private Onsen', 'Zen Garden', 'Kaiseki Dining', 'Tea Ceremony', 'Kimono Rental', 'Temple Walking Tours'],
          maxGuests: 2,
          rooms: 10,
          contactNumber: '+81-75-561-0001',
          rating: 4.8,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186'
        },
        {
          name: 'Dubai Oasis Palace',
          description: 'An ultra-luxury desert palace resort offering Arabian opulence at its finest. Private beach, championship golf, gold-leaf spa treatments, and Michelin-starred rooftop dining with skyline views.',
          location: 'Dubai, UAE',
          address: '1 Palm Jumeirah Crescent Road',
          area: 'Palm Jumeirah',
          latitude: 25.1124,
          longitude: 55.1390,
          pricePerNight: 1200,
          amenities: ['Private Beach', 'Championship Golf', 'Gold Spa', 'Helipad', 'Underwater Restaurant', 'Luxury Yacht Charter'],
          maxGuests: 8,
          rooms: 40,
          contactNumber: '+971-4-888-0000',
          rating: 4.9,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd'
        },
        {
          name: 'Patagonia Wilderness Lodge',
          description: 'A remote luxury lodge at the edge of Torres del Paine National Park. Floor-to-ceiling windows frame jagged peaks and glacial lakes while you warm up by the crackling fire.',
          location: 'Patagonia, Chile',
          address: 'Km 74 Ruta Y-290, Torres del Paine',
          area: 'Torres del Paine',
          latitude: -51.0000,
          longitude: -73.0000,
          pricePerNight: 480,
          amenities: ['Glacier Trekking', 'Horse Riding', 'Wildlife Safaris', 'Panoramic Windows', 'Fireplace Suites', 'Stargazing Deck'],
          maxGuests: 4,
          rooms: 14,
          contactNumber: '+56-61-241-3000',
          rating: 4.7,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
        },
        {
          name: 'Amalfi Coast Villa',
          description: 'A centuries-old cliffside villa transformed into a boutique resort overlooking the sparkling Mediterranean Sea. Lemon groves, hand-painted tiles, and authentic Italian cuisine define this romantic escape.',
          location: 'Amalfi Coast, Italy',
          address: '22 Via Positanesi d\'America, Positano',
          area: 'Positano',
          latitude: 40.6281,
          longitude: 14.4850,
          pricePerNight: 700,
          amenities: ['Sea View Terraces', 'Wine Cellar', 'Italian Cooking Classes', 'Boat Excursions', 'Lemon Garden', 'Cliffside Pool'],
          maxGuests: 3,
          rooms: 16,
          contactNumber: '+39-089-875-066',
          rating: 4.8,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1455587734955-081b22074882'
        },
        {
          name: 'Seychelles Pearl Resort',
          description: 'A barefoot-luxury island resort on a private stretch of powdered-white beach in the Seychelles. Giant granite boulders, crystal-clear lagoons, and rare Aldabra tortoises make this a paradise unlike any other.',
          location: 'Seychelles',
          address: 'Anse Lazio, Praslin Island',
          area: 'Praslin Island',
          latitude: -4.2985,
          longitude: 55.7341,
          pricePerNight: 920,
          amenities: ['Private Beach', 'Snorkeling', 'Nature Reserve', 'Overwater Bar', 'Couples Spa', 'Island Hopping Tours'],
          maxGuests: 4,
          rooms: 22,
          contactNumber: '+248-4-232-000',
          rating: 4.9,
          owner: ownerId,
          managers: [managerId],
          image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1'
        }
      ];
      await Resort.insertMany(resorts);
      console.log(`${resorts.length} sample resorts created for owner and linked to manager`);
    } else {
      console.log(`Resorts already exist for owner (${resortCount} found)`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
