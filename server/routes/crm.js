const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const User = require('../models/User');
const Event = require('../models/Event');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Post = require('../models/Post');

// GET /api/crm/insights?userId=xyz
router.get('/insights', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "UserId required" });

        // 1. Fetch Core Data
        const cases = await Case.find({
            $or: [{ lawyer: userId }, { acceptedBy: userId }] // Handle both schema styles
        }).populate('client', 'name');

        const appointments = await Appointment.find({ lawyerId: userId, status: 'confirmed' });
        const events = await Event.find({ lawyer: userId });

        // 2. Calculate Workload
        const activeCasesCount = cases.filter(c => c.stage !== 'Closed').length;
        const upcomingHearings = events.filter(e => e.type === 'hearing' && new Date(e.start) > new Date()).length;

        let workloadStatus = 'Light';
        if (activeCasesCount > 5) workloadStatus = 'Balanced';
        if (activeCasesCount > 15) workloadStatus = 'Overloaded';

        // 3. Case Health Logic & Next Actions
        const caseInsights = cases.map(c => {
            const daysSinceUpdate = Math.floor((new Date() - new Date(c.updatedAt)) / (1000 * 60 * 60 * 24));
            let health = 100;
            const healthIssues = [];
            let nextAction = "Monitor case";

            if (daysSinceUpdate > 7) {
                health -= 10;
                healthIssues.push("No activity for 7+ days");
                nextAction = "Follow up with client";
            }
            if (!c.timeline || c.timeline.length < 2) {
                health -= 5;
                healthIssues.push("Timeline incomplete");
                nextAction = "Update case stage";
            }

            return {
                caseId: c._id,
                title: c.title,
                clientName: c.client?.name || "Client",
                health: Math.max(0, health),
                healthIssues,
                nextAction,
                lastUpdate: c.updatedAt
            };
        }).sort((a, b) => a.health - b.health); // Lowest health first

        // 4. Unified Activity Feed construction
        // Fetch recent items
        const posts = await Post.find().sort({ createdAt: -1 }).limit(5); // Community posts

        const feed = [
            ...posts.map(p => ({
                id: p._id,
                type: 'community',
                category: 'Community',
                title: `New post by ${p.authorName || 'User'}`,
                desc: p.content.substring(0, 50),
                date: p.createdAt,
                icon: '💬'
            })),
            ...events.map(e => ({
                id: e._id,
                type: 'event',
                category: 'Calendar',
                title: e.title,
                desc: `Scheduled for ${new Date(e.start).toLocaleDateString()}`,
                date: e.createdAt || e.start, // Fallback
                icon: '📅'
            })),
            ...cases.map(c => ({
                id: c._id,
                type: 'case',
                category: 'Case Update',
                title: `Updated: ${c.title}`,
                desc: `Stage is now ${c.stage}`,
                date: c.updatedAt,
                icon: '⚖️'
            }))
        ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20);

        // 4. Performance Analytics (Last 6 Weeks)
        const performance = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const start = new Date(today);
            start.setDate(today.getDate() - (i * 7) - 6);
            start.setHours(0, 0, 0, 0);

            const end = new Date(today);
            end.setDate(today.getDate() - (i * 7));
            end.setHours(23, 59, 59, 999);

            // Count Leads (Cases created in this week)
            const leadsCount = cases.filter(c => {
                const d = new Date(c.postedAt);
                return d >= start && d <= end;
            }).length;

            // Count Revenue (Invoices paid in this week)
            // Note: Invoices usually linked to Lawyer, ensuring 'invoices' var is fetched if not present above
            const weeklyInvoices = await Invoice.find({
                lawyerId: userId,
                date: { $gte: start, $lte: end },
                status: 'paid'
            });
            const revenue = weeklyInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

            performance.push({
                name: `W${6 - i}`,
                revenue: revenue,
                leads: leadsCount
            });
        }

        res.json({
            workload: {
                status: workloadStatus,
                activeCases: activeCasesCount,
                upcomingHearings
            },
            caseInsights: caseInsights.slice(0, 5),
            analytics: performance, // New Real Data
            activityFeed: feed
        });

    } catch (err) {
        console.error("CRM Insights Error:", err);
        res.status(500).json({ error: "Failed to generate insights" });
    }
});

module.exports = router;
