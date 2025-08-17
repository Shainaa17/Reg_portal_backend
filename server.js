import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = [

  'http://127.0.0.1:5500',
  'http://localhost:5173/',
  'https://registration-portal-rust.vercel.app/'

];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, POST, OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.options('*', cors()); // Handle preflight requests

// Body Parsing Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process if DB connection fails
  });

// Updated Contact Form Schema to match frontend
const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  submittedAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model('Contact', contactSchema);

// Health Check
app.get('/', (_req, res) => res.send('Server is running...'));

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  // Validate required fields
  if (!fullName || !admissionNumber || !branch || !phoneNumber || !email) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

  try {
    // Save to database
    const contact = new Contact({  fullName,
            admissionNumber,
            branch,
            phoneNumber,
            email, });
    await contact.save();

    console.log('Form submitted successfully!');
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    res.status(500).json({ error: 'Failed to handle form submission' });
  }
});

// Start Server

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

