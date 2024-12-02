// controllers/hoots.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Hoot = require('../models/hoots.js');
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);
//! put the routes that need rotection underneath

//! GET - /hoots
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

//! GET - /hoots
router.get('/', async (req, res) => {
    try {
      const hoots = await Hoot.find({})
        .populate('author')
        .sort({ createdAt: 'desc' });
      res.status(200).json(hoots);
    } catch (error) {
      res.status(500).json(error);
    }
});

//! GET - /hoots/:hootId
router.get('/:hootId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId).populate('author');
      res.status(200).json(hoot);
    } catch (error) {
      res.status(500).json(error);
    }
  });

//! PUT - /hoots/:hootId
router.put('/:hootId', async (req, res) => {
  try {
    // Find the hoot:
    const hoot = await Hoot.findById(req.params.hootId);

    // Check if the logged in user is the owner of the hoot
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    // Update and return the newhoot:
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );

    // Append req.user to the author property:
    updatedHoot._doc.author = req.user;

    // return JSON response:
    res.status(200).json(updatedHoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

//! DELETE - /hoots/:hootId
router.delete('/:hootId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
  
      if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
      res.status(200).json(deletedHoot);
    } catch (error) {
      res.status(500).json(error);
    }
  });

//! POST - /hoots/:hootId/comments
router.post('/:hootId/comments', async (req, res) => {
    try {
        // get the loggedin user
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.hootId);
        // add comments to comment array
        hoot.comments.push(req.body);
        //save the change
        await hoot.save();
    
        // Find the newly created comment so that React can update the new one immediately
        const newComment = hoot.comments[hoot.comments.length - 1];

        // populate the author for it
        newComment._doc.author = req.user;
    
        // send it to front end, Respond with the newComment:
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json(error);
    }
  });


module.exports = router;
