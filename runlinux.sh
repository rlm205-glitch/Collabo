#!/usr/bin/bash
set -e

cd frontend
npm run dev &
FRONTEND_PID=$!

cd ../backend
./manage.py runserver &
BACKEND_PID=$!

cleanup() {
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  echo "Shutting Down..."
  exit
}

trap cleanup SIGINT SIGTERM EXIT

wait
