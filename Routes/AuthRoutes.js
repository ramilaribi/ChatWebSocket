import express from "express";
import authController from "../Controllers/AuthController.js"; 
import {verifyAndAuth } from "../Middleware/verifyToken.js"; 

const router = express.Router();

router.post("/signup", authController.register);
router.post("/login", authController.login);
export default router;