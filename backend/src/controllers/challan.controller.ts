import { Request, Response } from "express";
import pool from "../config/db";

// GET all challans
export const getChallans = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        cu.name AS customer_name
      FROM challans c
      JOIN customers cu ON c.customer_id = cu.id
      ORDER BY c.id DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get challans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challans",
    });
  }
};

// GET challan by ID
export const getChallanById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const challanResult = await pool.query(
      `
      SELECT
        c.*,
        cu.name AS customer_name,
        cu.email AS customer_email,
        cu.phone AS customer_phone
      FROM challans c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = $1
      `,
      [id]
    );

    if (challanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        ci.*,
        p.name AS product_name,
        p.sku
      FROM challan_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.challan_id = $1
      ORDER BY ci.id
      `,
      [id]
    );

    res.json({
      success: true,
      data: {
        challan: challanResult.rows[0],
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("Get challan by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
};
// CREATE challan with items
export const createChallan = async (
  req: Request,
  res: Response
) => {
  const client = await pool.connect();

  try {
    const {
      challan_number,
      customer_id,
      challan_date,
      status,
      notes,
      created_by,
      items,
    } = req.body;

    // Basic validation
    if (!challan_number || !customer_id || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message:
          "challan_number, customer_id and items are required",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one challan item is required",
      });
    }

    // Validate status
    const allowedStatuses = [
      "DRAFT",
      "CONFIRMED",
      "CANCELLED",
    ];

    const challanStatus = status || "DRAFT";

    if (!allowedStatuses.includes(challanStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: DRAFT, CONFIRMED, CANCELLED",
      });
    }

    // Validate items
    for (const item of items) {
      if (
        !item.product_id ||
        !item.quantity ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have product_id and quantity greater than 0",
        });
      }

      if (
        item.unit_price === undefined ||
        item.unit_price === null ||
        Number(item.unit_price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each item must have a valid unit_price",
        });
      }
    }

    // Start transaction
    await client.query("BEGIN");

    // Calculate total amount
    let totalAmount = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);

      totalAmount += quantity * unitPrice;
    }

   // Create challan
const challanResult = await client.query(
  `
  INSERT INTO challans (
    challan_number,
    customer_id,
    challan_date,
    status,
    total_amount,
    notes,
    created_by
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `,
  [
    challan_number,
    customer_id,
    challan_date || null,
    challanStatus,
    totalAmount,
    notes || null,
    created_by ?? null,
  ]
);

const challan = challanResult.rows[0];


    // Create challan items
    const createdItems = [];

    for (const item of items) {
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unit_price);

  const itemResult = await client.query(
    `
    INSERT INTO challan_items (
      challan_id,
      product_id,
      quantity,
      unit_price
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      challan.id,
      item.product_id,
      quantity,
      unitPrice
    ]
  );

  createdItems.push(itemResult.rows[0]);
}

    // Commit transaction
    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: {
        challan,
        items: createdItems,
      },
    });
  } catch (error: any) {
    // Rollback if anything fails
    await client.query("ROLLBACK");

    console.error("ERROR:", error.message);

    // Duplicate challan number
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Challan number already exists",
      });
    }

    // Foreign key error
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid customer, product, or created_by user",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create challan",
    });
  } finally {
    client.release();
  }
};