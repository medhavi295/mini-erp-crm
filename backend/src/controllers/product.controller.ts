import { Request, Response } from "express";
import pool from "../config/db";

// GET all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET product by ID
export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// CREATE product
export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      unit,
      price,
      stock_quantity,
      reorder_level,
      status,
    } = req.body;

    if (!name || !sku || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU and price are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO products
      (
        name,
        sku,
        description,
        category,
        unit,
        price,
        stock_quantity,
        reorder_level,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        name,
        sku,
        description || null,
        category || null,
        unit || null,
        price,
        stock_quantity ?? 0,
        reorder_level ?? 0,
        status || "ACTIVE",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// UPDATE product
export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      description,
      category,
      unit,
      price,
      stock_quantity,
      reorder_level,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET
         name = COALESCE($1, name),
         sku = COALESCE($2, sku),
         description = COALESCE($3, description),
         category = COALESCE($4, category),
         unit = COALESCE($5, unit),
         price = COALESCE($6, price),
         stock_quantity = COALESCE($7, stock_quantity),
         reorder_level = COALESCE($8, reorder_level),
         status = COALESCE($9, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        name,
        sku,
        description,
        category,
        unit,
        price,
        stock_quantity,
        reorder_level,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// DELETE product
export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
// GET low stock products
export const getLowStockProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        sku,
        category,
        unit,
        price,
        stock_quantity,
        reorder_level,
        status
      FROM products
      WHERE stock_quantity <= reorder_level
      ORDER BY stock_quantity ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get low stock products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
    });
  }
};