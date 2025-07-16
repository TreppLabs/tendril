#!/bin/bash

echo "Setting up Tendril Plant Growth Game..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully!"
    echo ""
    echo "To start the development server, run:"
    echo "npm run dev"
    echo ""
    echo "Then open http://localhost:3000 in your browser"
else
    echo "Failed to install dependencies. Please try again."
    exit 1
fi 