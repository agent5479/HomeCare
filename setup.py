"""
HomeCare Management System Setup Script
Helps initialize the application with basic configuration
"""

import os
import secrets
import sys

def create_env_file():
    """Create .env file with basic configuration"""
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Keeping existing .env file")
            return
    
    secret_key = secrets.token_hex(32)
    
    env_content = f"""# Flask Configuration
SECRET_KEY={secret_key}
FLASK_APP=app.py
FLASK_ENV=development

# Database
DATABASE_URL=sqlite:///homecare.db

# Google Maps API
GOOGLE_MAPS_API_KEY=

# Debug Mode (set to False for production)
DEBUG=True
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with a random SECRET_KEY")
    print("📝 Don't forget to add your GOOGLE_MAPS_API_KEY in the .env file")

def check_dependencies():
    """Check if required packages are installed"""
    print("\n🔍 Checking dependencies...")
    
    try:
        import flask
        print(f"✅ Flask {flask.__version__} installed")
    except ImportError:
        print("❌ Flask not installed")
        return False
    
    try:
        import flask_sqlalchemy
        print("✅ Flask-SQLAlchemy installed")
    except ImportError:
        print("❌ Flask-SQLAlchemy not installed")
        return False
    
    try:
        import flask_login
        print("✅ Flask-Login installed")
    except ImportError:
        print("❌ Flask-Login not installed")
        return False
    
    return True

def main():
    print("🏥 HomeCare Management System Setup")
    print("=" * 50)
    
    # Create .env file
    print("\n📋 Step 1: Creating environment configuration...")
    create_env_file()
    
    # Check dependencies
    print("\n📦 Step 2: Checking dependencies...")
    if not check_dependencies():
        print("\n❌ Some dependencies are missing!")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)
    
    print("\n✅ All dependencies installed!")
    
    # Final instructions
    print("\n" + "=" * 50)
    print("🎉 Setup Complete!")
    print("=" * 50)
    print("\n📝 Next Steps:")
    print("1. Edit .env and add your Google Maps API key")
    print("2. Run the application: python app.py")
    print("3. Open browser: http://localhost:5000")
    print("4. Login with predefined accounts:")
    print("   Jess (Admin): Jess / JessCard2025!")
    print("   GBTech (Developer): GBTech / 1q2w3e!Q@W#E")
    print("\n📖 Read README.md for more information")
    print("\nHappy Care Management! 🏥")

if __name__ == "__main__":
    main()

