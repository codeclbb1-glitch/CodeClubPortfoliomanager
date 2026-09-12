const BACKEND_URL = 'http://localhost:5000/api';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer() {
  console.log('⏳ Waiting for merged server database connection...');
  while (true) {
    try {
      const res = await fetch('http://localhost:5000/');
      if (res.ok) {
        // Test login route to confirm DB is operational
        const testAuth = await fetch(`${BACKEND_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@jobportal.com', password: 'wrong' })
        });
        if (testAuth.status === 401) {
          console.log('✅ Connected. Merged Server & DB are fully functional.');
          break;
        }
      }
    } catch (err) {
      // Waiting for server to boot
    }
    await delay(1500);
  }
}

async function seedData() {
  await waitForServer();

  console.log('\n🔐 Authenticating Admin (admin@jobportal.com)...');
  const loginRes = await fetch(`${BACKEND_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@jobportal.com',
      password: 'Admin@123'
    })
  });

  if (!loginRes.ok) {
    console.error('❌ Authentication failed. Check if Admin@123 seeded credentials match.');
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('✅ Admin authenticated.');

  const sampleCertificates = [
    {
      studentName: 'Ahmad Ali',
      courseName: 'MERN Stack Web Development',
      instructorName: 'Haris Ali',
      issueDate: new Date('2026-07-10').toISOString()
    },
    {
      studentName: 'Saba Fatima',
      courseName: 'Advanced UI/UX Product Design',
      instructorName: 'Ayesha Khan',
      issueDate: new Date('2026-07-20').toISOString()
    },
    {
      studentName: 'Zainab Malik',
      courseName: 'Python & Data Science Bootcamp',
      instructorName: 'Zeeshan Ahmed',
      issueDate: new Date('2026-08-01').toISOString()
    }
  ];

  console.log('\n📄 Registering sample certificates into the merged database...');

  for (const cert of sampleCertificates) {
    const res = await fetch(`${BACKEND_URL}/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cert)
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`\n======================================================`);
      console.log(`✅ Certificate Issued for: ${data.certificate.studentName}`);
      console.log(`   Course Name:    ${data.certificate.courseName}`);
      console.log(`   Instructor:     ${data.certificate.instructorName}`);
      console.log(`   Certificate ID: ${data.certificate.certificateId}`);
      console.log(`   Verify Link:    ${data.verifyUrl}`);
      console.log(`======================================================`);
    } else {
      console.error(`❌ Failed to seed certificate for ${cert.studentName}:`, await res.text());
    }
  }

  console.log('\n🎉 Merged certificate data seeded successfully! All features are up and running.');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seeding process failed:', err);
  process.exit(1);
});
