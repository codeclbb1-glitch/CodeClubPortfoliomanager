// Run once to create the first admin account and dummy content: npm run seed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Client = require('./models/Client');
const Project = require('./models/Project');
const Team = require('./models/Team');
const Testimonial = require('./models/Testimonial');
const Job = require('./models/Job');
const News = require('./models/News');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function seedAdminAuto() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const email = 'codeclub@codeclub.tech';
    const existing = await Admin.findOne({ email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('CodeClub3322', 10);
      await Admin.create({ name: 'Super Admin', email, password: hashedPassword });
      console.log('✅ Admin account seeded: codeclub@codeclub.tech / CodeClub3322');
    } else {
      console.log('Admin already exists.');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

async function seedContent() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    // 1. Clients - migrate from portfolio JSON
    const clientsJsonPath = path.join(__dirname, 'data', 'clientsData.json');
    let clientsData = [];
    if (fs.existsSync(clientsJsonPath)) {
      try {
        const rawClients = JSON.parse(fs.readFileSync(clientsJsonPath, 'utf8'));
        const logoMap = {
          "Peshawar Service Club": "brand1.png",
          "Peshawar Services Club": "brand1.png",
          "Memaar Pvt Ltd.": "brand2.png",
          "IMSciences": "brand3.png",
          "Abbottabad Club": "AbbattabadClub.png",
          "Haasil Pvt Ltd.": "brand4.jpeg",
          "H-MAK Pvt Ltd.": "brand5.jpeg",
          "NIC Peshawar": "NIC Peshawar.jpeg",
          "Concordia Colleges": "Concordia Colleges.jpeg",
          "Quality Coaching Academy": "Quality Coaching Academy.jpeg",
          "Edwardian Coaching Academy": "sca.jpg",
          "Genius Coaching Academy": "brand7.jpg",
          "FCA": "brand8.png",
          "GEO Wash": "GEOWash.jpeg",
          "LEO Learning": "LEOLearning.jpeg",
          "Naqaa-Ksa": "brand9.jpg",
          "GLEAM UK Premium Car Wash": "GLEAMUkPremiumCarWash.png",
          "Feather Start Car Wash": "FeatherStartCarWash.jpeg",
          "Skill Connect": "skill.jpg",
          "Sayaratak": "Sayaratak.jpeg",
          "Paragon Overseas Education Pvt Ltd.": "brand10.jpg",
          "Lavita Developers": "lavita.jpg",
          "Zamong Khyber Pvt Ltd.": "brand11.jpeg",
          "Edge Cutting Group": "edge.jpg",
          "Rehmat Tax Pvt Ltd.": "win.jpg",
          "Shamroz Group of Companies Pvt Ltd.": "x.jpg",
          "Muftah Chemicals Pvt Ltd.": "Muftah Chemicals PVT LTD.jpeg",
          "New Al-Kareem Hostel": "New Al-Kareem Hostal.jpeg"
        };
        clientsData = rawClients.map((item, idx) => {
          const logo = item.logo || item.image || '';
          const resolvedLogo = logo && (logo.startsWith('http') || logo.startsWith('/')) ? logo : `/assets/clients/${logoMap[item.name] || logoMap[item.brandName] || 'brand1.png'}`;
          return {
            name: item.brandName || item.name,
            service: item.focus || 'Custom Software Solution',
            description: item.description || '',
            about: item.description || '',
            logo: resolvedLogo,
            order: idx + 1
          };
        });
      } catch (err) {
        console.error('Error reading clientsData.json:', err.message);
      }
    }
    await Client.deleteMany({});
    if (clientsData.length) {
      await Client.insertMany(clientsData);
      console.log(`✅ ${clientsData.length} Clients seeded successfully!`);
    }

    // 2. Projects / Case Studies - migrate from portfolio JSON
    const caseStudiesJsonPath = path.join(__dirname, 'data', 'caseStudiesData.json');
    let projectsData = [];
    if (fs.existsSync(caseStudiesJsonPath)) {
      try {
        const rawCases = JSON.parse(fs.readFileSync(caseStudiesJsonPath, 'utf8'));
        projectsData = rawCases.map((item, idx) => ({
          title: item.title,
          projectType: item.tags && item.tags.length > 0 ? item.tags[0] : 'Software Engineering',
          description: item.description || '',
          image: item.image ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/assets/casestudy/${item.image}`) : '',
          tags: item.tags || [],
          techStack: (item.tags || []).join(', '),
          link: item.url || '',
          liveLink: item.url || '',
          order: idx + 1
        }));
      } catch (err) {
        console.error('Error reading caseStudiesData.json:', err.message);
      }
    }
    await Project.deleteMany({});
    if (projectsData.length) {
      await Project.insertMany(projectsData);
      console.log(`✅ ${projectsData.length} Projects / Case Studies seeded successfully!`);
    }

    // 3. Team
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      const teamData = [
        {
          name: 'Atif Muhammad',
          designation: 'Team Lead',
          experience: '5+',
          stack: 'Leadership, Full-Stack, Project Management',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/atif-muhammad.jpg',
          order: 1
        },
        {
          name: 'Abdul-Rehman',
          designation: 'Senior Full-stack Developer',
          experience: '4+',
          stack: 'React, Node.js, MongoDB, Express',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/abdul-rehman.jpg',
          order: 2
        },
        {
          name: 'Abirullah',
          designation: 'Full-stack Developer',
          experience: '3+',
          stack: 'MERN Stack, JavaScript, Python',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/abirullah.jpg',
          order: 3
        },
        {
          name: 'Muhammad Sannan Sherzada',
          designation: 'MERN Stack Developer',
          experience: '3+',
          stack: 'MongoDB, Express, React, Node.js',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/muhammad-sannan.jpg',
          order: 4
        },
        {
          name: 'Malaika',
          designation: 'Frontend Developer',
          experience: '2+',
          stack: 'React, TailwindCSS, JavaScript',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/malaika.jpg',
          order: 5
        },
        {
          name: 'Muhammad Hisham',
          designation: 'PERN Stack Developer',
          experience: '2+',
          stack: 'PostgreSQL, Express, React, Node.js',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/muhammad-hisham.jpg',
          order: 6
        },
        {
          name: 'Muhammad Waqas',
          designation: 'MERN Stack Developer',
          experience: '2+',
          stack: 'MongoDB, Express, React, Node.js',
          photo: 'https://res.cloudinary.com/hghq4sap/image/upload/v1720000000/team/muhammad-waqas.jpg',
          order: 7
        }
      ];
      await Team.insertMany(teamData);
      console.log(`✅ ${teamData.length} Team members seeded successfully!`);
    }

    // 4. Testimonials
    const testimonialCount = await Testimonial.countDocuments();
    if (testimonialCount === 0) {
      const testimonialsData = [
        {
          name: 'Arthur Pendelton',
          role: 'CEO, ApexCorp',
          content: 'The team delivered an outstanding enterprise dashboard system. Their engineers are top-notch and completed the project on time.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
          rating: 5,
          order: 1
        },
        {
          name: 'Sarah Smith',
          role: 'VP of Engineering, Vertex Systems',
          content: 'Excellent collaboration on the decentralized data broker. Highly recommend their backend engineering expertise.',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
          rating: 5,
          order: 2
        },
        {
          name: 'Michael Brown',
          role: 'Product Director, NovaSoft',
          content: 'Superb quality and customer support throughout the project. The UI toolkit is incredibly easy to customize.',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80',
          rating: 4,
          order: 3
        },
        {
          name: 'Emily Davis',
          role: 'Co-founder, Stellar Tech',
          content: 'The mobile companion app has helped increase our active users by 35%. Outstanding developers to work with.',
          avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80',
          rating: 5,
          order: 4
        },
        {
          name: 'David Wilson',
          role: 'Manager, Summit Consulting',
          content: 'Integrating semantic search has significantly optimized product matching times. A very professional service.',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
          rating: 5,
          order: 5
        }
      ];
      await Testimonial.insertMany(testimonialsData);
      console.log('✅ 5 Testimonials seeded successfully!');
    }

    // 5. Jobs
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      const jobsData = [
        {
          title: 'Full-stack Developer Intern',
          company: 'Code Club',
          location: 'Peshawar, Pakistan',
          salary: 'Rs. 15,000 - 25,000 / month',
          job_type: 'Internship',
          description: 'Join our engineering team to build real-world web and mobile applications. Work with modern stacks like MERN, PERN, and Flutter while contributing to live client projects.',
          requirements: 'Basic knowledge of HTML, CSS, JavaScript, and any backend framework. Eagerness to learn and work in a team.',
          skills: 'JavaScript, React, Node.js, MongoDB',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          title: 'Frontend Developer Intern',
          company: 'Code Club',
          location: 'Peshawar, Pakistan',
          salary: 'Rs. 15,000 - 25,000 / month',
          job_type: 'Internship',
          description: 'Work with our frontend team to build responsive, pixel-perfect UIs using React, TailwindCSS, and modern tooling.',
          requirements: 'Knowledge of React.js, CSS, and basic state management. Portfolio of small projects is a plus.',
          skills: 'React, TailwindCSS, JavaScript, Git',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          title: 'Backend Developer Intern',
          company: 'Code Club',
          location: 'Peshawar, Pakistan',
          salary: 'Rs. 15,000 - 25,000 / month',
          job_type: 'Internship',
          description: 'Help design and maintain APIs, work with MongoDB, and build scalable backend services for client and internal products.',
          requirements: 'Basic knowledge of Node.js, Express, and databases. Familiarity with REST APIs.',
          skills: 'Node.js, Express, MongoDB, REST APIs',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          title: 'Mobile App Developer Intern',
          company: 'Code Club',
          location: 'Peshawar, Pakistan',
          salary: 'Rs. 15,000 - 25,000 / month',
          job_type: 'Internship',
          description: 'Assist in building cross-platform mobile applications using Flutter or React Native. Contribute to apps used by real clients.',
          requirements: 'Basic understanding of mobile development. Familiarity with Flutter or React Native is a plus.',
          skills: 'Flutter, Dart, React Native, Mobile UI',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          title: 'UI/UX Designer Intern',
          company: 'Code Club',
          location: 'Peshawar, Pakistan',
          salary: 'Rs. 15,000 - 25,000 / month',
          job_type: 'Internship',
          description: 'Work with the design team to create clean, user-friendly interfaces. Help with wireframes, prototypes, and design systems.',
          requirements: 'Basic knowledge of Figma and design principles. Eye for clean, modern UI.',
          skills: 'Figma, UI Design, Prototyping, Design Systems',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ];
      await Job.insertMany(jobsData);
      console.log(`✅ ${jobsData.length} Jobs seeded successfully!`);
    }

    // 6. News - migrate from portfolio JSON
    const newsJsonPath = path.join(__dirname, 'data', 'newsData.json');
    let newsItems = [];
    if (fs.existsSync(newsJsonPath)) {
      try {
        const rawData = fs.readFileSync(newsJsonPath, 'utf8');
        const parsed = JSON.parse(rawData);
        newsItems = parsed.map((item, idx) => ({
          title: item.title,
          description: item.summary || item.description,
          image: item.image ? (item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/uploads/images/${item.image}`) : '',
          date: item.date || 'October 2025',
          order: idx + 1
        }));
      } catch (readErr) {
        console.error('Error reading newsData.json:', readErr.message);
      }
    }
    await News.deleteMany({});
    if (newsItems.length) {
      await News.insertMany(newsItems);
      console.log(`✅ ${newsItems.length} News articles seeded successfully!`);
    }
  } catch (err) {
    console.error('Content seeding error:', err.message);
  }
}

async function seedAdmin() {
  try {
    await connectDB();
    await seedAdminAuto();
    await seedContent();
    console.log('Seeding fully completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdminAuto, seedContent };
