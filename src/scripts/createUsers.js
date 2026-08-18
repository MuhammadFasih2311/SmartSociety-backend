import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Resident from '../models/Resident.js';
import Guard from '../models/Guard.js';

dotenv.config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartsociety');
    console.log('✅ MongoDB Connected');

    await User.deleteMany({});
    await Resident.deleteMany({});
    await Guard.deleteMany({});
    console.log('🗑️ Existing data cleared');

    const admin = new User({
      username: 'admin',
      email: 'admin@smartsociety.com',
      password: 'admin123',
      fullName: 'Admin User',
      phone: '+92 300 0000000',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin created');

    const residentUser = new User({
      username: 'resident1',
      email: 'resident1@smartsociety.com',
      password: 'resident123',
      fullName: 'Ahmed Ali',
      phone: '+92 300 1234567',
      role: 'resident',
      isActive: true,
      flatNumber: 'A-101',
      blockName: 'A'
    });
    await residentUser.save();
    console.log('✅ Resident user created');

    const resident = new Resident({
      userId: residentUser._id,
      flatNumber: 'A-101',
      blockName: 'A',
      occupancyType: 'owner',
      vehicleNumber: 'ABC-1234',
      emergencyContact: {
        name: 'Fatima Ali',
        phone: '+92 300 7654321',
        relation: 'Wife'
      },
      isActive: true
    });
    await resident.save();
    console.log('✅ Resident profile created');

    const guardUser = new User({
      username: 'guard1',
      email: 'guard1@smartsociety.com',
      password: 'guard123',
      fullName: 'Rashid Ahmed',
      phone: '+92 300 2345678',
      role: 'guard',
      isActive: true,
      gateAssigned: 'Main Gate',
      shiftTiming: 'Morning'
    });
    await guardUser.save();
    console.log('✅ Guard user created');

    const guard = new Guard({
      userId: guardUser._id,
      gateAssigned: 'Main Gate',
      shiftTiming: 'Morning',
      isActive: true,
      shiftStart: '06:00 AM',
      shiftEnd: '02:00 PM'
    });
    await guard.save();
    console.log('✅ Guard profile created');

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('👤 Admin:    admin@smartsociety.com / admin123');
    console.log('👤 Resident: resident1@smartsociety.com / resident123');
    console.log('👤 Guard:    guard1@smartsociety.com / guard123');
    console.log('\n🎯 Redirects:');
    console.log('   Admin    → /admin/dashboard');
    console.log('   Resident → /resident/dashboard');
    console.log('   Guard    → /guard/dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createUsers();