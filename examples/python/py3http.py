# change request url to your server path
# change your Authorization header to match your account
# run using:
# python3 py3http.py

import json
import urllib.request

data = {
    "id": "python3device",
    "data": {
        "temperature": 25.12,
        "doorClosed" : True,
        "movementDetected" : False
    }
}

req = urllib.request.Request('http://localhost:8080/api/v3/data/post')
req.add_header('Content-Type', 'application/json')
req.add_header('Authorization', 'Basic YXBpOmtleS1tZnJhZGg2ZHJpdmJ5a3o3czRwM3ZseWVsamI4NjY2dg==')

response = urllib.request.urlopen(req, json.dumps(data).encode('utf8'))