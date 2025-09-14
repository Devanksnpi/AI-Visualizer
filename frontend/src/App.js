import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatBox from './components/ChatBox';
import VisualizationCanvas from './components/VisualizationCanvas';
import Controls from './components/Controls';
import Sidebar from './components/Sidebar';
import ResizableLayout from './components/ResizableLayout';
import { useSSE } from './hooks/useSSE';
import sessionService from './services/sessionService';

const VisualizationContainer = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
`;

const ControlsContainer = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
`;

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // SSE hook for real-time updates
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const { data: sseData } = useSSE(`${API_BASE_URL}/stream`);

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    if (sseData) {
      if (sseData.type === 'question_created') {
        setQuestions(prev => [...prev, sseData.question]);
      } else if (sseData.type === 'answer_created') {
        setCurrentAnswer(sseData.answer);
        
        // Update the questions array with the answer
        setQuestions(prev => prev.map(q => 
          q.id === sseData.answer.questionId 
            ? { ...q, answer: sseData.answer }
            : q
        ));
        
        // Auto-play new visualizations
        setIsPlaying(true);
      }
    }
  }, [sseData]);

  const loadChatSessions = async () => {
    try {
      const sessions = await sessionService.getChatSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const handleQuestionSubmit = async (question) => {
    setIsLoading(true);
    try {
      const result = await sessionService.submitQuestion(currentSessionId, question);
      console.log('Question submitted:', result);
      
      // Update current session ID if it was created
      if (result.sessionId && !currentSessionId) {
        setCurrentSessionId(result.sessionId);
        loadChatSessions(); // Refresh sessions list
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
  };

  const handleNewChat = async () => {
    try {
      const newSession = await sessionService.createChatSession('New Chat');
      setCurrentSessionId(newSession.id);
      setQuestions([]);
      setCurrentAnswer(null);
      setCurrentTime(0);
      setIsPlaying(false);
      loadChatSessions(); // Refresh sessions list
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = async (sessionId) => {
    try {
      const session = await sessionService.getChatSession(sessionId);
      setCurrentSessionId(sessionId);
      setQuestions(session.questions || []);
      setCurrentAnswer(null);
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const handleSelectVisualization = (answerId) => {
    // Find the answer in the current questions
    const question = questions.find(q => q.answer && q.answer.id === answerId);
    if (question && question.answer) {
      setCurrentAnswer(question.answer);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleDeleteChat = async (sessionId) => {
    try {
      await sessionService.deleteChatSession(sessionId);
      
      // If the deleted session was the current one, clear the current state
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setQuestions([]);
        setCurrentAnswer(null);
        setCurrentTime(0);
        setIsPlaying(false);
      }
      
      // Refresh the sessions list
      loadChatSessions();
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  return (
    <ResizableLayout
      sidebar={
        <Sidebar
          chatSessions={chatSessions}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
          currentSessionId={currentSessionId}
        />
      }
      visualizationContent={
        <>
          <VisualizationContainer>
            <VisualizationCanvas
              visualization={currentAnswer?.visualization}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              onAnimationComplete={handleAnimationComplete}
              onSeek={handleSeek}
              visualizationTitle={currentAnswer?.text ? `Explanation for: ${currentAnswer.question}` : ''}
            />
          </VisualizationContainer>
          <ControlsContainer>
            <Controls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onRestart={handleRestart}
              currentTime={currentTime}
              duration={currentAnswer?.visualization?.duration || 0}
              onSeek={handleSeek}
            />
          </ControlsContainer>
        </>
      }
      chatContent={
        <ChatBox
          questions={questions}
          onQuestionSubmit={handleQuestionSubmit}
          onSelectVisualization={handleSelectVisualization}
          isLoading={isLoading}
        />
      }
      defaultVisualizationFlex={1.2}
      defaultChatFlex={0.8}
    />
  );
}

export default App;