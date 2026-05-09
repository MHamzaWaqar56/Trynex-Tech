import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined.");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.mongooseConnection ?? { conn: null, promise: null };

global.mongooseConnection = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const mongoUri = MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
