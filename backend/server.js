import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.config.js';
import userRoute from './src/routes/user.routes.js';
import postRoute from './src/routes/post.routes.js';
import messageRoute from './src/routes/message.routes.js';
import notificationRoute from './src/routes/notifications.routes.js';
dotenv.config();
import { app,server } from './src/socket/socket.js'; // Import the socket app


const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: "http://localhost:5173",  // ✅ explicitly allow frontend origin
  credentials: true                 // ✅ allow cookies / credentials
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/user',userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);
app.use('/api/v1/notifications', notificationRoute);


server.listen(PORT, () => {
  console.log(`Server is running on port, http://localhost:${PORT}`);
});