// controllers/hoots.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Hoot = require('../models/hoots.js');
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);
//! put the routes that need rotection underneath
router.post('/', async (req, res) => {
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        console.log(hoot._doc)
        res.status(201).json(hoot);
    } catch(error) {
        console.log(error);
        res.status(500).json(error);
    }
});

module.exports = router;
