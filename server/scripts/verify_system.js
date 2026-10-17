const http = require('http');

function check(url, name) {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ ${name} [${res.statusCode}]: Working`);
                    resolve(true);
                } else {
                    console.log(`❌ ${name} [${res.statusCode}]: Failed - ${data}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log(`❌ ${name}: Connection Refused (${err.message})`);
            resolve(false);
        });
    });
}

async function verify() {
    console.log("--- System Connectivity Check ---");

    // 1. Check Health & DB (assumes healthz implies DB alive or we add a specific DB check)
    // Since we don't have a specific DB api yet, we check the backend root health
    await check('http://localhost:4000/healthz', 'Backend Health');

    // 2. Check AI (Proxied to Python)
    await post('/api/ai/assistant', { question: 'test' }, 'AI Assistant');
    await post('/api/ai/agreement', { text: 'test agreement' }, 'AI Agreement');
    await post('/api/ai/case-analysis', { text: 'test case' }, 'AI Case Analysis');

    // 3. Check Payments (Mocked)
    await post('/api/payments/create-link', { amount_rupees: 100, buyer_contact: '123', purpose: 'test' }, 'Payment Gateway');

    // 4. Check Lawyers
    await check('http://localhost:4000/api/lawyers', 'Lawyers API');

    console.log("---------------------------------");
}

function post(path, body, name) {
    return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ ${name} [${res.statusCode}]: Working`);
                    resolve(true);
                } else {
                    console.log(`❌ ${name} [${res.statusCode}]: Failed - ${responseBody}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${name}: Error (${error.message})`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

verify();
