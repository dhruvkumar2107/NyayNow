// Demo User Creation Script
// Run on server with: node scripts/create-demo-user.js
// Creates a demo user with gold/diamond plan for feature demonstration

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

        // Demo Client User - Gold Plan (full access to all client features)
        const clientEmail = "demo@nyaynow.in";
        const clientPassword = "Demo@12345"; // 10 chars, meets requirements
        
        // Check if demo client already exists
        let demoClient = await User.findOne({ email: clientEmail });
        
        if (demoClient) {
            console.log("📝 Demo client already exists, updating to gold plan...");
            demoClient.plan = "diamond";
            demoClient.verified = true;
            demoClient.verificationStatus = "verified";
            demoClient.credits = 9999;
            demoClient.aiUsage = { count: 0, firstUsedAt: null };
            demoClient.featureUsage = new Map();
            demoClient.name = "Demo Client";
            await demoClient.save();
        } else {
            const hashedPassword = await bcrypt.hash(clientPassword, 10);
            
            demoClient = await User.create({
                role: "client",
                name: "Demo Client",
                email: clientEmail,
                password: hashedPassword,
                plan: "diamond",
                verified: true,
                verificationStatus: "verified",
                credits: 9999,
                aiUsage: { count: 0, firstUsedAt: null },
                featureUsage: new Map(),
                phone: "+91-9999999999",
                location: {
                    city: "New Delhi",
                    state: "Delhi"
                },
                languages: ["English", "Hindi", "Tamil", "Bengali"],
                isProfileComplete: true,
                settings: {
                    notifications: { email: true, push: true, marketing: false },
                    privacy: { profileVisible: true, showStatus: true },
                    theme: "Dark"
                }
            });
            console.log("✅ Created demo client with diamond plan");
        }

        // Demo Lawyer User - Firm Plan (full access to all lawyer features)
        const lawyerEmail = "lawyer-demo@nyaynow.in";
        const lawyerPassword = "Lawyer@12345";
        
        let demoLawyer = await User.findOne({ email: lawyerEmail });
        
        if (demoLawyer) {
            console.log("📝 Demo lawyer already exists, updating to firm plan...");
            demoLawyer.plan = "firm";
            demoLawyer.verified = true;
            demoLawyer.verificationStatus = "verified";
            demoLawyer.credits = 9999;
            demoLawyer.listingTier = "premium";
            demoLawyer.isFeatured = true;
            await demoLawyer.save();
        } else {
            const hashedPassword = await bcrypt.hash(lawyerPassword, 10);
            
            demoLawyer = await User.create({
                role: "lawyer",
                name: "Advocate Demo Lawyer",
                email: lawyerEmail,
                password: hashedPassword,
                plan: "firm",
                verified: true,
                verificationStatus: "verified",
                credits: 9999,
                specialization: "Corporate Law, M&A, Contracts",
                experience: 10,
                location: {
                    city: "Mumbai",
                    state: "Maharashtra"
                },
                barCouncilId: "MAH/9999/2014",
                consultationFee: 5000,
                availability: "Mon-Fri, 10am - 6pm",
                languages: ["English", "Hindi", "Marathi", "Gujarati"],
                courts: ["Supreme Court", "Bombay High Court", "NCLT"],
                education: [
                    { degree: "LL.M. Corporate Law", college: "Government Law College, Mumbai", year: 2014 },
                    { degree: "B.A. LL.B.", college: "ILS Law College, Pune", year: 2012 }
                ],
                bio: "Senior Advocate with 10+ years experience in Corporate Law, Mergers & Acquisitions, and Commercial Contracts. Former associate at top-tier law firm.",
                listingTier: "premium",
                isFeatured: true,
                isProfileComplete: true,
                settings: {
                    notifications: { email: true, push: true, marketing: false },
                    privacy: { profileVisible: true, showStatus: true },
                    theme: "Dark"
                }
            });
            console.log("✅ Created demo lawyer with firm plan");
        }

        // Demo Admin User
        const adminEmail = "admin@nyaynow.in";
        const adminPassword = "Admin@12345";
        
        let demoAdmin = await User.findOne({ email: adminEmail });
        
        if (demoAdmin) {
            console.log("📝 Demo admin already exists...");
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            demoAdmin = await User.create({
                role: "admin",
                name: "NyayNow Admin",
                email: adminEmail,
                password: hashedPassword,
                plan: "diamond",
                verified: true,
                verificationStatus: "verified",
                credits: 99999,
                isProfileComplete: true,
                settings: {
                    notifications: { email: true, push: true, marketing: true },
                    privacy: { profileVisible: true, showStatus: true },
                    theme: "Dark"
                }
            });
            console.log("✅ Created demo admin");
        }

        console.log("\n🎉 ============ DEMO ACCOUNTS READY ============");
        console.log("📧 DEMO CLIENT (Gold/Diamond Plan - All Client Features):");
        console.log(`   Email: ${clientEmail}`);
        console.log(`   Password: ${clientPassword}`);
        console.log("\n⚖️  DEMO LAWYER (Firm Plan - All Lawyer Features):");
        console.log(`   Email: ${lawyerEmail}`);
        console.log(`   Password: ${lawyerPassword}`);
        console.log("\n👨‍💼 DEMO ADMIN (Full Admin Access):");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log("\n===============================================");
        console.log("✨ All accounts have unlimited credits and feature access!");
        
    } catch (error) {
        console.error("❌ Error creating demo users:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

createDemoUsers();