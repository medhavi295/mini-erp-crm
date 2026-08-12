import { Request, Response } from "express";
import pool from "../config/db";

// GET all stock movements
export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        sm.*,
        p.name AS product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.id DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};

// GET stock movement by ID
export const getStockMovementById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        sm.*,
        p.name AS product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock movement not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movement",
    });
  }
};
// CREATE stock movement
export const createStockMovement = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const {
      product_id,
      type,
      quantity,
      reference_type,
      reference_id,
      notes,
      created_by,
    } = req.body;

    // Validate required fields
    if (!product_id || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: "product_id, type and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either IN or OUT",
      });
    }

    // Start transaction
    await client.query("BEGIN");

    // Get product and lock the row
    const productResult = await client.query(
      `
      SELECT id, name, stock_quantity
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];
    let newStockQuantity: number;

    // Calculate new stock
    if (type === "IN") {
      newStockQuantity = product.stock_quantity + quantity;
    } else {
      // OUT
      if (product.stock_quantity < quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available stock: ${product.stock_quantity}`,
        });
      }

      newStockQuantity = product.stock_quantity - quantity;
    }

    // Update product stock
    await client.query(
      `
      UPDATE products
      SET stock_quantity = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newStockQuantity, product_id]
    );

    // Create stock movement
    const movementResult = await client.query(
      `
      INSERT INTO stock_movements (
        product_id,
        type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        product_id,
        type,
        quantity,
        reference_type || null,
        reference_id || null,
        notes || null,
        created_by || null,
      ]
    );

    // Commit transaction
    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Stock movement created successfully",
      data: {
        movement: movementResult.rows[0],
        product: {
          id: product.id,
          name: product.name,
          previous_stock: product.stock_quantity,
          new_stock: newStockQuantity,
        },
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create stock movement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create stock movement",
    });
  } finally {
    client.release();
  }
};