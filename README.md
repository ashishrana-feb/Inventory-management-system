# InvenTrack — Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing products, customers, orders, and inventory.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

---

## Features

### Product Management
- Create, view, update, and delete products
- Unique SKU enforcement
- Real-time stock level badges (In Stock / Low / Out of Stock)
- Category and description support

### Customer Management
- Add and delete customers
- Unique email enforcement
- Searchable customer list with avatar initials

### Order Management
- Create multi-item orders with automatic total calculation
- Inventory validation — orders blocked when stock insufficient
- Stock automatically reduced when order is placed
- Stock automatically restored when order is cancelled
- Expandable order rows showing line items

### Dashboard
- Total products, customers, orders, and revenue
- Low stock alerts (≤10 units)
- Recent orders feed

---

## Local Development with Docker

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventory-system

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env — at minimum change POSTGRES_PASSWORD

# 3. Build and start all services
docker compose up --build

# 4. Open the app
open http://localhost:3000        # Frontend
open http://localhost:8000/docs   # API docs (Swagger UI)
```

All three services start automatically:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **PostgreSQL** → localhost:5432

The database schema is created automatically on first startup.

### Useful Commands

```bash
# Start in background
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v

# Rebuild a single service
docker compose build backend
docker compose up -d --no-deps backend
```

---

## Running Without Docker (Development)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Start
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Set environment variable
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
# → http://localhost:5173
```

---

## API Reference

All endpoints return JSON. Errors include a `detail` field.

### Products

| Method | Path | Description |
|---|---|---|
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

**Create/Update payload:**
```json
{
  "name": "Wireless Keyboard",
  "sku": "WK-001",
  "price": 49.99,
  "quantity": 100,
  "category": "Electronics",
  "description": "Compact wireless keyboard"
}
```

### Customers

| Method | Path | Description |
|---|---|---|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

**Create payload:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1 555-0100",
  "address": "123 Main St"
}
```

### Orders

| Method | Path | Description |
|---|---|---|
| GET | `/orders` | List all orders |
| POST | `/orders` | Create order |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

**Create payload:**
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ],
  "notes": "Rush delivery"
}
```

### Dashboard

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Summary stats + low stock + recent orders |

### Interactive API Docs

Visit `http://localhost:8000/docs` for the full Swagger UI.

---

## Business Rules

1. **Unique SKU** — Duplicate SKUs return HTTP 409
2. **Unique email** — Duplicate customer emails return HTTP 409
3. **Non-negative quantity** — Validated at API and DB level
4. **Inventory check** — Orders with insufficient stock return HTTP 422
5. **Auto stock deduction** — Placing an order reduces `product.quantity`
6. **Auto stock restoration** — Cancelling an order restores `product.quantity`
7. **Auto total calculation** — `total_amount = sum(price × quantity)` per item

---

## Deployment

### Backend on Render (free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, select the `backend` directory
4. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   ```
   DATABASE_URL=<your-render-postgres-url>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Add a **Render PostgreSQL** database and copy its connection string

### Frontend on Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy — Vercel handles build automatically

### Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy from project root
railway init
railway up
```

---

## Project Structure

```
inventory-system/
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── main.py          # FastAPI app, CORS, lifespan
│   ├── database.py      # SQLAlchemy engine & session
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   └── routers/
│       ├── products.py
│       ├── customers.py
│       ├── orders.py
│       └── dashboard.py
│
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js       # Axios API client
        └── pages/
            ├── Dashboard.jsx
            ├── Products.jsx
            ├── Customers.jsx
            └── Orders.jsx
```

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `postgres` | DB username |
| `POSTGRES_PASSWORD` | *(required)* | DB password |
| `POSTGRES_DB` | `inventory_db` | DB name |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS origins |
| `VITE_API_URL` | `http://localhost:8000` | Frontend → backend URL |

### Backend `.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
