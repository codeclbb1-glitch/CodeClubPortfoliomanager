const fs = require('fs');
const path = require('path');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const BASE_DATA_DIR = path.join(__dirname, '..', 'data');

const clientLogoMap = {
  'Peshawar Service Club': 'brand1.png',
  'Memaar Pvt Ltd.': 'brand2.png',
  'IMSciences': 'brand3.png',
  'Abbottabad Club': 'AbbattabadClub.png',
  'Haasil Pvt Ltd.': 'brand4.jpeg',
  'H-MAK Pvt Ltd.': 'brand5.jpeg',
  'NIC Peshawar': 'NIC Peshawar.jpeg',
  'Concordia Colleges': 'Concordia Colleges.jpeg',
  'Quality Coaching Academy': 'Quality Coaching Academy.jpeg',
  'Edwardian Coaching Academy': 'sca.jpg',
  'Genius Coaching Academy': 'brand7.jpg',
  'FCA': 'brand8.png',
  'GEO Wash': 'GEOWash.jpeg',
  'LEO Learning': 'LEOLearning.jpeg',
  'Naqaa-Ksa': 'brand9.jpg',
  'GLEAM UK Premium Car Wash': 'GLEAMUkPremiumCarWash.png',
  'Feather Start Car Wash': 'FeatherStartCarWash.jpeg',
  'Skill Connect': 'skill.jpg',
  'Sayaratak': 'Sayaratak.jpeg',
  'Paragon Overseas Education Pvt Ltd.': 'brand10.jpg',
  'Lavita Developers': 'lavita.jpg',
  'Zamong Khyber Pvt Ltd.': 'brand11.jpeg',
  'Edge Cutting Group': 'edge.jpg',
  'Rehmat Tax Pvt Ltd.': 'win.jpg',
  'Shamroz Group of Companies Pvt Ltd.': 'x.jpg',
  'Muftah Chemicals Pvt Ltd.': 'Muftah Chemicals PVT LTD.jpeg',
  'New Al-Kareem Hostel': 'New Al-Kareem Hostal.jpeg'
};

async function uploadFile(filePath, folder) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Upload timeout'));
    }, 60000);

    cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    }, (error, result) => {
      clearTimeout(timeout);
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
}

async function uploadWithRetry(filePath, folder, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadFile(filePath, folder);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log(`  Retry ${i + 1}/${maxRetries} for ${path.basename(filePath)}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const clientsPath = path.join(BASE_DATA_DIR, 'clientsData.json');
  const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));

  for (const client of clients) {
    const logoFile = clientLogoMap[client.name];
    if (logoFile) {
      const logoPath = path.join(BASE_DATA_DIR, 'clients', logoFile);
      if (fs.existsSync(logoPath)) {
        try {
          console.log(`Uploading client logo: ${logoFile} for ${client.name}`);
          const url = await uploadWithRetry(logoPath, 'job_portal/clients');
          client.logo = url;
          console.log(`  -> ${url}`);
        } catch (err) {
          console.error(`  Failed to upload ${logoFile}: ${err.message}`);
        }
      } else {
        console.warn(`  Logo file not found: ${logoPath}`);
      }
    } else {
      console.warn(`  No logo mapping for client: ${client.name}`);
    }
  }

  fs.writeFileSync(clientsPath, JSON.stringify(clients, null, 2));
  console.log('Updated clientsData.json with Cloudinary URLs');
  console.log('All client logo uploads complete.');
}

main().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
