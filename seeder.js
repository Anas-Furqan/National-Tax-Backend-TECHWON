const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Blog = require('./models/Blog');

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Blog.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@nationaltaxlaw.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });

    console.log('Admin user created:', admin.email);

    // Create sample blog posts
    const sampleBlogs = [
      {
        title: 'Understanding Income Tax Returns in Pakistan',
        content: `<h2>What is an Income Tax Return?</h2>
        <p>An Income Tax Return (ITR) is a formal document that taxpayers submit to the Federal Board of Revenue (FBR) declaring their income, deductions, and tax liability for a specific financial year.</p>
        <h2>Who Needs to File?</h2>
        <p>In Pakistan, the following individuals and entities are required to file income tax returns:</p>
        <ul>
          <li>Individuals with taxable income above the threshold</li>
          <li>Individuals owning property or vehicles</li>
          <li>Registered businesses and companies</li>
          <li>Associations of persons (AOPs)</li>
        </ul>
        <h2>Benefits of Filing Tax Returns</h2>
        <p>Filing your income tax return on time offers several benefits including reduced withholding tax rates, eligibility for bank loans, and compliance with legal requirements.</p>`,
        author: admin._id,
        category: 'Income Tax',
        tags: ['income tax', 'tax return', 'FBR', 'Pakistan'],
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: 'Complete Guide to Sales Tax Registration in Pakistan',
        content: `<h2>What is Sales Tax?</h2>
        <p>Sales Tax is an indirect tax levied on the supply of goods and services in Pakistan. It is collected at each stage of the supply chain and ultimately borne by the end consumer.</p>
        <h2>Registration Requirements</h2>
        <p>Businesses with annual turnover exceeding PKR 10 million are required to register for sales tax. However, voluntary registration is also available for smaller businesses.</p>
        <h2>How to Register</h2>
        <p>Registration can be done through the FBR's IRIS portal. Required documents include:</p>
        <ul>
          <li>CNIC copy of the proprietor/partners/directors</li>
          <li>Business proof documents</li>
          <li>Bank statement</li>
          <li>Utility bills</li>
        </ul>`,
        author: admin._id,
        category: 'Sales Tax',
        tags: ['sales tax', 'registration', 'FBR', 'business'],
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: 'SECP Company Registration: A Step-by-Step Guide',
        content: `<h2>Introduction to SECP</h2>
        <p>The Securities and Exchange Commission of Pakistan (SECP) is the regulatory body responsible for company registration and corporate governance in Pakistan.</p>
        <h2>Types of Companies</h2>
        <p>You can register the following types of companies with SECP:</p>
        <ul>
          <li>Private Limited Company</li>
          <li>Public Limited Company</li>
          <li>Single Member Company</li>
          <li>Limited Liability Partnership (LLP)</li>
        </ul>
        <h2>Registration Process</h2>
        <p>The entire registration process is now online through the SECP eServices portal. It typically takes 2-3 working days to complete the registration.</p>`,
        author: admin._id,
        category: 'SECP',
        tags: ['SECP', 'company registration', 'business', 'Pakistan'],
        isPublished: true,
        publishedAt: new Date(),
      },
    ];

    await Blog.insertMany(sampleBlogs);
    console.log('Sample blog posts created');

    console.log('Seed data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Blog.deleteMany();

    console.log('Data destroyed successfully');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
