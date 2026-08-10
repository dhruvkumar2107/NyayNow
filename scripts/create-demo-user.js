// Demo User Creation Script
// Run on server with: node scripts/create-demo-user.js
// Creates a SINGLE demo user with access to BOTH client AND lawyer features

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../server/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaynow";

async function createDemoUsers() {
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ MongoDB connected");

        // SINGLE DEMO ACCOUNT - Can access BOTH client and lawyer features
        const demoEmail = "demo@nyaynow.in";
        const demoPassword = "Demo@12345"; // 10 chars, meets requirements
        
        // Check if demo user already exists
        let demoUser = await User.findOne({ email: demoEmail });
        
        if (demoUser) {
            console.log("📝 Demo user already exists, updating to full access...");
            demoUser.plan = "diamond";
            demoUser.verified = true;
            demoUser.verificationStatus = "verified";
            demoUser.credits = 99999;
            demoUser.aiUsage = { count: 0, firstUsedAt: null };
            demoUser.featureUsage = new Map();
            demoUser.role = "client"; // Base role - can switch to lawyer mode
            demoUser.name = "Demo Master";
            
            // Lawyer profile fields for firm features
            demoUser.specialization = "Corporate Law, M&A, Contracts, Litigation";
            demoUser.experience = 10;
            demoUser.location = {
                city: "Mumbai",
                state: "Maharashtra"
            };
            demoUser.barCouncilId = "MAH/9999/2014";
            demoUser.consultationFee = 5000;
            demoUser.availability = "Mon-Fri, 10am - 6pm";
            demoUser.languages = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Bengali"];
            demoUser.courts = ["Supreme Court", "Bombay High Court", "Delhi High Court", "NCLT", "NCLAT"];
            demoUser.education = [
                { degree: "LL.M. Corporate Law", college: "Government Law College, Mumbai", year: 2014 },
                { degree: "B.A. LL.B.", college: "ILS Law College, Pune", year: 2012 }
            ];
            demoUser.bio = "Senior Advocate with 10+ years experience in Corporate Law, Mergers & Acquisitions, Commercial Contracts, and Litigation. Former partner at top-tier law firm. DEMO ACCOUNT - Full access to all client & lawyer features.";
            demoUser.listingTier = "premium";
            demoUser.isFeatured = true;
            demoUser.isProfileComplete = true;
            demoUser.settings = {
                notifications: { email: true, push: true, marketing: false },
                privacy: { profileVisible: true, showStatus: true },
                theme: "Dark"
            };
            
            await demoUser.save();
            console.log("✅ Updated existing demo user with full access");
        } else {
            const hashedPassword = await bcrypt.hash(demoPassword, 10);
            
            demoUser = await User.create({
                role: "client", // Base role - can access client features by default
                name: "Demo Master",
                email: demoEmail,
                password: hashedPassword,
                plan: "diamond", // Highest plan - unlimited everything
                verified: true,
                verificationStatus: "verified",
                credits: 99999,
                aiUsage: { count: 0, firstUsedAt: null },
                featureUsage: new Map(),
                phone: "+91-9999999999",
                location: {
                    city: "Mumbai",
                    state: "Maharashtra"
                },
                languages: ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Bengali", "Telugu"],
                
                // ─── LAWYER PROFILE FIELDS (for firm/lawyer features) ─────
                specialization: "Corporate Law, M&A, Contracts, Litigation, IPR",
                experience: 10,
                barCouncilId: "MAH/9999/2014",
                idCardImage: "",
                consultationFee: 5000,
                availability: "Mon-Fri, 10am - 6pm",
                courts: ["Supreme Court", "Bombay High Court", "Delhi High Court", "NCLT", "NCLAT"],
                education: [
                    { degree: "LL.M. Corporate Law", college: "Government Law College, Mumbai", year: 2014 },
                    { degree: "B.A. LL.B.", college: "ILS Law College, Pune", year: 2012 }
                ],
                bio: "Senior Advocate with 10+ years experience in Corporate Law, Mergers & Acquisitions, Commercial Contracts, and Litigation. Former partner at top-tier law firm. DEMO ACCOUNT - Full access to all client & lawyer features.",
                listingTier: "premium",
                isFeatured: true,
                isProfileComplete: true,
                
                settings: {
                    notifications: { email: true, push: true, marketing: false },
                    privacy: { profileVisible: true, showStatus: true },
                    theme: "Dark"
                }
            });
            console.log("✅ Created demo master account with FULL ACCESS (Client + Lawyer features)");
        }

        console.log("\n🎉 ============ DEMO MASTER ACCOUNT READY ============");
        console.log("📧 SINGLE ACCOUNT FOR ALL DEMOS:");
        console.log(`   Email: ${demoEmail}`);
        console.log(`   Password: ${demoPassword}`);
        console.log("\n🔑 PLAN: DIAMOND (Unlimited everything)");
        console.log("👤 ROLE: Client (base) + Lawyer profile populated");
        console.log("\n✨ FEATURES ACCESSIBLE FROM THIS ONE ACCOUNT:");
        console.log("   ✅ CLIENT FEATURES:");
        console.log("      • AI Legal Assistant (Unlimited)");
        console.log("      • Legal Research / Precedent Search");
        console.log("      • Document Drafting (Notices, Agreements, Contracts)");
        console.log("      • Case Analysis (FIRAC, AI Chat)");
        console.log("      • Judge AI - Outcome Predictor");
        console.log("      • Devil's Advocate Mode");
        console.log("      • Courtroom Battle Simulator");
        console.log("      • Legal SOS");
        console.log("      • Find Lawyer / Marketplace");
        console.log("      • NyayVoice (Voice Search)");
        console.log("      • Nearby Radar Map");
        console.log("\n   ⚖️  LAWYER/FIRM FEATURES (via populated profile):");
        console.log("      • Lawyer Dashboard / ERP Cockpit");
        console.log("      • Client CRM & Lead Hub");
        console.log("      • Case Management & Calendar");
        console.log("      • Verified Premium Listing on Marketplace");
        console.log("      • Video Consultation & Chat");
        console.log("      • Invoice & Payment Tracking");
        console.log("      • Judge Profile Analyser");
        console.log("      • Moot Court / AI Judge");
        console.log("\n   👨‍💼 ADMIN FEATURES (if needed):");
        console.log("      • Can promote to admin role in DB if required");
        console.log("\n=====================================================");
        console.log("💡 HOW TO DEMO:");
        console.log("   1. Login as client → Show all client features");
        console.log("   2. Navigate to /lawyer/dashboard → Lawyer features work (profile populated)");
        console.log("   3. Marketplace → Your premium listing appears");
        console.log("   4. All paywalls bypassed (credits: 99999, diamond plan)");
        
    } catch (error) {
        console.error("❌ Error creating demo user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

createDemoUsers();