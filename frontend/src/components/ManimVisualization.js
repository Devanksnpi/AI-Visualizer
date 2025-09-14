import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaRedo, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const VideoContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
`;

const VideoControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${VideoContainer}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1e293b;

  &:hover {
    background: white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 12px;
  cursor: pointer;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
`;

const TimeDisplay = styled.div`
  color: white;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  z-index: 10;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  max-width: 80%;
`;

const ManimVisualization = ({ 
  videoUrl, 
  title = "Manim Animation",
  onAnimationComplete,
  isPlaying: externalIsPlaying = false,
  currentTime: externalCurrentTime = 0,
  onSeek
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Sync with external controls
  useEffect(() => {
    if (externalIsPlaying !== isPlaying) {
      if (externalIsPlaying) {
        play();
      } else {
        pause();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalIsPlaying, isPlaying]);

  useEffect(() => {
    if (Math.abs(externalCurrentTime - currentTime) > 0.1) {
      seekTo(externalCurrentTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCurrentTime, currentTime]);

  const play = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      seekTo(newTime);
      if (onSeek) {
        onSeek(newTime);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (onSeek) {
        onSeek(time);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error('Video loading error');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <VideoContainer>
      {isLoading && (
        <LoadingOverlay>
          <div>Loading Manim animation...</div>
        </LoadingOverlay>
      )}
      
      {hasError && (
        <ErrorMessage>
          <div>Failed to load animation</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
            The Manim video could not be loaded. Please try again.
          </div>
        </ErrorMessage>
      )}

      <Video
        ref={videoRef}
        src={videoUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        preload="metadata"
      />

      <VideoControls>
        <ControlButton onClick={restart} title="Restart">
          <FaRedo size={16} />
        </ControlButton>
        
        <ControlButton onClick={isPlaying ? pause : play} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
        </ControlButton>
        
        <ControlButton onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
        </ControlButton>
        
        <ProgressBar onClick={handleProgressClick}>
          <ProgressFill progress={progress} />
        </ProgressBar>
        
        <TimeDisplay>
          {formatTime(currentTime)} / {formatTime(duration)}
        </TimeDisplay>
      </VideoControls>
    </VideoContainer>
  );
};

export default ManimVisualization;
