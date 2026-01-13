const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB Connected for Seeding");
  seedLawyers();
}).catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});

const mockLawyers = [
  // --- MUMBAI (Criminal & Corporate) ---
  {
    name: "Satish Maneshinde",
    email: "satish.m@nyaysathi.com",
    password: "password123", // Use hash in real app or middleware handles it
    role: "lawyer",
    specialization: "Criminal",
    experience: 35,
    location: { city: "Mumbai", lat: 19.0760, lng: 72.8777 },
    bio: "Senior Advocate at Bombay High Court. Renowned for handling high-profile criminal cases, including celebrity defense and complex narcotics matters. Expert in trial strategy and evidence management.",
    headline: "Senior Criminal Advocate | Expert in High-Profile Defense",
    courts: ["Bombay High Court", "Supreme Court of India"],
    languages: ["English", "Hindi", "Marathi"],
    education: [
      { degree: "LLB", college: "Government Law College, Mumbai", year: "1988" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 4.9,
      reviews: 128,
      consultations: 540,
      profileViews: 12500
    },
    availability: ["Mon-Fri", "10:00 AM - 6:00 PM"],
    consultationFee: 15000,
    phone: "9820098200"
  },
  {
    name: "Amit Desai",
    email: "amit.desai@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Criminal",
    experience: 30,
    location: { city: "Mumbai", lat: 18.9220, lng: 72.8347 }, // South Bombay
    bio: "Designated Senior Advocate specializing in White Collar Crimes, Economic Offenses, and Corporate Fraud. Known for meticulous legal research and strategic defense in the Supreme Court.",
    headline: "Senior Advocate | White Collar Crime & Economic Offenses",
    courts: ["Supreme Court of India", "Bombay High Court"],
    languages: ["English", "Hindi", "Gujarati"],
    education: [
      { degree: "LLM", college: "University of Mumbai", year: "1992" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 4.8,
      reviews: 95,
      consultations: 320,
      profileViews: 8900
    },
    availability: ["Tue-Thu", "2:00 PM - 7:00 PM"],
    consultationFee: 20000,
    phone: "9821198211"
  },
  {
    name: "Tripti Shetty",
    email: "tripti.s@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Corporate",
    experience: 18,
    location: { city: "Mumbai", lat: 19.1136, lng: 72.8697 }, // Andheri
    bio: "Founder of Tripti Shetty & Associates. Expert in Corporate Law, Mergers & Acquisitions, and Commercial Contracts. Assisting startups and established firms in navigating India's legal landscape.",
    headline: "Corporate Law Expert | M&A and Commercial Contracts",
    courts: ["Bombay High Court", "NCLT"],
    languages: ["English", "Hindi", "Kannada"],
    education: [
      { degree: "LLB", college: "Symbiosis Law School", year: "2005" }
    ],
    verified: true,
    plan: "gold",
    isProfileComplete: true,
    stats: {
      rating: 4.7,
      reviews: 62,
      consultations: 210,
      profileViews: 5400
    },
    availability: ["Mon-Sat", "9:00 AM - 5:00 PM"],
    consultationFee: 5000,
    phone: "9833398333"
  },

  // --- DELHI (Civil & Constitutional) ---
  {
    name: "Harish Salve",
    email: "harish.s@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Constitutional",
    experience: 40,
    location: { city: "New Delhi", lat: 28.6139, lng: 77.2090 },
    bio: "Former Solicitor General of India. One of the most sought-after lawyers in the country, specializing in Constitutional Law, Commercial Litigation, and International Arbitration.",
    headline: "Senior Advocate | Constitutional & International Law",
    courts: ["Supreme Court of India", "International Court of Justice"],
    languages: ["English", "Hindi"],
    education: [
      { degree: "LLB", college: "Nagpur University", year: "1980" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 5.0,
      reviews: 215,
      consultations: 890,
      profileViews: 55000
    },
    availability: ["By Appointment Only"],
    consultationFee: 50000,
    phone: "9810098100"
  },
  {
    name: "Neha Mehta",
    email: "neha.m@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Civil",
    experience: 15,
    location: { city: "New Delhi", lat: 28.5355, lng: 77.3910 }, // Noida/Delhi NCR
    bio: "Civil Litigator with deep expertise in Property Disputes, Real Estate Contracts, and Family Partitions. Dedicated to resolving complex civil matters efficiently in Delhi NCR.",
    headline: "Civil Litigator | Property & Real Estate Expert",
    courts: ["Delhi High Court", "Saket District Court"],
    languages: ["English", "Hindi", "Punjabi"],
    education: [
      { degree: "LLB", college: "Faculty of Law, Delhi University", year: "2008" }
    ],
    verified: true,
    plan: "gold",
    isProfileComplete: true,
    stats: {
      rating: 4.6,
      reviews: 45,
      consultations: 180,
      profileViews: 4200
    },
    availability: ["Mon-Fri", "11:00 AM - 6:00 PM"],
    consultationFee: 3000,
    phone: "9811198111"
  },
  {
    name: "Siddharth Luthra",
    email: "siddharth.l@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Criminal",
    experience: 28,
    location: { city: "New Delhi", lat: 28.5700, lng: 77.2300 }, // South Ext
    bio: "Senior Advocate and former ASG. Specializes in White Collar Crimes and Cyber Laws. Known for his articulate arguments and deep understanding of criminal jurisprudence.",
    headline: "Senior Advocate | Criminal Law & Cyber Crime",
    courts: ["Supreme Court of India", "Delhi High Court"],
    languages: ["English", "Hindi"],
    education: [
      { degree: "MPhil in Criminology", college: "Cambridge University", year: "1995" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 4.9,
      reviews: 110,
      consultations: 400,
      profileViews: 10500
    },
    availability: ["Mon-Fri", "4:00 PM - 8:00 PM"],
    consultationFee: 12000,
    phone: "9812298122"
  },

  // --- BANGALORE (IT/Corporate & Family) ---
  {
    name: "Srinivas Katta",
    email: "srinivas.k@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Corporate",
    experience: 22,
    location: { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
    bio: "Partner at IndusLaw. Expert in Private Equity, Venture Capital, and Startup Fundraising. Advising tech unicorns and investors on key transactions in India's silicon valley.",
    headline: "Corporate Lawyer | PE/VC & Startup Funding",
    courts: ["Karnataka High Court"],
    languages: ["English", "Kannada", "Telugu"],
    education: [
      { degree: "LLB", college: "NLSIU Bangalore", year: "2001" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 4.8,
      reviews: 78,
      consultations: 310,
      profileViews: 7800
    },
    availability: ["Mon-Fri", "9:00 AM - 6:00 PM"],
    consultationFee: 8000,
    phone: "9845098450"
  },
  {
    name: "Ayantika Mondal",
    email: "ayantika.m@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Corporate",
    experience: 12,
    location: { city: "Bangalore", lat: 12.9352, lng: 77.6245 }, // Koramangala
    bio: "Corporate Legal Advisor specializing in IP Rights, Tech Contracts, and Data Privacy. passionate about helping tech companies protect their innovations.",
    headline: "Tech Lawyer | IP Rights & Data Privacy",
    courts: ["Karnataka High Court"],
    languages: ["English", "Bengali", "Hindi"],
    education: [
      { degree: "LLM", college: "Christ University", year: "2012" }
    ],
    verified: true,
    plan: "gold",
    isProfileComplete: true,
    stats: {
      rating: 4.5,
      reviews: 35,
      consultations: 120,
      profileViews: 3200
    },
    availability: ["Mon-Sat", "10:00 AM - 7:00 PM"],
    consultationFee: 4000,
    phone: "9845598455"
  },
  {
    name: "Rajesh K.S.",
    email: "rajesh.ks@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Family",
    experience: 20,
    location: { city: "Bangalore", lat: 13.0098, lng: 77.5511 }, // Malleshwaram
    bio: "Experienced Family Court Advocate. Handling Divorce, Child Custody, and Domestic Violence cases with empathy and legal precision. Committed to securing fair outcomes for families.",
    headline: "Family Law Advocate | Divorce & Custody Expert",
    courts: ["Bangalore Family Court", "Karnataka High Court"],
    languages: ["English", "Kannada", "Tamil"],
    education: [
      { degree: "LLB", college: "Bangalore University", year: "2003" }
    ],
    verified: true,
    plan: "silver",
    isProfileComplete: true,
    stats: {
      rating: 4.6,
      reviews: 88,
      consultations: 450,
      profileViews: 6100
    },
    availability: ["Mon-Sat", "8:00 AM - 2:00 PM"],
    consultationFee: 2000,
    phone: "9844498444"
  },

  // --- HYDERABAD & CHENNAI (Mock Additions for Variety) ---
  {
    name: "Dr. Abhishek Singhvi",
    email: "abhishek.s@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Constitutional",
    experience: 38,
    location: { city: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    bio: "Senior Advocate Supreme Court. Expert in Corporate Commercial Litigation and Administrative Law. Known for articulate representation in landmark constitutional bench matters.",
    headline: "Senior Advocate | Constitutional & Commercial Litigation",
    courts: ["Supreme Court of India", "Telangana High Court"],
    languages: ["English", "Hindi"],
    education: [
      { degree: "PhD in Law", college: "Cambridge University", year: "1986" }
    ],
    verified: true,
    plan: "diamond",
    isProfileComplete: true,
    stats: {
      rating: 4.9,
      reviews: 156,
      consultations: 600,
      profileViews: 22000
    },
    availability: ["By Appointment"],
    consultationFee: 25000,
    phone: "9866698666"
  },
  {
    name: "Ruchi Kapoor",
    email: "ruchi.k@nyaysathi.com",
    password: "password123",
    role: "lawyer",
    specialization: "Family",
    experience: 14,
    location: { city: "Chennai", lat: 13.0827, lng: 80.2707 },
    bio: "Compassionate Family Lawyer specializing in Divorce, Alimony, and Restitution of Conjugal Rights. Helping clients navigate difficult personal transitions with legal strength.",
    headline: "Family Lawyer | Divorce & Domestic Harmony",
    courts: ["Chennai Family Court", "Madras High Court"],
    languages: ["English", "Hindi", "Tamil"],
    education: [
      { degree: "LLB", college: "Dr. Ambedkar Law University", year: "2010" }
    ],
    verified: true,
    plan: "gold",
    isProfileComplete: true,
    stats: {
      rating: 4.7,
      reviews: 52,
      consultations: 190,
      profileViews: 4500
    },
    availability: ["Mon-Fri", "10:00 AM - 5:00 PM"],
    consultationFee: 3500,
    phone: "9884498844"
  }
];

const seedLawyers = async () => {
  try {
    for (const lawyer of mockLawyers) {
      // Check if user exists
      const exists = await User.findOne({ email: lawyer.email });
      if (exists) {
        console.log(`⚠️ User ${lawyer.name} already exists. Skipping.`);
        continue;
      }

      // Create new user
      const newUser = new User(lawyer);
      await newUser.save();
      console.log(`✅ Created Lawyer: ${lawyer.name} (${lawyer.specialization}, ${lawyer.location.city})`);
    }
    console.log("🎉 Seeding Completed Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
};
