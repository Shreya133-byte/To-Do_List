const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const tasksRouter = require('./routes/taskRoutes');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/tasks', tasksRouter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-app';
const MAX_MONGO_RETRIES = 5;
const MONGO_RETRY_DELAY_MS = 5000;

if (!process.env.MONGO_URI) {
  console.log('No MONGO_URI set. Using local MongoDB default:', MONGO_URI);
}

async function connectToMongo(retries = 0) {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${retries + 1}/${MAX_MONGO_RETRIES}):`, error.message);

    if (retries < MAX_MONGO_RETRIES - 1) {
      console.log(`Retrying MongoDB connection in ${MONGO_RETRY_DELAY_MS / 1000} seconds...`);
      setTimeout(() => connectToMongo(retries + 1), MONGO_RETRY_DELAY_MS);
      return;
    }

    console.error('Unable to connect to MongoDB after multiple attempts. Please ensure MongoDB is running and MONGO_URI is correct.');
    process.exit(1);
  }
}

connectToMongo();
