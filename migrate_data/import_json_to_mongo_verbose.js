// migrate_data/import_json_to_mongo_verbose.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'server', '.env') });

const User = require('../server/models/User');
const Case = require('../server/models/Case');
const Message = require('../server/models/Message');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/nyaysathi';

async function safeReadJSON(p) {
  if (!fs.existsSync(p)) {
    console.log('File not found:', p);
    return null;
  }
  try {
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    console.error('Failed to parse JSON', p, e.message);
    return null;
  }
}

async function run() {
  console.log('Connecting to Mongo:', MONGO);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo');

  const base = path.resolve(__dirname, '..'); // repo root
  const clientsPath = path.join(base, 'clients.json');
  const lawyersPath = path.join(base, 'lawyers.json');
  const casesPath = path.join(base, 'cases.json');
  const messagesPath = path.join(base, 'messages.json');

  const clients = await safeReadJSON(clientsPath);
  const lawyers = await safeReadJSON(lawyersPath);
  const cases = await safeReadJSON(casesPath);
  const messages = await safeReadJSON(messagesPath);

  if (clients && clients.length) {
    console.log('Importing clients:', clients.length);
    for (const c of clients) {
      try {
        await User.updateOne(
          { phone: c.phone },
          { $set: {
              role: 'client',
              name: c.name || '',
              phone: c.phone,
              headline: c.headline || '',
              bio: c.bio || '',
              location: c.location || '',
              createdAt: c.created_at ? new Date(c.created_at) : new Date()
            } },
          { upsert: true }
        );
      } catch (e) {
        console.error('Error importing client', c.phone, e.message);
      }
    }
  } else {
    console.log('No clients to import');
  }

  if (lawyers && lawyers.length) {
    console.log('Importing lawyers:', lawyers.length);
    for (const l of lawyers) {
      try {
        await User.updateOne(
          { phone: l.phone },
          { $set: {
              role: 'lawyer',
              name: l.name || '',
              phone: l.phone,
              headline: l.headline || '',
              bio: l.bio || '',
              location: l.location || '',
              experience: l.experience || 0,
              fields: l.fields || [],
              createdAt: l.created_at ? new Date(l.created_at) : new Date()
            } },
          { upsert: true }
        );
      } catch (e) {
        console.error('Error importing lawyer', l.phone, e.message);
      }
    }
  } else {
    console.log('No lawyers to import');
  }

  if (cases && cases.length) {
    console.log('Importing cases:', cases.length);
    for (const cs of cases) {
      try {
        await Case.updateOne(
          { title: cs.title, postedBy: cs.posted_by || 'legacy' },
          { $set: {
              title: cs.title,
              desc: cs.desc || '',
              field: cs.field || '',
              location: cs.location || '',
              budget: cs.budget || '',
              postedBy: cs.posted_by || 'legacy',
              postedAt: cs.posted_at ? new Date(cs.posted_at) : new Date(),
              acceptedBy: cs.accepted_by || null
            } },
          { upsert: true }
        );
      } catch (e) {
        console.error('Error importing case', cs.title, e.message);
      }
    }
  } else {
    console.log('No cases to import');
  }

  if (messages && messages.length) {
    console.log('Importing messages:', messages.length);
    for (const m of messages) {
      try {
        await Message.create({
          sender: m.sender,
          recipient: m.recipient,
          text: m.text,
          ts: m.ts ? new Date(m.ts) : new Date()
        });
      } catch (e) {
        console.error('Error importing message', JSON.stringify(m).slice(0,80), e.message);
      }
    }
  } else {
    console.log('No messages to import');
  }

  console.log('Import finished. Closing connection.');
  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

run().catch(err => {
  console.error('Fatal migration error:', err && err.stack ? err.stack : err);
  process.exit(1);
});
