import React from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaRedo, FaVolumeUp } from 'react-icons/fa';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ControlButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : '#f1f5f9'
  };
  color: ${props => props.primary ? 'white' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: ${props => props.primary 
      ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
      : '#e2e8f0'
    };
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    background: #cbd5e1;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
  border-radius: 4px;
`;

const TimeDisplay = styled.div`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  min-width: 120px;
  text-align: center;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
`;

const VolumeButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #3b82f6;
  }
`;

const Controls = ({ isPlaying, onPlayPause, onRestart, currentTime, duration, onSeek }) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (duration > 0 && onSeek) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      onSeek(newTime);
    }
  };

  return (
    <ControlsContainer>
      <ControlButton onClick={onRestart} title="Restart">
        <FaRedo size={16} />
      </ControlButton>
      
      <ControlButton primary={isPlaying} onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
      </ControlButton>
      
      <ProgressBar onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
        <ProgressFill progress={progress} />
      </ProgressBar>
      
      <TimeDisplay>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeDisplay>
      
      <VolumeButton title="Volume">
        <FaVolumeUp size={14} />
      </VolumeButton>
    </ControlsContainer>
  );
};

export default Controls;