const app = require('./app');
const connectDB = require('./config/db');
const { seedAdminAuto, seedContent } = require('./seed');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdminAuto();
  await seedContent();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

