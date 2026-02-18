import express from "express"
const app=express()
import { configDotenv } from "dotenv"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRouter from "./src/routes/userAuth.js"
import redisClient from "./src/config/redis.js"
import problemRouter from "./src/routes/ProblemCreator.js"
import submitRouter from "./src/routes/submit.js"
import cors from "cors"
import aiRouter from "./src/routes/aiChatting.js"
import videoRouter from "./src/routes/videoCreator.js"
import discussionRouter from "./src/routes/discussionRouter.js"
import contestRouter from "./src/routes/contestRoutes.js"
import { connectDB } from "./src/config/db.js"

app.use(cors({
    // origin: 'http://localhost:5173',
    origin:'https://coding-platform-front-end.onrender.com',
    credentials: true 
}));

configDotenv(); 
app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter)
app.use('/problem',problemRouter)
app.use('/submission',submitRouter)
app.use('/ai',aiRouter);
app.use("/video",videoRouter);
app.use('/discussion', discussionRouter);
app.use("/api/contests",contestRouter);

app.use(express.urlencoded({ extended: true })); 

const main = async () => {
    // await mongoose.connect(process.env.MONGO_URI);
    connectDB()
    console.log("✅ MongoDB Connected");
    await redisClient.connect();
    console.log("✅ Redis Connected");

    
    // safe Redis connection
    // try {
    //     
    //    
    // } catch (err) {
    //     console.log("❌ Redis NOT running — Skipping Redis connection");
    // }

    app.listen(process.env.PORT, () => {
        console.log("Server listening at port number: " + process.env.PORT);
    });
};


main()
