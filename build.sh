#!/bin/bash
echo "📂 Current directory:"
pwd

echo "📁 Listing files:"
ls -al

echo "📄 Showing package-lock.json head:"
head -n 20 package-lock.json

npm install
npm run build:pages