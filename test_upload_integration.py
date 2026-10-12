import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_file_upload(filename, mime_type):
    print(f"\n--- Testing upload of {filename} ({mime_type}) ---")
    url = f"{BASE_URL}/api/analyze"
    with open(filename, "rb") as f:
        # Exact field name 'file'
        files = {"file": (filename, f, mime_type)}
        # Do NOT manually set Content-Type: multipart/form-data; requests sets boundary automatically
        response = requests.post(url, files=files, timeout=120)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Upload successful!")
        print(f"Filename: {data.get('filename')}")
        print(f"Contract Type: {data.get('contract_type')}")
        print(f"Entities: {data.get('entities')}")
        print(f"Summary preview: {data.get('summary', '')[:100]}...")
        print(f"Risk analysis preview: {data.get('risk_analysis', '')[:100]}...")
        return True
    else:
        print(f"Error ({response.status_code}): {response.text}")
        return False

def test_invalid_upload_422():
    print("\n--- Testing invalid payload (simulating previous [object Object] bug) ---")
    url = f"{BASE_URL}/api/analyze"
    # Sending string instead of a real file
    response = requests.post(url, data={"file": "[object Object]"}, timeout=10)
    print(f"Status Code: {response.status_code} (Expected 422)")
    print(f"Response Detail: {response.text}")

if __name__ == "__main__":
    test_invalid_upload_422()
