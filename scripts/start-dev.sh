#!/bin/bash

# Watch-Buddy Development Server Starter
# This script ensures port 3000 is free and starts the dev server

PORT=3000
echo "🔍 Checking if port $PORT is in use..."

# Find process using port 3000
PID=$(lsof -ti:$PORT)

if [ ! -z "$PID" ]; then
  echo "⚠️  Port $PORT is in use by process $PID"
  echo "🔪 Killing process $PID..."
  kill -9 $PID
  sleep 1
  echo "✅ Process killed successfully"
else
  echo "✅ Port $PORT is free"
fi

echo "🚀 Starting development server on port $PORT..."
npm run dev

