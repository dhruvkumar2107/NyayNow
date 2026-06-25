const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const BASE_URL = 'http://localhost:4000/api';
const CLIENT_PHONE = "9999999999";
const LAWYER_PHONE = "8888888888";

const log = (msg, type = 'info') => {
    const symbol = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${symbol} ${msg}`);
};

async function verifyInteraction() {
    console.log("\n🚀 VERIFYING INTERACTION FLOW (CLIENT <-> LAWYER) 🚀\n");

    try {
        // 1. CLIENT POSTS CASE
        log("Step 1: Client Posting Case...", 'info');
        const caseData = {
            title: "Verifiction Test Case",
            desc: "This is a test case to verify the marketplace flow.",
            location: "Test City",
            budget: "10000",
            postedBy: CLIENT_PHONE
        };

        const postRes = await axios.post(`${BASE_URL}/cases`, caseData);
        if (!postRes.data._id) throw new Error("Case Creation Failed");
        const caseId = postRes.data._id;
        log(`Case Created: ${caseId} by ${CLIENT_PHONE}`, 'success');

        // 2. LAWYER FETCHES LEADS
        log("Step 2: Lawyer Fetching Leads...", 'info');
        const leadsRes = await axios.get(`${BASE_URL}/cases?open=true`);
        const found = leadsRes.data.find(c => c._id === caseId);

        if (found) log("Lawyer found the new case in feed", 'success');
        else throw new Error("New case not appearing in open leads");

        // 3. LAWYER ACCEPTS LEAD
        log("Step 3: Lawyer Accepting Lead...", 'info');
        const acceptRes = await axios.post(`${BASE_URL}/cases/${caseId}/accept`, { lawyerPhone: LAWYER_PHONE });

        if (acceptRes.data.acceptedBy === LAWYER_PHONE) log("Case Accepted Successfully", 'success');
        else throw new Error("Case Acceptance Failed");

        // 4. CLIENT SEES UPDATE
        log("Step 4: Client Checking Status...", 'info');
        const myCasesRes = await axios.get(`${BASE_URL}/cases?postedBy=${CLIENT_PHONE}`);
        const myCase = myCasesRes.data.find(c => c._id === caseId);

        if (myCase.acceptedBy === LAWYER_PHONE) log("Client sees case as ACCEPTED by Lawyer", 'success');
        else throw new Error("Client dashboard not reflecting status change");

        console.log("\n✨ INTERACTION FLOW 100% WORKING ✨");

    } catch (err) {
        log(`VERIFICATION FAILED: ${err.message}`, 'error');
        if (err.response) console.log(err.response.data);
    }
}

verifyInteraction();
