import http.client
import json

payload = json.dumps({
    'id': 4,
    'title': 'Updated Title',
    'author': 'Tirth',
    'date': '2026-07-28',
    'summary': 'Updated summary',
    'body': 'Updated body content that is long enough to pass validation.',
    'tags': ['Notes'],
    'status': 'published'
})

conn = http.client.HTTPConnection('127.0.0.1', 3000)
conn.request('POST', '/blogs/update', payload, {'Content-Type': 'application/json'})
resp = conn.getresponse()
print('STATUS', resp.status)
print(resp.read().decode())
conn.close()

conn = http.client.HTTPConnection('127.0.0.1', 3000)
conn.request('GET', '/blogs/4')
r = conn.getresponse()
print('GET STATUS', r.status)
print(r.read().decode())
conn.close()
