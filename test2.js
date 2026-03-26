const https = require('https');

function makeRequest(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'nyaysathi-main.onrender.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', e => reject(e));
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log("Testing POST /api/payments/create-order without auth...");
    // If it returns 403, we know it reached the server AND verifyToken blocked it
    // If it returns 400, verifyToken is disabled or different!
    let res = await makeRequest('/api/payments/create-order', { amount_rupees: 499, plan: "Pro" });
    console.log("Response:", res.status, res.body);
  } catch (e) {
    console.error("Failed:", e);
  }
})();
