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
        email: user.email,
        specialization: user.specialization,
        location: user.location?.city || "Unknown",
        experience: user.experience || 0,
        hourlyRate: user.consultationFee || 0,
        languages: user.languages || [],
        rating: user.stats?.rating || 0,
        verified: user.verified || false,
        image: user.profileImage || null
    };

    try {
        await lawyersIndex.saveObject(record);
        // console.log(`[Algolia] Synced Lawyer: ${user.name}`);
    } catch (err) {
        console.error(`[Algolia] Sync Failed for ${user.name}:`, err.message);
    }
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

    try {
        await leadsIndex.saveObject(record);
        // console.log(`[Algolia] Synced Lead: ${lead.title}`);
    } catch (err) {
        console.error(`[Algolia] Sync Failed for Lead ${lead.title}:`, err.message);
    }
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
