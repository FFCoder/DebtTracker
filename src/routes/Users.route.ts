import { Router } from "express";
import * as Controller from "../controllers/Users.controller";

const router = Router();

router.get("/", Controller.getAllUsers);
router.get("/:id", Controller.getUserById);
router.post("/", Controller.createUser);
router.put("/:id", Controller.updateUser);
router.delete("/:id", Controller.deleteUser);

export default router;