import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  isDisabled: { type: Boolean, default: false }
});

const User = mongoose.model('User_temp', userSchema, 'users');

async function toggleUser(username) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    if (!username) {
      const users = await User.find({}, 'username email isDisabled');
      console.log('Available users:');
      console.log(users);
      process.exit(0);
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log(`User not found: ${username}`);
      const users = await User.find({}, 'username email isDisabled');
      console.log('Available users:');
      console.log(users);
      process.exit(0);
    }

    console.log(`Current status for ${username}: isDisabled = ${user.isDisabled}`);
    user.isDisabled = !user.isDisabled;
    await user.save();
    console.log(`Updated status for ${username}: isDisabled = ${user.isDisabled}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

const args = process.argv.slice(2);
toggleUser(args[0]);
