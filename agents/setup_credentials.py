#!/usr/bin/env python3
"""
Google API Credentials Setup Script
Interactive script to help configure Google API credentials for ADK.
"""

import os
import getpass
from pathlib import Path

def setup_api_key():
    """Set up Google AI API key."""
    print("\n🔑 Setting up Google AI API Key")
    print("=" * 40)
    
    print("To get a Google AI API key:")
    print("1. Go to https://aistudio.google.com/")
    print("2. Sign in with your Google account")
    print("3. Click 'Get API key' in the top right")
    print("4. Create a new API key or use an existing one")
    print("5. Copy the API key")
    print()
    
    api_key = getpass.getpass("Enter your Google AI API key (input will be hidden): ")
    
    if api_key.strip():
        # Update .env file
        env_file = Path(".env")
        if env_file.exists():
            content = env_file.read_text()
            # Replace the placeholder
            if "GOOGLE_API_KEY=your-gemini-api-key-here" in content:
                content = content.replace("GOOGLE_API_KEY=your-gemini-api-key-here", f"GOOGLE_API_KEY={api_key}")
            else:
                # Add the line if it doesn't exist
                content += f"\nGOOGLE_API_KEY={api_key}"
            
            env_file.write_text(content)
            print("✅ API key saved to .env file")
            
            # Set environment variable for current session
            os.environ["GOOGLE_API_KEY"] = api_key
            print("✅ API key set for current session")
            
            return True
        else:
            print("❌ .env file not found")
            return False
    else:
        print("❌ No API key provided")
        return False

def setup_service_account():
    """Set up Google Cloud Service Account."""
    print("\n🔑 Setting up Google Cloud Service Account")
    print("=" * 40)
    
    print("To set up a service account:")
    print("1. Go to https://console.cloud.google.com/")
    print("2. Create a new project or select an existing one")
    print("3. Enable Gemini API and Vertex AI API")
    print("4. Go to IAM & Admin > Service Accounts")
    print("5. Create a new service account")
    print("6. Download the JSON key file")
    print()
    
    # Get service account file path
    while True:
        json_path = input("Enter the path to your service account JSON file: ").strip()
        if json_path:
            json_file = Path(json_path)
            if json_file.exists():
                break
            else:
                print("❌ File not found. Please check the path.")
        else:
            print("❌ Please provide a file path.")
    
    # Get project details
    project_id = input("Enter your Google Cloud Project ID: ").strip()
    location = input("Enter your Google Cloud location (default: us-central1): ").strip() or "us-central1"
    
    # Update .env file
    env_file = Path(".env")
    if env_file.exists():
        content = env_file.read_text()
        
        # Add or update service account settings
        lines = content.split('\n')
        updated_lines = []
        
        # Remove existing service account lines
        for line in lines:
            if not line.startswith(('GOOGLE_APPLICATION_CREDENTIALS=', 'GOOGLE_CLOUD_PROJECT=', 'GOOGLE_CLOUD_LOCATION=')):
                updated_lines.append(line)
        
        # Add new service account lines
        updated_lines.extend([
            f"GOOGLE_APPLICATION_CREDENTIALS={json_path}",
            f"GOOGLE_CLOUD_PROJECT={project_id}",
            f"GOOGLE_CLOUD_LOCATION={location}"
        ])
        
        env_file.write_text('\n'.join(updated_lines))
        print("✅ Service account settings saved to .env file")
        
        # Set environment variables for current session
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = json_path
        os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
        os.environ["GOOGLE_CLOUD_LOCATION"] = location
        print("✅ Service account settings set for current session")
        
        return True
    else:
        print("❌ .env file not found")
        return False

def main():
    """Main setup function."""
    print("🚀 Google API Credentials Setup")
    print("=" * 50)
    
    print("This script will help you configure Google API credentials for the ADK system.")
    print("You can choose between two options:")
    print()
    print("1. Google AI API Key (simpler, good for development)")
    print("2. Google Cloud Service Account (more secure, good for production)")
    print()
    
    while True:
        choice = input("Choose option (1 or 2): ").strip()
        if choice in ['1', '2']:
            break
        print("Please enter 1 or 2.")
    
    if choice == '1':
        success = setup_api_key()
    else:
        success = setup_service_account()
    
    if success:
        print("\n🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Test your configuration: python3 test_credentials.py")
        print("2. Run the full test suite: python3 test_complete_adk_system.py")
        print("3. Start the server: python3 server.py")
    else:
        print("\n❌ Setup failed. Please try again.")
        print("You can also manually edit the .env file following the guide in GOOGLE_API_SETUP.md")

if __name__ == "__main__":
    main()
