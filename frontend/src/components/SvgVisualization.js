import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSpinner, FaDownload, FaExpand, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const SvgContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SvgWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  transform: scale(${props => props.scale});
  transform-origin: center;
  transition: transform 0.3s ease;
`;

const SvgElement = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 24px;
  z-index: 10;
`;

const ErrorOverlay = styled(LoadingOverlay)`
  background: rgba(254, 242, 242, 0.9);
  color: #dc2626;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${SvgContainer}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ZoomControls = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${SvgContainer}:hover & {
    opacity: 1;
  }
`;

const ZoomButton = styled(ControlButton)`
  padding: 6px;
  font-size: 12px;
`;

const SvgTitle = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SvgVisualization = ({ svgUrl, title, onAnimationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (svgUrl) {
      fetch(svgUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch SVG');
          }
          return response.text();
        })
        .then(svgText => {
          setSvgContent(svgText);
          setIsLoading(false);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        })
        .catch(error => {
          console.error('Error loading SVG:', error);
          setHasError(true);
          setIsLoading(false);
        });
    }
  }, [svgUrl, onAnimationComplete]);

  const handleDownload = () => {
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagram_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleExpand = () => {
    if (svgContent) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${title || 'SVG Diagram'}</title>
            <style>
              body { margin: 0; padding: 20px; background: #f8f9fa; }
              svg { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${svgContent}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  if (hasError) {
    return (
      <SvgContainer>
        <ErrorOverlay>
          <p>Error loading SVG diagram.</p>
          <p>Please try again or check the console for details.</p>
        </ErrorOverlay>
      </SvgContainer>
    );
  }

  return (
    <SvgContainer>
      {isLoading && (
        <LoadingOverlay>
          <FaSpinner className="spinner" size={48} />
          <p>Loading Technical Diagram...</p>
        </LoadingOverlay>
      )}
      
      <SvgWrapper scale={scale}>
        <SvgElement
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </SvgWrapper>
      
      <ControlsOverlay>
        <ControlButton onClick={handleDownload} title="Download SVG">
          <FaDownload size={16} />
        </ControlButton>
        <ControlButton onClick={handleExpand} title="View Full Size">
          <FaExpand size={16} />
        </ControlButton>
      </ControlsOverlay>
      
      <ZoomControls>
        <ZoomButton onClick={handleZoomOut} title="Zoom Out">
          <FaSearchMinus size={12} />
        </ZoomButton>
        <ZoomButton onClick={handleResetZoom} title="Reset Zoom">
          {Math.round(scale * 100)}%
        </ZoomButton>
        <ZoomButton onClick={handleZoomIn} title="Zoom In">
          <FaSearchPlus size={12} />
        </ZoomButton>
      </ZoomControls>
      
      {title && (
        <SvgTitle>{title}</SvgTitle>
      )}
    </SvgContainer>
  );
};

export default SvgVisualization;
