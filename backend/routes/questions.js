const express = require('express');
const llmService = require('../services/llmService');
const manimService = require('../services/manimService');
const plotService = require('../services/plotService');
const svgService = require('../services/svgService');
const physicsService = require('../services/physicsService'); // New import
const { broadcastToClients } = require('../services/sseService');
const databaseService = require('../data/database');

const router = express.Router();

// POST /api/questions - Submit a new question
router.post('/', async (req, res) => {
  try {
    const { sessionId, question } = req.body;

    // Validate input
    if (!question) {
      return res.status(400).json({ 
        error: 'Question is required' 
      });
    }

    if (question.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Question cannot be empty' 
      });
    }

    let currentSessionId = sessionId;

    // If no sessionId provided, create a new session
    if (!sessionId) {
      const newSession = await databaseService.createChatSession('New Chat');
      currentSessionId = newSession.id;
    }

    // Create question in database
    const newQuestion = await databaseService.createQuestion(currentSessionId, question.trim());

    // Broadcast question creation
    broadcastToClients({
      type: 'question_created',
      question: newQuestion
    });

    // Generate answer using LLM
    try {
      const llmResponse = await llmService.generateAnswer(question);
      
      let visualizationData = llmResponse.visualization;
      
      // Process different visualization types
      if (llmResponse.visualization_type === 'manim' && llmResponse.manim_code) {
        try {
          console.log('🎬 Processing Manim code for question:', question);
          const manimResult = await manimService.generateAnimation(
            llmResponse.manim_code, 
            question.toLowerCase()
          );
          
          if (manimResult.success) {
            console.log('✅ Manim animation generated:', manimResult.videoUrl);
            visualizationData = {
              ...llmResponse.visualization,
              type: 'manim',
              videoUrl: manimResult.videoUrl,
              sessionId: manimResult.sessionId
            };
          } else {
            console.warn('⚠️  Manim generation failed, falling back to canvas:', manimResult.error);
            visualizationData = { ...llmResponse.visualization, type: 'canvas' };
          }
        } catch (manimError) {
          console.error('❌ Manim processing error:', manimError);
          visualizationData = { ...llmResponse.visualization, type: 'canvas' };
        }
      } else if (llmResponse.visualization_type === 'plot' && llmResponse.plot_code) {
        try {
          console.log('📊 Processing plot code for question:', question);
          const plotResult = await plotService.generatePlot(
            llmResponse.plot_code, 
            question.toLowerCase()
          );
          
          if (plotResult.success) {
            console.log('✅ Plot generated:', plotResult.imageUrl);
            visualizationData = {
              ...llmResponse.visualization,
              type: 'plot',
              imageUrl: plotResult.imageUrl,
              sessionId: plotResult.sessionId
            };
          } else {
            console.warn('⚠️  Plot generation failed, falling back to canvas:', plotResult.error);
            visualizationData = { ...llmResponse.visualization, type: 'canvas' };
          }
        } catch (plotError) {
          console.error('❌ Plot processing error:', plotError);
          visualizationData = { ...llmResponse.visualization, type: 'canvas' };
        }
      } else if (llmResponse.visualization_type === 'svg' && llmResponse.svg_code) {
        try {
          console.log('🎨 Processing SVG code for question:', question);
          const svgResult = await svgService.generateSvg(
            llmResponse.svg_code, 
            question.toLowerCase()
          );
          
          if (svgResult.success) {
            console.log('✅ SVG generated:', svgResult.svgUrl);
            visualizationData = {
              ...llmResponse.visualization,
              type: 'svg',
              svgUrl: svgResult.svgUrl,
              sessionId: svgResult.sessionId
            };
          } else {
            console.warn('⚠️  SVG generation failed, falling back to canvas:', svgResult.error);
            visualizationData = { ...llmResponse.visualization, type: 'canvas' };
          }
        } catch (svgError) {
          console.error('❌ SVG processing error:', svgError);
          visualizationData = { ...llmResponse.visualization, type: 'canvas' };
        }
      } else if (llmResponse.visualization_type === 'physics' && llmResponse.physics_code) {
        try {
          console.log('🔬 Processing physics simulation for question:', question);
          const physicsResult = await physicsService.generatePhysicsSimulation(
            llmResponse.physics_code, 
            question.toLowerCase()
          );
          
          if (physicsResult.success) {
            console.log('✅ Physics simulation generated:', physicsResult.simulationUrl);
            visualizationData = {
              ...llmResponse.visualization,
              type: 'physics',
              simulationUrl: physicsResult.simulationUrl,
              dataUrl: physicsResult.dataUrl,
              sessionId: physicsResult.sessionId
            };
          } else {
            console.warn('⚠️  Physics simulation failed, falling back to canvas:', physicsResult.error);
            visualizationData = { ...llmResponse.visualization, type: 'canvas' };
          }
        } catch (physicsError) {
          console.error('❌ Physics simulation error:', physicsError);
          visualizationData = { ...llmResponse.visualization, type: 'canvas' };
        }
      }
      
      // Create answer in database
      const newAnswer = await databaseService.createAnswer(
        newQuestion.id, 
        llmResponse.text, 
        visualizationData
      );

      // Broadcast answer creation
      broadcastToClients({
        type: 'answer_created',
        answer: newAnswer
      });

      res.json({
        questionId: newQuestion.id,
        answerId: newAnswer.id,
        sessionId: currentSessionId
      });

    } catch (llmError) {
      console.error('LLM Error:', llmError);
      
      // Create error answer
      const errorAnswer = await databaseService.createAnswer(
        newQuestion.id,
        "I'm sorry, I encountered an error while processing your question. Please try again.",
        null
      );

      broadcastToClients({
        type: 'answer_created',
        answer: errorAnswer
      });

      res.json({
        questionId: newQuestion.id,
        answerId: errorAnswer.id,
        sessionId: currentSessionId,
        error: true
      });
    }

  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ 
      error: 'Failed to process question',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/questions - Get questions for a specific session
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }

    const questions = await databaseService.getQuestionsBySession(sessionId);
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch questions' 
    });
  }
});

// GET /api/questions/:id - Get specific question
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await databaseService.getQuestionById(id);

    if (!question) {
      return res.status(404).json({ 
        error: 'Question not found' 
      });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ 
      error: 'Failed to fetch question' 
    });
  }
});

module.exports = router;
