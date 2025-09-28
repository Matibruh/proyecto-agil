import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import auth from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Especifica explícitamente el origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use("/auth", auth);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});