import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Token is not present");

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) throw new Error("Invalid token");

    // Check if the token is blocked in Redis
    const isBlocked = await redisClient.get(token);
    if (isBlocked) throw new Error("Token is blocked");

    // Verify user exists in DB
    const user = await User.findById(_id);
    if (!user) throw new Error("User doesn't exist");

    // Attach user to request for next middleware or route
    req.user = user;

    // Move to the next middleware
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default userMiddleware;


// import jwt from "jsonwebtoken"
// import User from "../models/user.js"
// import redisClient from "../config/redis.js";


// const userMiddleware=async (req,res,next)=>{
//     try {
        
//         const {token}=req.cookies;
//         if(!token) throw new Error("Token is not persent");

//         const payload=jwt.verify(token,process.env.JWT_KEY)

//         const {_id}=payload

//         if(!_id) throw new Error("Invalid token");

//         const result =await User.findById(_id)

//         if(!result) throw new Error("User Doesn't Exist");

//         if(IsBlock) throw new Error("Invalid Token");

//         req.result=result

//         next()
//         res.status(401).send("Error: "+ err.message)
//         // Redis ke blockList mein persent toh nahi hai

//     } catch (error) {
        
//     }
// }

// export default userMiddleware