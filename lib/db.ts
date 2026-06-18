import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbCache = cached;

export async function connectDB() {
  if (dbCache.conn) {
    return dbCache.conn;
  }

  if (!dbCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    dbCache.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    dbCache.conn = await dbCache.promise;
  } catch (e) {
    dbCache.promise = null;
    throw e;
  }

  return dbCache.conn;
}
