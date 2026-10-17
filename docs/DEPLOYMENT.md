# Deployment Guide for NyayNow

NyayNow is configured for a modern, hybrid deployment:
1. **Frontend (Next.js):** Deployed on **Vercel** for fast global edge rendering and static assets.
2. **Backend (Node.js/Express):** Deployed on **Render** as a Web Service to handle APIs, WebSockets (Socket.io), and database operations without timeout issues.

---

## 1. Database Setup (MongoDB Atlas)
1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. Add a database user (username and password) and configure the IP access list to allow `0.0.0.0/0` (access from anywhere).
4. Copy your connection string. It will look like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nyaynow?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render)

We have provided a `render.yaml` Blueprint file at the root of the project to make deployment simple.

1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **Blueprints > New Blueprint Instance**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. In the configuration page, provide values for the following required environment variables:
   - **`MONGO_URI`**: Your MongoDB Atlas connection string.
   - **`JWT_SECRET`**: A secure, long random string for signing JWT tokens.
   - **`GEMINI_API_KEY`**: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - **`RZP_KEY_ID`**: Your Razorpay API Key ID.
   - **`RZP_KEY_SECRET`**: Your Razorpay API Key Secret.
   - **`CLIENT_URL`**: Your frontend URL on Vercel (e.g. `https://nyaynow.in` or your Vercel subdomain).
6. Click **Deploy**. Render will build and run your Node.js backend.
7. Copy your backend service URL (e.g. `https://nyaynow-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project settings, configure:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `client`
   - **Build Command:** `Default` (`next build`)
   - **Output Directory:** `Default` (`.next`)
   - **Install Command:** `npm install`
4. Add the following **Environment Variable**:
   - **`NEXT_PUBLIC_API_URL`**: Your Render Backend API URL (e.g. `https://nyaynow-backend.onrender.com/api`).
5. Click **Deploy**. Vercel will build and deploy the Next.js application.

---

## 4. Local Development

To run the project locally:

1. **Backend:**
   ```bash
   cd server
   npm install
   # Create a .env file with JWT_SECRET, MONGO_URI, and GEMINI_API_KEY
   npm run dev
   ```
2. **Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
