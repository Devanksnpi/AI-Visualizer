import React from 'react';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaHistory, 
  FaBrain,
  FaTrash
} from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
`;

const LogoTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoSubtitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
`;

const NewChatButton = styled.button`
  margin: 24px 24px 0 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const HistoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding: 0 4px;
`;

const HistoryItemActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const HistoryItem = styled.div`
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#eff6ff' : 'transparent'};
  border: 1px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  position: relative;

  &:hover {
    background: ${props => props.active ? '#eff6ff' : '#f8fafc'};
    transform: translateX(4px);
    
    ${HistoryItemActions} {
      opacity: 1;
    }
  }
`;

const HistoryItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const HistoryItemTime = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const HistoryItemCount = styled.div`
  font-size: 11px;
  color: #3b82f6;
  margin-top: 2px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
`;

const EmptyText = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
  color: #1e293b;
`;

const EmptySubtext = styled.div`
  font-size: 12px;
  margin-top: 4px;
  color: #64748b;
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: ${props => props.danger ? '#ef4444' : '#f1f5f9'};
  color: ${props => props.danger ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.danger ? '#dc2626' : '#e2e8f0'};
    transform: scale(1.1);
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const DialogTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const DialogMessage = styled.p`
  margin: 0 0 20px 0;
  color: #64748b;
  line-height: 1.5;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DialogButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background: #ef4444;
    color: white;
    &:hover {
      background: #dc2626;
    }
  ` : `
    background: #f1f5f9;
    color: #64748b;
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const Sidebar = ({ 
  chatSessions = [], 
  onNewChat, 
  onChatSelect, 
  onDeleteChat,
  currentSessionId 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState(null);
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteClick = (e, session) => {
    e.stopPropagation(); // Prevent triggering the chat select
    setSessionToDelete(session);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (sessionToDelete && onDeleteChat) {
      try {
        await onDeleteChat(sessionToDelete.id);
        setShowDeleteDialog(false);
        setSessionToDelete(null);
      } catch (error) {
        console.error('Error deleting chat session:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSessionToDelete(null);
  };

  return (
    <SidebarContainer>
      <Logo>
        <LogoTitle>
          <FaBrain />
          AI Visualizer
        </LogoTitle>
        <LogoSubtitle>Smart Learning Assistant</LogoSubtitle>
      </Logo>

      <NewChatButton onClick={onNewChat}>
        <FaPlus />
        New Chat
      </NewChatButton>

      <ChatHistory>
        <HistoryTitle>Chat History</HistoryTitle>
        {chatSessions.length === 0 ? (
          <EmptyState>
            <FaHistory size={24} />
            <EmptyText>No chat history yet</EmptyText>
            <EmptySubtext>Start a new conversation to see it here</EmptySubtext>
          </EmptyState>
        ) : (
          chatSessions.map(session => (
            <HistoryItem
              key={session.id}
              active={currentSessionId === session.id}
              onClick={() => onChatSelect(session.id)}
            >
              <HistoryItemTitle>{session.title}</HistoryItemTitle>
              <HistoryItemTime>{formatTime(session.last_activity || session.created_at)}</HistoryItemTime>
              {session.question_count > 0 && (
                <HistoryItemCount>{session.question_count} questions</HistoryItemCount>
              )}
              <HistoryItemActions>
                <ActionButton
                  danger
                  onClick={(e) => handleDeleteClick(e, session)}
                  title="Delete chat"
                >
                  <FaTrash size={8} />
                </ActionButton>
              </HistoryItemActions>
            </HistoryItem>
          ))
        )}
      </ChatHistory>
      
      {showDeleteDialog && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>Delete Chat Session</DialogTitle>
            <DialogMessage>
              Are you sure you want to delete "{sessionToDelete?.title}"? This action cannot be undone and will remove all questions and answers in this chat.
            </DialogMessage>
            <DialogActions>
              <DialogButton onClick={handleDeleteCancel}>
                Cancel
              </DialogButton>
              <DialogButton primary onClick={handleDeleteConfirm}>
                Delete
              </DialogButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;