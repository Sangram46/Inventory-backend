require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');

const seedData = async () => {
  try {
    await connectDB();

    // Create demo user
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    let user;
    if (!existingUser) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123456',
      });
      console.log('Demo user created: demo@example.com / demo123456');
    } else {
      user = existingUser;
      console.log('Demo user already exists');
    }

    // Seed default categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Books', description: 'Books and publications' },
      { name: 'Groceries', description: 'Food and household supplies' },
      { name: 'Furniture', description: 'Home and office furniture' },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create({ ...cat, createdBy: user._id });
        console.log(`Category created: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
