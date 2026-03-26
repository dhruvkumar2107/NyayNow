const https = require('https');

function makeRequest(path, payload, token) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'nyaysathi-main.onrender.com', port: 443, path: path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'Authorization': `Bearer ${token}` }
    };
    const req = https.request(options, (res) => {
      let body = ''; res.on('data', d => body += d); res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.write(data); req.end();
  });
}

(async () => {
    const email = 'test' + Date.now() + '@nyaynow.in';
    let reg = await makeRequest('/api/auth/register', { name: 'Test', email, password: 'Password123!', role: 'client' });
    let token = JSON.parse(reg.body).token;

    console.log("Testing exact frontend bloated payload:");
    let payload = { amount_rupees: 499, amount: 499, price: 499, value: 499, plan: "Pro", planId: "Pro", planName: "Pro", name: "Pro" };
    let res = await makeRequest('/api/payments/create-order', payload, token);
    console.log(res.status, res.body);
})();
