# -------------------------------
# BUILD STAGE
# -------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first
COPY package.json ./

# Install deps (no package-lock to avoid OS conflict)
RUN npm install --include=optional

# Copy rest of the app
COPY . .

# Build Vite app
RUN npm run build

# -------------------------------
# SERVE STAGE
# -------------------------------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
