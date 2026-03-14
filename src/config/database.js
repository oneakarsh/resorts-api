const prisma = require('../lib/prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL (Supabase) connected successfully via Prisma');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
