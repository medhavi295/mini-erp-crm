import { Router } from "express";

import {
  getChallans,
  getChallanById,
  createChallan,
} from "../controllers/challan.controller";

const router = Router();

// GET all challans
router.get("/", getChallans);

// GET challan by ID
router.get("/:id", getChallanById);

// CREATE challan
router.post("/", createChallan);

export default router;
