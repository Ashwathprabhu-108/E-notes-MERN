import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'
import passport from "./config/passport.js"
import authRoutes from "./routes/authRoutes.js"
import fileRoutes from "./routes/files.js"

// App config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors())

// API Endpoints
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port `+port)
})
