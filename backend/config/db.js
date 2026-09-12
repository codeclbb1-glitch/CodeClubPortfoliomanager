const mongoose = require('mongoose');
require('dotenv').config();

// Global cached connection for Serverless (Vercel / Lambda) environments
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return '';
  let uri = String(rawUri).trim();
  uri = uri.replace(/^["']+|["']+$/g, '').trim();
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.substring('MONGODB_URI='.length).trim();
  }
  uri = uri.replace(/^["']+|["']+$/g, '').trim();

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    if (uri.includes('.mongodb.net')) {
      uri = `mongodb+srv://${uri}`;
    }
  }

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

          if (rawUser.startsWith('<') && rawUser.endsWith('>')) {
            rawUser = rawUser.slice(1, -1).trim();
          }
          if (rawPass.startsWith('<') && rawPass.endsWith('>')) {
            rawPass = rawPass.slice(1, -1).trim();
          }

          const encodedUser = encodeURIComponent(rawUser);
          const encodedPass = encodeURIComponent(rawPass);

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
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = sanitizeMongoUri(process.env.MONGODB_URI);

  if (!uri) {
    throw new Error('MONGODB_URI is not configured. Please set it in backend/.env with your MongoDB Atlas connection string.');
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB Atlas connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw new Error(`MongoDB Atlas connection failed: ${err.message}`);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
