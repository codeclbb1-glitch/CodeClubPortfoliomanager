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
  const caseStudiesPath = path.join(BASE_DATA_DIR, 'caseStudiesData.json');
  const caseStudies = JSON.parse(fs.readFileSync(caseStudiesPath, 'utf8'));

  for (const item of caseStudies) {
    if (item.image && !item.image.startsWith('http')) {
      const imagePath = path.join(BASE_DATA_DIR, 'casestudy', item.image);
      if (fs.existsSync(imagePath)) {
        try {
          console.log(`Uploading case study image: ${item.image}`);
          const url = await uploadWithRetry(imagePath, 'job_portal/casestudies');
          item.image = url;
          console.log(`  -> ${url}`);
        } catch (err) {
          console.error(`  Failed to upload ${item.image}: ${err.message}`);
        }
      }
    }
  }

  fs.writeFileSync(caseStudiesPath, JSON.stringify(caseStudies, null, 2));
  console.log('Updated caseStudiesData.json with Cloudinary URLs');

  const clientsPath = path.join(BASE_DATA_DIR, 'clientsData.json');
  const clients = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));

  for (const client of clients) {
    const logoField = client.logo || client.image || null;
    if (logoField && !logoField.startsWith('http')) {
      const logoPath = path.join(BASE_DATA_DIR, 'clients', logoField);
      if (fs.existsSync(logoPath)) {
        try {
          console.log(`Uploading client logo: ${logoField}`);
          const url = await uploadWithRetry(logoPath, 'job_portal/clients');
          if (client.logo) client.logo = url;
          if (client.image) client.image = url;
          console.log(`  -> ${url}`);
        } catch (err) {
          console.error(`  Failed to upload ${logoField}: ${err.message}`);
        }
      }
    }
  }

  fs.writeFileSync(clientsPath, JSON.stringify(clients, null, 2));
  console.log('Updated clientsData.json with Cloudinary URLs');

  const newsPath = path.join(BASE_DATA_DIR, 'newsData.json');
  const news = JSON.parse(fs.readFileSync(newsPath, 'utf8'));

  for (const item of news) {
    if (item.image && !item.image.startsWith('http')) {
      const imagePath = path.join(BASE_DATA_DIR, 'news', item.image);
      if (fs.existsSync(imagePath)) {
        try {
          console.log(`Uploading news image: ${item.image}`);
          const url = await uploadWithRetry(imagePath, 'job_portal/news');
          item.image = url;
          console.log(`  -> ${url}`);
        } catch (err) {
          console.error(`  Failed to upload ${item.image}: ${err.message}`);
        }
      }
    }
  }

  fs.writeFileSync(newsPath, JSON.stringify(news, null, 2));
  console.log('Updated newsData.json with Cloudinary URLs');

  console.log('All uploads complete.');
}

main().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
