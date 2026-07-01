const mongoose = require('mongoose');
const User = require('../models/User');
const Payment = require('../models/Payment');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const LOG_PATH = path.join(__dirname, '../logs/ai_audit.log');

const mockQueries = [
  {
    endpoint: "/api/ai/assistant",
    method: "POST",
    requestBody: '{"question":"What is the punishment for theft under BNS 2024?","language":"English"}',
    responseBody: '{"answer":"Under Section 303 of the Bharatiya Nyaya Sanhita (BNS) 2024, theft is punishable with imprisonment up to three years or fine, or both. This corresponds to Section 379 of the old Indian Penal Code (IPC).","disclaimer":"AI legal info only."}'
  },
  {
    endpoint: "/api/ai/legal-research",
    method: "POST",
    requestBody: '{"query":"landlord tenant deposit refund dispute Bombay High Court","source":"All Indian Courts"}',
    responseBody: '{"cases":[{"name":"Rajesh vs Sudha (2023)","citation":"2023 SCC Online Bom 144","ratio":"Deposits must be refunded within 30 days of tenancy expiry."}]}'
  },
  {
    endpoint: "/api/ai/predict-outcome",
    method: "POST",
    requestBody: '{"caseTitle":"Eviction for Cheque Bounce","caseType":"Civil","caseDescription":"Tenant cheque bounced twice, unpaid rent for 6 months."}',
    responseBody: '{"win_probability":"85%","risk_level":"Low","confidence_percentage":"92%","strategy":["Send formal demand notice","File suit under Section 138 of NI Act"]}'
  },
  {
    endpoint: "/api/ai/draft-contract",
    method: "POST",
    requestBody: '{"type":"Rent Agreement","parties":"Amit (Landlord) & Sunil (Tenant)","terms":"Monthly rent Rs 15,000, 11 months duration"}',
    responseBody: '{"contract":"LEAVE AND LICENSE AGREEMENT... This agreement is made on this 1st day of July..."}'
  }
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/nyaynow";
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const clients = await User.find({ role: 'client' });
    if (clients.length === 0) {
      console.log("❌ No client users found to seed. Run generate_sample_data.js first.");
      process.exit(1);
    }

    console.log(`Found ${clients.length} clients. Seeding payments and plans...`);

    // Clean existing payments
    await Payment.deleteMany({});
    console.log("Cleared old payments.");

    // Ensure logs folder exists
    await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
    // Truncate/clear old logs
    await fs.writeFile(LOG_PATH, "");
    console.log("Cleared old AI audit logs.");

    const plans = ['pro', 'gold', 'firm', 'pro', 'gold'];
    const prices = [299, 799, 2999, 299, 799];

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const plan = plans[i % plans.length];
      const price = prices[i % prices.length];

      // Update plan
      client.plan = plan;
      await client.save();
      console.log(`Updated client ${client.name} plan to ${plan}`);

      // Seed 1 payment
      const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
      const paymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
      await Payment.create({
        orderId,
        paymentId,
        signature: 'mock_signature_data',
        user: client._id,
        amount: price,
        plan: plan,
        status: 'success',
        date: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)) // spread dates
      });
      console.log(`Created payment of ₹${price} for ${client.name}`);

      // Seed 2 mock AI logs for this user
      for (let j = 0; j < 2; j++) {
        const query = mockQueries[(i + j) % mockQueries.length];
        const logEntry = {
          timestamp: new Date(Date.now() - (i * 12 * 60 * 60 * 1000) - (j * 30 * 60 * 1000)).toISOString(),
          userId: client._id.toString(),
          endpoint: query.endpoint,
          method: query.method,
          requestBody: query.requestBody,
          responseStatus: 200,
          responseBody: query.responseBody,
          durationMs: 120 + Math.floor(Math.random() * 200)
        };
        await fs.appendFile(LOG_PATH, JSON.stringify(logEntry) + '\n');
      }
      console.log(`Appended 2 AI audit logs for ${client.name}`);
    }

    console.log("🎉 Seeding payments & activity logs completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
