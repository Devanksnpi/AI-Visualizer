const express = require('express');
const databaseService = require('../data/database');

const router = express.Router();

// Get all chat sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await databaseService.getChatSessions();
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Create a new chat session
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const session = await databaseService.createChatSession(title || 'New Chat');
    res.status(201).json({ session });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get a specific chat session with all questions and answers
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await databaseService.getChatSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Get all questions and answers for this session
    const questions = await databaseService.getQuestionsBySession(sessionId);
    
    res.json({ 
      session: { ...session, questions }
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
});

// Update chat session title
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const session = await databaseService.getChatSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    await databaseService.updateChatSession(sessionId, title);
    res.json({ message: 'Chat session updated successfully' });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({ error: 'Failed to update chat session' });
  }
});

// Delete a chat session
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const deleted = await databaseService.deleteChatSession(sessionId);
    if (!deleted) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

module.exports = router;
