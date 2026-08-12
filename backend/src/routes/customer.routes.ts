import { Router } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

const router = Router();

// GET all customers
router.get("/", getCustomers);

// GET customer by ID
router.get("/:id", getCustomerById);

// CREATE customer
router.post("/", createCustomer);

// UPDATE customer
router.put("/:id", updateCustomer);

// DELETE customer
router.delete("/:id", deleteCustomer);

export default router;
