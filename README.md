## Student Application - MERN Stack

This project is a simple MERN stack **Student Application** with:

- A React + Vite + Tailwind + Framer Motion front‑end
- A Node.js + Express + MongoDB + Multer back‑end

### 1. Prerequisites

- Node.js and npm installed
- A MongoDB Atlas cluster and connection string

### 2. Backend Setup (port 5000)

1. In a terminal, go to the backend folder:

   ```bash
   cd backend
   ```

2. Open `.env` and set:

   ```bash
   MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE
   FRONTEND_ORIGIN=http://localhost:5173
   PORT=5000
   ```

3. Start the backend API:

   ```bash
   npm run dev
   ```

   The API will run on `http://localhost:5000`.

### 3. Frontend Setup (port 5173)

1. In another terminal, go to the frontend folder:

   ```bash
   cd frontend
   ```

2. Start the React dev server:

   ```bash
   npm run dev
   ```

   Vite will run on `http://localhost:5173`.

### 4. Avoiding `ERR_CONNECTION_REFUSED`

- **Backend** must be running on `http://localhost:5000`.
- **Frontend** (Vite) runs on `http://localhost:5173`.
- CORS is configured on the backend to allow `http://localhost:5173`.
- The React app posts to `http://localhost:5000/api/submit`.

If you see `ERR_CONNECTION_REFUSED`, check:

- The backend terminal for any errors.
- That your MongoDB Atlas connection string in `.env` is correct.
- That ports `5000` and `5173` are not blocked or already in use.

