import { Request, Response } from "express";
import pool from "../config/db";

// GET all customers
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number,
        status,
        created_at,
        updated_at
      FROM customers
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};


// GET customer by ID
export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number,
        status,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};


// CREATE customer
export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gst_number,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO customers (
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        gst_number,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        gst_number || null,
        status || "ACTIVE",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};


// UPDATE customer
export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gst_number,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE customers
      SET
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        city = $5,
        state = $6,
        pincode = $7,
        gst_number = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        gst_number || null,
        status || "ACTIVE",
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};


// DELETE customer
export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM customers
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};