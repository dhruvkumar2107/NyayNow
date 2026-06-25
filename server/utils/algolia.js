const algoliasearch = require('algoliasearch');

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

let client;
let lawyersIndex;
let leadsIndex;

if (APP_ID && ADMIN_KEY) {
    try {
        client = algoliasearch(APP_ID, ADMIN_KEY);
        lawyersIndex = client.initIndex('lawyers');
        leadsIndex = client.initIndex('leads');
        console.log("✅ Algolia Connected");
    } catch (err) {
        console.error("❌ Algolia Connection Failed:", err.message);
    }
} else {
    console.warn("⚠️ Algolia Keys Missing. Search features will not work.");
}

/**
 * Syncs a Lawyer Profile to Algolia 'lawyers' index
 */
const syncLawyer = async (user) => {
    if (!lawyersIndex || user.role !== 'lawyer') return;

    const record = {
        objectID: user._id.toString(),
        name: user.name,
        // Email intentionally excluded from search index to protect PII
        specialization: user.specialization,
        location: user.location?.city || "Unknown",
        experience: user.experience || 0,
        hourlyRate: user.consultationFee || 0,
        languages: user.languages || [],
        verified: user.verified || false,
        image: user.profileImage || null
    };

    await lawyersIndex.saveObject(record);
};

/**
 * Syncs a Case Lead to Algolia 'leads' index
 */
const syncLead = async (lead) => {
    if (!leadsIndex) return;

    const record = {
        objectID: lead._id.toString(),
        title: lead.title,
        category: lead.category,
        location: lead.location,
        budget: lead.budget,
        postedAt: lead.postedAt,
        stage: lead.stage
    };

    // Let errors propagate so callers (post-save hooks) can log them
    await leadsIndex.saveObject(record);
};

/**
 * Removes a record from Algolia
 * @param {string} indexName - 'lawyers' or 'leads'
 * @param {string} objectID 
 */
const deleteRecord = async (indexName, objectID) => {
    if (!client) return;
    try {
        const index = client.initIndex(indexName);
        await index.deleteObject(objectID);
        // console.log(`[Algolia] Deleted ${objectID} from ${indexName}`);
    } catch (err) {
        console.error(`[Algolia] Delete Failed:`, err.message);
    }
};

module.exports = { syncLawyer, syncLead, deleteRecord };
