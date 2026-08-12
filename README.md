# Mini ERP + CRM
A full-stack Mini ERP & CRM application for managing customers,
products, inventory/stock movements, and delivery challans.

The application provides a React-based frontend, a Node.js/Express
backend, and PostgreSQL database integration.

## Features

- Customer management (create, view, update, and delete)
- Product catalog and low-stock reporting
- Inventory adjustments with transactional stock updates
- Delivery challans with multiple line items and total calculation
- PostgreSQL connectivity health check

## Tech stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- TypeScript
- Express 5

### Database
- PostgreSQL

### Other
- CORS
- dotenv

## Project structure

```text
MINI-ERP-CRM/
## Project structure

```text
MINI-ERP-CRM/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

## Prerequisites

- Node.js 18 or newer
- A PostgreSQL database

The API expects these database tables to exist: `customers`, `products`, `stock_movements`, `challans`, and `challan_items`. The challan and stock-movement tables may also reference a `users` table through `created_by`.

## Setup

1. Install backend dependencies.

   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` with your database connection details.

   ```env
   PORT=5000
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   JWT_SECRET=replace-with-a-secure-secret
   ```

3. Start the development server.

   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000` by default.

## Scripts

Run these from the `backend` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the API in watch mode with `tsx`. |
| `npm run build` | Compiles TypeScript into `backend/dist`. |
| `npm start` | Runs the compiled server. |

## API endpoints

### System

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Confirms that the API is running. |
| `GET` | `/api/health` | Checks the PostgreSQL connection. |

### Customers

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/customers` | List customers. |
| `GET` | `/api/customers/:id` | Get a customer. |
| `POST` | `/api/customers` | Create a customer. |
| `PUT` | `/api/customers/:id` | Update a customer. |
| `DELETE` | `/api/customers/:id` | Delete a customer. |

Customer creation requires `name`. Optional fields are `email`, `phone`, `address`, `city`, `state`, `pincode`, `gst_number`, and `status` (defaults to `ACTIVE`).

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | List products. |
| `GET` | `/api/products/low-stock` | List products where stock is at or below the reorder level. |
| `GET` | `/api/products/:id` | Get a product. |
| `POST` | `/api/products` | Create a product. |
| `PUT` | `/api/products/:id` | Update a product. |
| `DELETE` | `/api/products/:id` | Delete a product. |

Product creation requires `name`, `sku`, and `price`. Optional fields include `description`, `category`, `unit`, `stock_quantity`, `reorder_level`, and `status`.

### Stock movements

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/stock-movements` | List stock movements. |
| `GET` | `/api/stock-movements/:id` | Get a stock movement. |
| `POST` | `/api/stock-movements` | Record an inventory movement. |

Stock movement creation requires `product_id`, `type` (`IN` or `OUT`), and a positive `quantity`. It atomically updates the associated product's `stock_quantity` and prevents stock from going below zero.

### Challans

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/challans` | List challans with customer names. |
| `GET` | `/api/challans/:id` | Get a challan and its line items. |
| `POST` | `/api/challans` | Create a challan with line items. |

A challan requires `challan_number`, `customer_id`, and a non-empty `items` array. Each item needs a `product_id`, a positive `quantity`, and a non-negative `unit_price`. Supported challan statuses are `DRAFT`, `CONFIRMED`, and `CANCELLED`.

Example request:

```json
{
  "challan_number": "CH-0001",
  "customer_id": 1,
  "challan_date": "2026-08-12",
  "status": "DRAFT",
  "notes": "Handle with care",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 499.99
    }
  ]
}
```

## Notes

- Database connections are configured from `DATABASE_URL`.
- SSL is enabled for PostgreSQL connections in the current configuration.
- Authentication packages are installed, but authentication routes and middleware are not currently wired into the API.
