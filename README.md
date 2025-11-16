Mini-Flipkart Monorepo

Overview
- Web storefront with product grid, product details, cart/checkout, order confirmation
- Admin area with JWT login to add/edit products, manage inventory and orders, export CSV
- Backend: FastAPI + MongoDB
- Frontend: React + Vite + Tailwind
- Mock payments endpoint

Repo Structure
- /frontend – React app
- /backend – FastAPI API
- /db – seed data

Local Development
1) Backend
- Create .env with:
  SECRET_KEY=change-me
  DATABASE_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
  DATABASE_NAME=shoplite
- cd backend
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8000
- Seed admin and data (once):
  - POST /auth/seed-admin { username: "admin", password: "admin123" }
  - Insert products from db/seed.json into product collection (manual or small script)

2) Frontend
- cd frontend
- echo VITE_BACKEND_URL=http://localhost:8000 > .env
- npm install
- npm run dev

Deployment
Frontend (Vercel/Netlify)
- Set env VITE_BACKEND_URL to deployed backend URL
- Build command: npm run build; Output: dist

Backend (Render/Railway/Heroku)
- Set env SECRET_KEY, DATABASE_URL, DATABASE_NAME
- Start command: uvicorn main:app --host 0.0.0.0 --port $PORT

Database Schema (MongoDB)
- Collections: adminuser, product, order
- See backend/schemas.py for Pydantic schemas

Testing Checklist
- Catalog loads 10 products
- Product page shows images, sizes/colors, price and Buy Now
- Checkout requires mandatory fields and creates order, shows confirmation id
- Admin login returns JWT with correct creds
- Admin can create product, update stock, list and export orders
- CORS allows frontend origin

Packages
Frontend: react, react-router-dom, tailwindcss, @splinetool/react-spline
Backend: fastapi, uvicorn, pydantic, pymongo, python-jose, passlib[bcrypt]

Notes
- This is a scaffold focusing on core flows and admin endpoints. Extend with full cart and protected admin UI as needed.
