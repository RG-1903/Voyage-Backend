const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the AdminUser model
const AdminUser = require('./models/AdminUser');

// --- The credentials you want to create ---
const ADMIN_USERNAME = 'bharatbhaigolaviya@gmail.com';
const ADMIN_PASSWORD = '123456789';

const createAdminAccount = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for admin creation...');

    // 2. Check if the admin user already exists
    const existingAdmin = await AdminUser.findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      console.log('Admin user already exists. No action taken.');
      return;
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    console.log('Password hashed successfully.');

    // 4. Create the new admin user object
    const newAdmin = new AdminUser({
      username: ADMIN_USERNAME,
      password: hashedPassword,
    });

    // 5. Save the new admin user to the database
    await newAdmin.save();
    console.log(`Successfully created admin user: '${ADMIN_USERNAME}'`);

  } catch (err) {
    console.error('Error creating admin user:', err.message);
  } finally {
    // 6. Disconnect from the database
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the function
createAdminAccount();