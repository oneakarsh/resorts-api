const User = require('../models/User');
const connectDB = require('../config/db');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await connectDB();

        const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@resorts.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

        // Check if superadmin already exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Super Admin already exists');
            user.role = 'SuperAdmin';
            await user.save();
            console.log('User role updated to SuperAdmin');
        } else {
            user = await User.create({
                name: 'System Super Admin',
                email: email,
                password: password,
                role: 'SuperAdmin'
            });
            console.log('Super Admin created successfully');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSuperAdmin();
