#!/bin/bash

echo "========================================"
echo " HomeCare Management System"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Check if requirements are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Running setup..."
    python setup.py
    echo ""
    echo "Please edit .env file and add your Google Maps API key if needed."
    echo "Then run this script again."
    read -p "Press enter to continue..."
    exit 0
fi

# Run the application
echo "Starting HomeCare Management System..."
echo ""
echo "Open your browser and go to: http://localhost:5000"
echo "Login with: Jess / JessCard2025! or GBTech / 1q2w3e!Q@W#E"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
python app.py

