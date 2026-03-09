import requests
import json

url = "http://localhost:5678/webhook-test/c9ef6c41-8ef7-443c-8b23-fc72c30a270d"

with open("CV-Rayen-Aribi.pdf", "rb") as f:
    files = {"file": ("CV-Rayen-Aribi.pdf", f, "application/pdf")}
    data = {"sessionId": "user-123"}
    response = requests.post(url, files=files, data=data)

print("Status:", response.status_code)

# Pretty print the result
result = response.text
print(result)