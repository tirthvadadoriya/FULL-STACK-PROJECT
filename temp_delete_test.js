const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/blogs/1',
  method: 'DELETE'
}, res => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);
  });
});

req.on('error', err => {
  console.error('ERROR', err.message);
  process.exitCode = 1;
});
req.end();
