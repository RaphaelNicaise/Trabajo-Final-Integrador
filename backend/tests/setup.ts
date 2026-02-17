import mongoose from 'mongoose';

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/platform_meta_test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});