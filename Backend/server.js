import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'
import passport from "./config/passport.js"
import authRoutes from "./routes/authRoutes.js"
import fileRoutes from "./routes/files.js"
import reportRoutes from "./routes/reportRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"

// App config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())

const allowedOrigins = [
  'https://e-notes-mern-nine.vercel.app',   // Main Frontend
  'https://e-notes-mern-admin.vercel.app',  // Admin Panel
  'http://localhost:5173',                   // Local Frontend dev
  'http://localhost:5174',                   // Local Admin dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// API Endpoints
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api", reportRoutes);
app.use("/api", adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port `+port)
})
