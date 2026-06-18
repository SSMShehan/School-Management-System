import json
import urllib.request
import urllib.parse
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def register():
    url = f"{BASE_URL}/auth/register"
    # Prepare JSON data for Registration
    data = {
        "username": "admin_test",
        "password": "securepassword123",
        "role": "admin"
    }
    json_data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(
        url, 
        data=json_data, 
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Attempting Register: {data['username']}")
    try:
        with urllib.request.urlopen(req) as response:
            print("✅ Registration Success:", response.status)
            print("Response:", response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"ℹ️ Registration Info: {e.code} (User likely exists)")
        print(e.read().decode())

def login():
    url = f"{BASE_URL}/auth/login"
    # Prepare Form Data for Login (OAuth2 spec)
    data = urllib.parse.urlencode({
        "username": "admin_test",
        "password": "securepassword123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    print(f"\nAttempting Login: admin_test")
    try:
        with urllib.request.urlopen(req) as response:
            print("✅ Login Success:", response.status)
            res_body = response.read().decode()
            res_json = json.loads(res_body)
            print("🔑 Token Received:")
            print(res_json.get("access_token"))
            return True
    except urllib.error.HTTPError as e:
        print(f"❌ Login Failed: {e.code}")
        print(e.read().decode())
        return False

import sys

# Force UTF-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    try:
        register()
        login()
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Make sure the server is running on localhost:8000")
