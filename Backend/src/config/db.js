import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        mongoose.connection.on('connected',()=>console.log("DB connection done "))
        await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        console.log(error.message);
    }
}
