const express = require('express');
const router = express.Router();
const CustomerCount = require('../models/CustomerCount');
const { Op } = require('sequelize');

// Get customer count for today
router.get('/count', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
        let record = await CustomerCount.findOne({ where: { date: today } });

        if (!record) {
            // If no record found, create a new entry with count = 0
            record = await CustomerCount.create({ date: today, count: 0 });
        }

        res.json({ count: record.count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update customer count (increase or decrease)
router.post('/update', async (req, res) => {
    try {
        const { change } = req.body;
        const today = new Date().toISOString().split('T')[0];

        let record = await CustomerCount.findOne({ where: { date: today } });

        if (!record) {
            record = await CustomerCount.create({ date: today, count: 0 });
        }

        record.count += change;
        await record.save();

        res.json({ count: record.count });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
