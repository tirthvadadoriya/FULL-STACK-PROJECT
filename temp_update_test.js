const http = require('http');
const payload = JSON.stringify({
  id: 4,
  title: 'Updated Title',
  author: 'Tirth',
  date: '2026-07-28',
  summary: 'Updated summary',
  body: 'Updated body content that is long enough to pass validation.',
  tags: ['Notes'],
  status: 'published'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/blogs/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);

    const req2 = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/blogs/4',
      method: 'GET'
    }, res2 => {
      console.log('GET STATUS', res2.statusCode);
      res2.setEncoding('utf8');
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('GET BODY', body2);
      });
    });
    req2.end();
  });
});

req.on('error', e => console.error('ERROR', e.message));
req.write(payload);
req.end();
