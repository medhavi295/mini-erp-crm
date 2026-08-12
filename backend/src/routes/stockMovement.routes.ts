import { Router } from "express";
import {
  getStockMovements,
  getStockMovementById,
  createStockMovement,
} from "../controllers/stockMovement.controller";

const router = Router();

router.get("/", getStockMovements);
router.get("/:id", getStockMovementById);
router.post("/", createStockMovement);

export default router;