const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Global cached connection for Serverless (Vercel / Lambda) environments
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return '';
  let uri = String(rawUri).trim();
  // Remove wrapping quotes if present
  uri = uri.replace(/^["']+|["']+$/g, '').trim();
  // If user accidentally pasted the key in value field: MONGODB_URI=...
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.substring('MONGODB_URI='.length).trim();
  }
  uri = uri.replace(/^["']+|["']+$/g, '').trim();

  // If user pasted without protocol prefix: username:pass@cluster0...
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    if (uri.includes('.mongodb.net')) {
      uri = `mongodb+srv://${uri}`;
    }
  }

  // Auto-encode credentials if special characters exist in password
  try {
    const protoIdx = uri.indexOf('://');
    if (protoIdx !== -1) {
      const proto = uri.substring(0, protoIdx + 3);
      const afterProto = uri.substring(protoIdx + 3);
      const lastAtIdx = afterProto.lastIndexOf('@');
      if (lastAtIdx !== -1) {
        const authPart = afterProto.substring(0, lastAtIdx);
        let hostAndQuery = afterProto.substring(lastAtIdx + 1);
        const colonIdx = authPart.indexOf(':');
        if (colonIdx !== -1) {
          let rawUser = decodeURIComponent(authPart.substring(0, colonIdx)).trim();
          let rawPass = decodeURIComponent(authPart.substring(colonIdx + 1)).trim();

          // Strip < > brackets if user left them in template e.g. <admin>:<password>
          if (rawUser.startsWith('<') && rawUser.endsWith('>')) {
            rawUser = rawUser.slice(1, -1).trim();
          }
          if (rawPass.startsWith('<') && rawPass.endsWith('>')) {
            rawPass = rawPass.slice(1, -1).trim();
          }

          const encodedUser = encodeURIComponent(rawUser);
          const encodedPass = encodeURIComponent(rawPass);

          // Ensure database name 'job_portal' is present
          if (hostAndQuery.includes('.mongodb.net')) {
            const domainEnd = hostAndQuery.indexOf('.mongodb.net') + 12;
            const domain = hostAndQuery.substring(0, domainEnd);
            let pathAndQuery = hostAndQuery.substring(domainEnd);
            if (!pathAndQuery || pathAndQuery === '/' || pathAndQuery.startsWith('/?')) {
              const queryPart = pathAndQuery.includes('?') ? pathAndQuery.substring(pathAndQuery.indexOf('?')) : '?retryWrites=true&w=majority';
              pathAndQuery = '/job_portal' + queryPart;
            }
            hostAndQuery = domain + pathAndQuery;
          }

          uri = `${proto}${encodedUser}:${encodedPass}@${hostAndQuery}`;
        }
      }
    }
  } catch (err) {
    // If parsing fails, fall back to raw uri
  }

  return uri;
}

async function connectDB() {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = sanitizeMongoUri(process.env.MONGODB_URI);
  const isServerlessOrProd = Boolean(
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.NODE_ENV === 'production'
  );

  // 1. If MONGODB_URI is provided, connect to it
  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    if (!cached.promise) {
      const opts = {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false
      };
      cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
        console.log('MongoDB Atlas connected successfully');
        return mongooseInstance;
      }).catch((err) => {
        cached.promise = null;
        console.error('MongoDB Atlas connection failed:', err.message);
        throw err;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      if (isServerlessOrProd) {
        throw new Error(`MongoDB connection failed: ${err.message}. Please check MongoDB Atlas IP Whitelist (0.0.0.0/0).`);
      }
    }
  }

  // 2. If running on Vercel/Production without a remote MONGODB_URI
  if (isServerlessOrProd) {
    const errorMsg = 'MONGODB_URI is missing or not configured with MongoDB Atlas in Vercel Environment Variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 3. Local Development Fallbacks (Localhost MongoDB -> MongoMemoryServer)
  const localUri = uri || 'mongodb://127.0.0.1:27017/job_portal';
  try {
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('Local MongoDB connected successfully at', localUri);
    cached.conn = conn;
    return cached.conn;
  } catch (err) {
    console.log('Local MongoDB not accessible, attempting local memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '..', 'db_data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      const mongod = await MongoMemoryServer.create({
        binary: {
          version: '8.2.6'
        },
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          persist: true
        }
      });
      let memUri = mongod.getUri();
      if (memUri.endsWith('/')) {
        memUri += 'job_portal';
      } else if (!memUri.includes('/job_portal')) {
        memUri += '/job_portal';
      }

      const conn = await mongoose.connect(memUri);
      console.log('MongoDB (Persistent Memory Server) connected successfully at', memUri);
      cached.conn = conn;
      return cached.conn;
    } catch (memErr) {
      console.error('Local MongoDB connection failed:', err.message);
      console.error('Local memory database fallback failed:', memErr.message);
      console.error('Please configure MONGODB_URI in server/.env with your MongoDB Atlas connection string.');
    }
  }
}

module.exports = connectDB;
