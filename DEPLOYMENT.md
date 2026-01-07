# Deployment Guide for Nyay-Sathi

Since your project runs AI natively in Node.js, you only need to deploy the **Frontend** and **Backend**. You can do this easily on **Render.com**.

## Option 1: All-in-One on Render.com (Recommended)
Render allows you to deploy Node.js, Python, and Static sites in one place.

### 1. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Shared Cluster**.
3. Create a User (username/password) and whitelist IP `0.0.0.0/0` (for cloud access).
4. Your connection string is: `mongodb+srv://dhruvkumar21075_db_user:Dhruv%402107@cluster0.iofqvq2.mongodb.net/nyaysathi?retryWrites=true&w=majority`. (Note: The `@` in your password has been encoded to `%40` for URL compatibility).

### 2. Backend (Node.js)
1. Push your code to GitHub.
2. In Render, create a **Web Service**.
3. Connect your repo.
4. **Root Directory**: `server`
5. **Build Command**: `npm install`
6. **Start Command**: `node index.js`
7. **Environment Variables** (Add these in Render):
   - `MONGO_URI`: `mongodb+srv://dhruvkumar21075_db_user:Dhruv%402107@cluster0.iofqvq2.mongodb.net/nyaysathi?retryWrites=true&w=majority`
   - `JWT_SECRET`: `super_secret_key_change_later`
   - `GEMINI_API_KEY`: (Get a NEW key from https://aistudio.google.com/app/apikey)
   - `RZP_KEY_ID`: (Your Razorpay Test Key ID)
   - `RZP_KEY_SECRET`: (Your Razorpay Test Key Secret)
   - `SENTRY_DSN`: (Optional: Your Sentry DSN for backend monitoring)
   - `CLOUDINARY_CLOUD_NAME`: (Optional: For file uploads)
   - `CLOUDINARY_API_KEY`: (Optional: For file uploads)
   - `CLOUDINARY_API_SECRET`: (Optional: For file uploads)

### 3. Frontend (React)
1. In Render, create a **Static Site**.
2. Connect the same repo.
3. **Root Directory**: `client`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL`: `https://nyaysathi-79nf.onrender.com`
   - `VITE_SENTRY_DSN`: (Optional: Your Sentry DSN for frontend)
   - `VITE_POSTHOG_KEY`: (Optional: Your PostHog Key for analytics)

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Frontend (Vercel)
1. Install Vercel CLI or go to Vercel.com.
2. Import repo.
3. **Framework Preset**: Vite.
4. **Root Directory**: `client`.
5. Add Env Var: `VITE_API_URL` = (Your Render Backend URL).
6. Add Env Var: `VITE_SENTRY_DSN` = (Your Sentry DSN).
7. Add Env Var: `VITE_POSTHOG_KEY` = (Your PostHog Key).

---

## Option 3: Netlify (Frontend) + Render (Backend)

### Frontend (Netlify)
1. Push your code to GitHub.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** -> **"Import from existing project"**.
4. Connect to GitHub and select your repository.
5. **Base directory**: `client` (IMPORTANT)
6. **Build command**: `npm install && npm run build`
   - *Note: If asked to authorize the "Netlify App" on GitHub, click "Install" and select your repository. This allows Netlify to show "Deployed" status on your GitHub commits.*
7. **Publish directory**: `dist`
8. Click **Deploy**.
9. Go to **Site Settings** -> **Environment variables**.
10. Add Variables:
    - `VITE_API_URL`: (Your Render Backend URL, e.g., `https://nyaysathi-79nf.onrender.com`)
    - `VITE_SENTRY_DSN`: (Your Sentry DSN for error tracking)
    - `VITE_POSTHOG_KEY`: (Your PostHog Key for analytics)
11. Trigger a new deploy if needed.

### Backend & Python
Use Render (as described above) because Vercel Serverless functions have 10s timeouts which might be too short for AI/Database operations.
