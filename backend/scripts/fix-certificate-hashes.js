const mongoose = require('mongoose');
const Certificate = require('./models/Certificate');
const { calculateHash } = require('./utils/cryptoUtils');
require('dotenv').config();

async function fixHashes() {
  await mongoose.connect(process.env.MONGODB_URI);
  const certs = await Certificate.find({});
  for (const cert of certs) {
    const recalculated = calculateHash({
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      courseName: cert.courseName,
      instructorName: cert.instructorName,
      issueDate: cert.issueDate
    });
    if (recalculated !== cert.hash) {
      cert.hash = recalculated;
      await cert.save();
      console.log(`Fixed hash for ${cert.certificateId}`);
    } else {
      console.log(`OK ${cert.certificateId}`);
    }
  }
  await mongoose.disconnect();
  console.log('Done');
}

fixHashes().catch((err) => {
  console.error(err);
  process.exit(1);
});
