import { Router } from "express";
import { getJWT, register } from "../controllers/Auth.controller";

const router = Router();

router.post("/login", getJWT);

router.post("/register", register);

export default router;
