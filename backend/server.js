import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.config.js';
import userRoute from './src/routes/user.routes.js';
import postRoute from './src/routes/post.routes.js';
import messageRoute from './src/routes/message.routes.js';
import notificationRoute from './src/routes/notifications.routes.js';
import { app, server } from './src/socket/socket.js'; // socket.io setup
import { handleDialogflowRequest } from './src/controllers/dialogflow.controller.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);
app.use('/api/v1/notifications', notificationRoute);

// Dialogflow route (delegated to controller)
app.post("/api/v1/dialogflow", handleDialogflowRequest);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
