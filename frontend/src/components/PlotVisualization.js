import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSpinner, FaDownload, FaExpand } from 'react-icons/fa';

const PlotContainer = styled.div`
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

const PlotImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background-color: white;
  border-radius: 8px;
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
  
  ${PlotContainer}:hover & {
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

const PlotTitle = styled.div`
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

const PlotVisualization = ({ imageUrl, title, onAnimationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error('Error loading plot image:', imageUrl);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `plot_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExpand = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  if (hasError) {
    return (
      <PlotContainer>
        <ErrorOverlay>
          <p>Error loading plot image.</p>
          <p>Please try again or check the console for details.</p>
        </ErrorOverlay>
      </PlotContainer>
    );
  }

  return (
    <PlotContainer>
      {isLoading && (
        <LoadingOverlay>
          <FaSpinner className="spinner" size={48} />
          <p>Loading Scientific Plot...</p>
        </LoadingOverlay>
      )}
      
      <PlotImage
        src={imageUrl}
        alt={title || "Scientific Plot"}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      <ControlsOverlay>
        <ControlButton onClick={handleDownload} title="Download Plot">
          <FaDownload size={16} />
        </ControlButton>
        <ControlButton onClick={handleExpand} title="View Full Size">
          <FaExpand size={16} />
        </ControlButton>
      </ControlsOverlay>
      
      {title && (
        <PlotTitle>{title}</PlotTitle>
      )}
    </PlotContainer>
  );
};

export default PlotVisualization;
