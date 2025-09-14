import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaUser, FaRobot, FaMicrophone, FaVolumeUp, FaStop, FaExclamationTriangle, FaPause, FaPlay } from 'react-icons/fa';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f8fafc;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-left: ${props => props.isUser ? '60px' : '0'};
  margin-right: ${props => props.isUser ? '0' : '60px'};
  position: relative;
`;

const MessageIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageText = styled.p`
  margin: 0;
  line-height: 1.6;
  color: #1e293b;
  font-size: 15px;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #3b82f6;
    border-color: #3b82f6;
  }

  ${props => props.active && `
    background: #dbeafe;
    color: #3b82f6;
    border-color: #3b82f6;
  `}
`;

const InputContainer = styled.div`
  padding: 24px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  background: #f8fafc;

  &:focus {
    border-color: #3b82f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const VoiceButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: ${props => props.isRecording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  };
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  color: #64748b;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin: 20px 0;
`;

const WelcomeTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const WelcomeText = styled.p`
  margin: 0 0 20px 0;
  font-size: 16px;
  line-height: 1.5;
`;

const ExampleQuestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const ExampleButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: #dbeafe;
    border-color: #3b82f6;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  margin: 0 60px 0 0;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  div {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const VoiceStatus = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.isRecording ? '#ef4444' : '#10b981'};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  animation: ${props => props.isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      transform: translateX(-50%) scale(1);
    }
    50% {
      transform: translateX(-50%) scale(1.05);
    }
  }
`;

const VoiceError = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #f59e0b;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

const VoiceTranscript = styled.div`
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  font-style: italic;
  z-index: 10;
  max-height: 40px;
  overflow: hidden;
`;

const TTSStatus = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const TTSControls = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const TTSButton = styled.button`
  padding: 4px 8px;
  background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#e2e8f0'};
    border-color: ${props => props.active ? '#2563eb' : '#cbd5e1'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatBox = ({ questions, onQuestionSubmit, onSelectVisualization, isLoading: externalLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Use the custom speech recognition hook
  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Use the custom text-to-speech hook
  const {
    isSpeaking,
    currentUtteranceId,
    isSupported: ttsSupported,
    error: ttsError,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [questions]);

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || externalLoading) return;

    const question = inputValue.trim();
    setInputValue('');
    resetTranscript();

    try {
      await onQuestionSubmit(question);
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSpeak = (text, messageId) => {
    if (!ttsSupported) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // If already speaking this message, stop it
    if (isSpeaking && currentUtteranceId === messageId) {
      stopSpeaking();
      return;
    }

    // Speak the text with the message ID
    speak(text, messageId);
  };

  const handlePauseResume = (messageId) => {
    if (isSpeaking && currentUtteranceId === messageId) {
      if (speechSynthesis.paused) {
        resumeSpeaking();
      } else {
        pauseSpeaking();
      }
    }
  };

  const handleExampleClick = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const exampleQuestions = [
    "Explain Newton's First Law of Motion",
    "How does photosynthesis work?",
    "Show me the solar system",
    "What is the water cycle?"
  ];

  return (
    <ChatContainer>
      <MessagesContainer>
        {questions.length === 0 ? (
          <WelcomeMessage>
            <WelcomeTitle>Welcome to AI Visualizer! 🧠</WelcomeTitle>
            <WelcomeText>
              Ask me anything about science, physics, or any concept you'd like to understand with interactive visualizations.
            </WelcomeText>
            <ExampleQuestions>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                Try these examples:
              </div>
              {exampleQuestions.map((question, index) => (
                <ExampleButton
                  key={index}
                  onClick={() => handleExampleClick(question)}
                >
                  {question}
                </ExampleButton>
              ))}
            </ExampleQuestions>
          </WelcomeMessage>
        ) : (
          questions.map((q, index) => (
            <div key={index}>
              <Message isUser={true}>
                <MessageIcon isUser={true}>
                  <FaUser size={16} />
                </MessageIcon>
                <MessageContent>
                  <MessageText>{q.question}</MessageText>
                </MessageContent>
              </Message>
              
              {q.answer && (
                <Message isUser={false}>
                  <MessageIcon isUser={false}>
                    <FaRobot size={16} />
                  </MessageIcon>
                  <MessageContent>
                    <MessageText>{q.answer.text}</MessageText>
                    <MessageActions>
                      <ActionButton
                        onClick={() => onSelectVisualization(q.answer.id)}
                        title="View visualization"
                      >
                        View Animation
                      </ActionButton>
                      {ttsSupported && (
                        <>
                          <ActionButton
                            onClick={() => handleSpeak(q.answer.text, q.id)}
                            active={isSpeaking && currentUtteranceId === q.id}
                            title={isSpeaking && currentUtteranceId === q.id ? "Stop reading" : "Read aloud"}
                          >
                            {isSpeaking && currentUtteranceId === q.id ? (
                              <>
                                <FaStop size={12} />
                                Stop
                              </>
                            ) : (
                              <>
                                <FaVolumeUp size={12} />
                                Listen
                              </>
                            )}
                          </ActionButton>
                          {isSpeaking && currentUtteranceId === q.id && (
                            <ActionButton
                              onClick={() => handlePauseResume(q.id)}
                              title={speechSynthesis.paused ? "Resume reading" : "Pause reading"}
                            >
                              {speechSynthesis.paused ? (
                                <>
                                  <FaPlay size={12} />
                                  Resume
                                </>
                              ) : (
                                <>
                                  <FaPause size={12} />
                                  Pause
                                </>
                              )}
                            </ActionButton>
                          )}
                        </>
                      )}
                    </MessageActions>
                  </MessageContent>
                </Message>
              )}
            </div>
          ))
        )}
        {externalLoading && (
          <LoadingMessage>
            <MessageIcon isUser={false}>
              <FaRobot size={16} />
            </MessageIcon>
            <MessageContent>
              <MessageText>Thinking and creating visualization...</MessageText>
              <LoadingDots>
                <div></div>
                <div></div>
                <div></div>
              </LoadingDots>
            </MessageContent>
          </LoadingMessage>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <form onSubmit={handleSubmit}>
          <InputWrapper style={{ position: 'relative' }}>
            {isListening && (
              <VoiceStatus isRecording={true}>
                <FaMicrophone size={12} />
                Listening...
              </VoiceStatus>
            )}
            {speechError && (
              <VoiceError>
                <FaExclamationTriangle size={12} />
                {speechError}
              </VoiceError>
            )}
            {transcript && !isListening && (
              <VoiceTranscript>
                "{transcript}"
              </VoiceTranscript>
            )}
            {isSpeaking && (
              <TTSStatus>
                <FaVolumeUp size={10} />
                Reading aloud...
              </TTSStatus>
            )}
            {ttsError && (
              <VoiceError>
                <FaExclamationTriangle size={12} />
                {ttsError}
              </VoiceError>
            )}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask me anything about science, physics, or any concept..."}
              disabled={externalLoading}
              rows={1}
            />
            <ButtonGroup>
              <VoiceButton
                type="button"
                onClick={handleVoiceInput}
                isRecording={isListening}
                disabled={externalLoading || !speechSupported}
                title={isListening ? "Stop recording" : speechSupported ? "Start voice input" : "Voice input not supported"}
              >
                {isListening ? <FaStop size={16} /> : <FaMicrophone size={16} />}
              </VoiceButton>
              {isSpeaking && (
                <VoiceButton
                  type="button"
                  onClick={stopSpeaking}
                  isRecording={false}
                  disabled={false}
                  title="Stop all speech"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                >
                  <FaStop size={16} />
                </VoiceButton>
              )}
              <SendButton 
                type="submit" 
                disabled={!inputValue.trim() || externalLoading}
                title="Send message"
              >
                <FaPaperPlane size={16} />
              </SendButton>
            </ButtonGroup>
          </InputWrapper>
        </form>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatBox;