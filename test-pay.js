const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testApi = async () => {
  try {
    const baseUrl = 'https://nyaysathi-main.onrender.com/api';
    
    console.log("Registering test user...");
    const email = 'test' + Date.now() + '@nyaynow.in';
    const regRes = await fetch(baseUrl + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'Password123!', role: 'client' })
    });
    
    const regData = await regRes.json();
    const token = regData.token;
    if (!token) {
      console.log('Reg failed:', regData);
      return;
    }
    console.log('Got token:', token.substring(0, 10) + '...');

    console.log("Testing POST /payments/create-order...");
    const orderRes = await fetch(baseUrl + '/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ amount_rupees: 499, amount: 499, plan: 'Pro' })
    });
    
    console.log('POST /create-order status:', orderRes.status);
    console.log('POST /create-order response:', await orderRes.text());
  } catch(e) {
    console.error("Error:", e);
  }
};
testApi();
