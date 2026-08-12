import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import stockMovementRoutes from "./routes/stockMovement.routes";
import challanRoutes from "./routes/challan.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/challans", challanRoutes);
// Basic API test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mini ERP + CRM API is running"
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connected successfully",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});