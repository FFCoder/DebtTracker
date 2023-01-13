import { Router } from "express";
import * as Controller from "../controllers/Account.controller";

const router = Router();

router.get("/", Controller.getAccounts);
router.get("/:id", Controller.getAccount);
router.post("/", Controller.createAccount);
router.put("/:id", Controller.updateAccount);
router.delete("/:id", Controller.deleteAccount);

export default router;
