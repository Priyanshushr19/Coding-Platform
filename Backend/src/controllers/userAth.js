import { response } from "express";
import redisClient from "../config/redis.js";
import User from "../models/user.js";
import validate from "../utils.js/userAuth.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const register = async (req, res) => {
    try {
        // 1. Validate input data
        validate(req.body);

        const { firstName, emailId, password } = req.body;
        

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);

        // 3. Create user object
        const newUser = {
            ...req.body,
            password: hashedPassword,
            role: "user"
        };

        

        // console.log(newUser);

        

        // 4. Save user
        const user = await User.create(newUser);
       

        // console.log(user);

        // 5. Create JWT token
        
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        

        // 6. Prepare return data
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        };

        // 7. Store token in cookie securely
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",  // true only in prod
        });

        // 8. Send final response
        return res.status(201).json({
            user: reply,
            message: "Registered Successfully"
        });

    } catch (error) {
        return res.status(400).send("Error: " + error.message);
    }
};


// const register = async (req, res) => {
//     try {
//         validate(req.body);
//         const { firstName, emailId, password } = req.body;

        

//         req.body.password = await bcrypt.hash(password, 10);
//         req.body.role = 'user'

//         console.log("object");

//         const user = await User.create(req.body);
        
//         const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 60 * 60 })

//         const reply = {
//             firstName: user.firstName,
//             emailId: user.emailId,
//             _id: user._id,
//             role: user.role,
//         }

        

//         res.cookie('token', token, { maxAge: 60 * 60 * 1000 })
//         res.status(201).json({
//             user: reply,
//             message: "Loggin Successfully"
//         })

//     } catch (error) {
//         res.status(400).send("Error: " + error);
//     }
// }


const login = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" })
    }

    const reply = {
    firstName: user.firstName || "User",
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      user: reply,
      message: "Login Successful"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error"
    });
  }
};


const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked')
        await redisClient.expireAt(`token:${token}`, payload.exp)

        res.cookie("token", null, { expires: new Date(Date.now()) })
        res.send("Logged Out Succesfully");
    } catch (error) {
        res.status(503).send("Error: " + error);
    }
}

// const logout = async (req, res) => {
//   try {
//     const { token } = req.cookies;

//     if (!token) {
//       return res.status(400).json({ success: false, message: "No token found" });
//     }

//     // Verify the token first
//     const payload = jwt.verify(token, process.env.JWT_KEY);

//     // Block the token in Redis until it naturally expires
//     await redisClient.set(`token:${token}`, "Blocked");
//     await redisClient.expireAt(`token:${token}`, payload.exp);

//     // Clear the cookie
//     res.cookie("token", "", {
//       httpOnly: true,
//       expires: new Date(Date.now()),
//       sameSite: "strict",
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.json({ success: true, message: "Logged out successfully" });

//   } catch (error) {
//     res.status(503).json({ success: false, message: error.message });
//   }
// };


const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        console.log("object");
        const { firstName, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(201).send("User Registered Successfully");
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
}

const deleteProfile = async (req, res) => {

    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);
        res.status(200).send("Deleted Successfully");
    }
    catch (err) {

        res.status(500).send("Internal Server Error");
    }
}


const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });


    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path }, // Cloudinary URL ✅
      { new: true }
    );


    res.status(200).json({
      success: true,
      imageUrl: req.file.path, // ✅ will show cloudinary link
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


export { register, login, logout , adminRegister, deleteProfile, updateProfilePic}