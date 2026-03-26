const https = require('https');

function makeRequest(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: 'nyaysathi-main.onrender.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: headers
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
    const email = 'test' + Date.now() + '@nyaynow.in';
    console.log("Registering...", email);
    
    let reg = await makeRequest('/api/auth/register', {
      name: 'Test', email, password: 'Password123!', role: 'client'
    });
    
    let token = '';
    try {
      token = JSON.parse(reg.body).token;
    } catch(e) {}
    
    if (!token) {
       console.log("Failed to register. Maybe try login?", reg.status, reg.body);
       return;
    }

    console.log("Token acquired! Testing payloads...");
    
    const tests = [
      { amount_rupees: 499, plan: "Pro" },
      { amount: 499, plan: "Pro" },
      { amount: "499", plan: "Pro" },
      { price: 499, plan: "Pro" },
      { amount_rupees: 499, planId: "Pro" },
      { amount: 499, plan: 499 },
      { amount: 499, plan: "499" },
      { plan: "Pro" }
    ];

    for (let test of tests) {
      console.log("Testing:", JSON.stringify(test));
      let res = await makeRequest('/api/payments/create-order', test, token);
      console.log("Result:", res.status, res.body);
      if (res.status === 200) {
        console.log("SUCCESS!!! The working payload is:", JSON.stringify(test));
      }
    }
    
  } catch (e) {
    console.error("Failed:", e);
  }
})();
