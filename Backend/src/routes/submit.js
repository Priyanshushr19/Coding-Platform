import express from "express"
import userMiddleware from "../middleware/userMiddleware.js"
import { runCode, submitCode } from "../controllers/userSubmmission.js"


const submitRouter=express.Router()

submitRouter.post("/submit/:id",userMiddleware,submitCode)
submitRouter.post("/run/:id",userMiddleware,runCode)

export default submitRouter