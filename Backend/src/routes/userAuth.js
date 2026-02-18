import express from "express"
import { adminRegister, deleteProfile, login, logout, register, updateProfilePic } from "../controllers/userAth.js";
import userMiddleware from "../middleware/userMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import User from "../models/user.js";
import cloudinary from "../utils.js/cloudinary.js";
import fs from "fs";
import upload from "../middleware/upload.js";

const authRouter=express.Router()

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware ,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.put('/update-profile-pic',userMiddleware,upload.single("profilePic"),updateProfilePic);


authRouter.get('/check', userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
      message: "Valid User"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default authRouter
