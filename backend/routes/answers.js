const express = require('express');
const databaseService = require('../data/database');

const router = express.Router();

// GET /api/answers/:id - Get specific answer with visualization
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await databaseService.getAnswerById(id);

    if (!answer) {
      return res.status(404).json({ 
        error: 'Answer not found' 
      });
    }

    res.json(answer);
  } catch (error) {
    console.error('Error fetching answer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch answer' 
    });
  }
});

module.exports = router;
