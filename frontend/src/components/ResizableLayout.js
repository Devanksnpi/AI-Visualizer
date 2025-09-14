import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaGripVertical, FaBars, FaTimes } from 'react-icons/fa';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContainer = styled.div`
  width: ${props => props.isCollapsed ? '0px' : '280px'};
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  @media (max-width: 768px) {
    width: ${props => props.isCollapsed ? '0px' : '240px'};
    position: ${props => props.isCollapsed ? 'relative' : 'absolute'};
    height: 100vh;
    z-index: 1001;
  }
  
  @media (max-width: 480px) {
    width: ${props => props.isCollapsed ? '0px' : '200px'};
  }
`;

const SidebarToggle = styled.button`
  position: fixed;
  top: 20px;
  left: ${props => props.isCollapsed ? '20px' : '300px'};
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #2563eb;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    left: ${props => props.isCollapsed ? '20px' : '260px'};
    width: 36px;
    height: 36px;
  }
  
  @media (max-width: 480px) {
    left: ${props => props.isCollapsed ? '20px' : '220px'};
    width: 32px;
    height: 32px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  transition: margin-left 0.3s ease;
  min-width: 0; /* Allow flex items to shrink below their content size */
`;

const ContentArea = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: ${props => props.visualizationFlex}fr auto ${props => props.chatFlex}fr;
  overflow: hidden;
  position: relative;
  min-height: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

const Panel = styled.div`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 200px;
  min-height: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-width: 150px;
  }
  
  @media (max-width: 480px) {
    min-width: 100px;
  }
`;

const VisualizationPanel = styled(Panel)`
  border-right: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const ChatPanel = styled(Panel)`
  /* No additional styling needed */
`;

const ResizeHandle = styled.div`
  background: #e2e8f0;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  grid-column: 2;
  grid-row: 1;
  width: 12px;
  min-width: 12px;
  z-index: 10;
  border-left: 1px solid #cbd5e1;
  border-right: 1px solid #cbd5e1;

  &:hover {
    background: #3b82f6;
    width: 16px;
    min-width: 16px;
    border-left: 1px solid #2563eb;
    border-right: 1px solid #2563eb;
  }

  &:active {
    background: #2563eb;
    width: 16px;
    min-width: 16px;
    border-left: 1px solid #1d4ed8;
    border-right: 1px solid #1d4ed8;
  }

  &:hover::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 30px;
    background: white;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ResizeIcon = styled.div`
  color: #94a3b8;
  font-size: 12px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  pointer-events: none;

  ${ResizeHandle}:hover & {
    opacity: 1;
    color: white;
  }
`;

const Header = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

const Title = styled.h1`
  color: #1e293b;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
    gap: 8px;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 8px 0 0 0;
  font-size: 16px;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin: 4px 0 0 0;
  }
`;

const ResizableLayout = ({ 
  sidebar, 
  visualizationContent, 
  chatContent,
  defaultVisualizationFlex = 1,
  defaultChatFlex = 1 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [visualizationFlex, setVisualizationFlex] = useState(defaultVisualizationFlex);
  const [chatFlex, setChatFlex] = useState(defaultChatFlex);
  const [isResizing, setIsResizing] = useState(false);
  
  const resizeHandleRef = useRef(null);
  const startXRef = useRef(0);
  const startVisualizationFlexRef = useRef(0);
  const startChatFlexRef = useRef(0);

  const handleMouseDown = (e) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    console.log('Resize handle clicked!', e.clientX, 'Button:', e.button);
    setIsResizing(true);
    startXRef.current = e.clientX;
    startVisualizationFlexRef.current = visualizationFlex;
    startChatFlexRef.current = chatFlex;
    
    // Global event listeners are handled by useEffect
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Removed unused handleMouseMove function

  const handleMouseUp = () => {
    console.log('Resize handle released!');
    setIsResizing(false);
    // Global event listeners are cleaned up by useEffect
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Resize handle touch started!', e.touches[0].clientX);
    setIsResizing(true);
    startXRef.current = e.touches[0].clientX;
    startVisualizationFlexRef.current = visualizationFlex;
    startChatFlexRef.current = chatFlex;
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (!isResizing) return;
    e.preventDefault();
    
    const deltaX = e.touches[0].clientX - startXRef.current;
    const containerWidth = window.innerWidth - (isSidebarCollapsed ? 0 : 280);
    const totalFlex = startVisualizationFlexRef.current + startChatFlexRef.current;
    const deltaFlex = (deltaX / containerWidth) * totalFlex;
    
    const newVisualizationFlex = Math.max(0.3, Math.min(4, startVisualizationFlexRef.current + deltaFlex));
    const newChatFlex = Math.max(0.3, Math.min(4, startChatFlexRef.current - deltaFlex));
    
    console.log('Touch resizing:', { deltaX, newVisualizationFlex, newChatFlex });
    setVisualizationFlex(newVisualizationFlex);
    setChatFlex(newChatFlex);
  };

  const handleTouchEnd = () => {
    console.log('Resize handle touch ended!');
    setIsResizing(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleOverlayClick = () => {
    setIsSidebarCollapsed(true);
  };

  // Reset flex values when sidebar toggles
  useEffect(() => {
    if (!isSidebarCollapsed) {
      setVisualizationFlex(defaultVisualizationFlex);
      setChatFlex(defaultChatFlex);
    }
  }, [isSidebarCollapsed, defaultVisualizationFlex, defaultChatFlex]);

  // Handle global mouse events for resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isResizing) return;
      
      // Only resize if left mouse button is pressed (buttons 1 = left button)
      if (e.buttons !== 1) {
        handleMouseUp();
        return;
      }
      
      const deltaX = e.clientX - startXRef.current;
      const containerWidth = window.innerWidth - (isSidebarCollapsed ? 0 : 280);
      const totalFlex = startVisualizationFlexRef.current + startChatFlexRef.current;
      const deltaFlex = (deltaX / containerWidth) * totalFlex;
      
      const newVisualizationFlex = Math.max(0.3, Math.min(4, startVisualizationFlexRef.current + deltaFlex));
      const newChatFlex = Math.max(0.3, Math.min(4, startChatFlexRef.current - deltaFlex));
      
      console.log('Global mouse move resizing:', { deltaX, newVisualizationFlex, newChatFlex, buttons: e.buttons });
      setVisualizationFlex(newVisualizationFlex);
      setChatFlex(newChatFlex);
    };

    const handleGlobalMouseUp = () => {
      if (isResizing) {
        console.log('Global mouse up - stopping resize');
        handleMouseUp();
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, isSidebarCollapsed]);

  return (
    <LayoutContainer>
      <Overlay show={!isSidebarCollapsed} onClick={handleOverlayClick} />
      
      <SidebarContainer isCollapsed={isSidebarCollapsed}>
        <SidebarToggle isCollapsed={isSidebarCollapsed} onClick={toggleSidebar}>
          {isSidebarCollapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
        </SidebarToggle>
        {!isSidebarCollapsed && sidebar}
      </SidebarContainer>
      
      <MainContent>
        <Header>
          <Title>
            <span>🧠</span>
            AI Visualizer
          </Title>
          <Subtitle>Interactive concept explanations with intelligent animations</Subtitle>
        </Header>
        
        <ContentArea 
          visualizationFlex={visualizationFlex}
          chatFlex={chatFlex}
        >
          <VisualizationPanel>
            {visualizationContent}
          </VisualizationPanel>
          
               <ResizeHandle 
                 ref={resizeHandleRef} 
                 onMouseDown={handleMouseDown}
                 onTouchStart={handleTouchStart}
                 onContextMenu={(e) => e.preventDefault()}
               >
                 <ResizeIcon>
                   <FaGripVertical />
                 </ResizeIcon>
               </ResizeHandle>
          
          <ChatPanel>
            {chatContent}
          </ChatPanel>
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default ResizableLayout;
