@echo off
echo Starting Nyay Sathi Full Stack...

echo 1. Starting Database...
start "MongoDB" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath ./data --bind_ip 127.0.0.1 --port 27017

timeout /t 5

echo 2. Starting Backend...
cd server
start "Backend" cmd /k "node index.js"
cd ..

timeout /t 5

echo 3. Starting Frontend...
cd client
start "Frontend" cmd /k "npm run dev"

echo DONE! check http://localhost:5173
