import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSpinner, FaDownload, FaExpand, FaPlay, FaPause, FaRedo, FaChartLine, FaInfo } from 'react-icons/fa';

const PhysicsContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const PhysicsImage = styled.img`
  width: 100%;
  height: 70%;
  object-fit: contain;
  background-color: white;
`;

const ControlsPanel = styled.div`
  height: 30%;
  background: #f8f9fa;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #e9ecef;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#2563eb' : '#4b5563'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DataButton = styled(ControlButton)`
  background: #10b981;
  
  &:hover {
    background: #059669;
  }
`;

const InfoButton = styled(ControlButton)`
  background: #8b5cf6;
  
  &:hover {
    background: #7c3aed;
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

const SimulationInfo = styled.div`
  background: #e0f2fe;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
`;

const InfoTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #0369a1;
  font-size: 14px;
  font-weight: 600;
`;

const InfoText = styled.p`
  margin: 0;
  color: #0c4a6e;
  font-size: 12px;
  line-height: 1.4;
`;

const DataModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #374151;
  }
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.th`
  background: #f3f4f6;
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border: 1px solid #d1d5db;
`;

const TableCell = styled.td`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  color: #4b5563;
`;

const PhysicsVisualization = ({ simulationUrl, dataUrl, title, onAnimationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (simulationUrl) {
      setIsLoading(true);
      setHasError(false);
      
      // Load simulation data if available
      if (dataUrl) {
        fetch(dataUrl)
          .then(response => response.json())
          .then(data => {
            setSimulationData(data);
            setIsLoading(false);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          })
          .catch(error => {
            console.warn('Could not load simulation data:', error);
            setIsLoading(false);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          });
      } else {
        setIsLoading(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }
  }, [simulationUrl, dataUrl, onAnimationComplete]);

  const handleDownload = () => {
    if (simulationUrl) {
      const link = document.createElement('a');
      link.href = simulationUrl;
      link.download = `physics_simulation_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExpand = () => {
    if (simulationUrl) {
      window.open(simulationUrl, '_blank');
    }
  };

  const handleDownloadData = () => {
    if (simulationData) {
      const dataStr = JSON.stringify(simulationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `physics_data_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderDataTable = () => {
    if (!simulationData) return null;

    const { parameters, time, ...dataFields } = simulationData;
    
    return (
      <div>
        <h4>Simulation Parameters</h4>
        <DataTable>
          <thead>
            <tr>
              <TableHeader>Parameter</TableHeader>
              <TableHeader>Value</TableHeader>
            </tr>
          </thead>
          <tbody>
            {parameters && Object.entries(parameters).map(([key, value]) => (
              <tr key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{typeof value === 'number' ? value.toFixed(3) : value}</TableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>

        <h4 style={{ marginTop: '24px' }}>Data Summary</h4>
        <DataTable>
          <thead>
            <tr>
              <TableHeader>Data Field</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Length</TableHeader>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dataFields).map(([key, value]) => (
              <tr key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{Array.isArray(value) ? 'Array' : typeof value}</TableCell>
                <TableCell>{Array.isArray(value) ? value.length : 'N/A'}</TableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    );
  };

  const getSimulationInfo = () => {
    if (!simulationData) return null;

    const { parameters } = simulationData;
    if (!parameters) return null;

    let info = '';
    if (parameters.gravity) {
      info += `Gravity: ${parameters.gravity} m/s²\n`;
    }
    if (parameters.viscosity) {
      info += `Viscosity: ${parameters.viscosity}\n`;
    }
    if (parameters.diffusion) {
      info += `Diffusion: ${parameters.diffusion}\n`;
    }
    if (parameters.restitution) {
      info += `Restitution: ${parameters.restitution}\n`;
    }
    if (parameters.friction) {
      info += `Friction: ${parameters.friction}\n`;
    }

    return info;
  };

  if (hasError) {
    return (
      <PhysicsContainer>
        <ErrorOverlay>
          <p>Error loading physics simulation.</p>
          <p>Please try again or check the console for details.</p>
        </ErrorOverlay>
      </PhysicsContainer>
    );
  }

  return (
    <PhysicsContainer>
      {isLoading && (
        <LoadingOverlay>
          <FaSpinner className="spinner" size={48} />
          <p>Running Physics Simulation...</p>
        </LoadingOverlay>
      )}
      
      <PhysicsImage
        src={simulationUrl}
        alt={title || "Physics Simulation"}
        onError={() => setHasError(true)}
      />
      
      <ControlsPanel>
        <ControlRow>
          <ControlButton variant="primary" onClick={handleDownload}>
            <FaDownload size={14} />
            Download
          </ControlButton>
          
          <ControlButton onClick={handleExpand}>
            <FaExpand size={14} />
            Full Screen
          </ControlButton>
          
          {simulationData && (
            <DataButton onClick={() => setShowDataModal(true)}>
              <FaChartLine size={14} />
              View Data
            </DataButton>
          )}
          
          <InfoButton onClick={() => setShowInfo(!showInfo)}>
            <FaInfo size={14} />
            {showInfo ? 'Hide' : 'Show'} Info
          </InfoButton>
        </ControlRow>
        
        {showInfo && getSimulationInfo() && (
          <SimulationInfo>
            <InfoTitle>Simulation Parameters</InfoTitle>
            <InfoText style={{ whiteSpace: 'pre-line' }}>
              {getSimulationInfo()}
            </InfoText>
          </SimulationInfo>
        )}
      </ControlsPanel>
      
      {showDataModal && (
        <DataModal onClick={() => setShowDataModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Physics Simulation Data</ModalTitle>
              <CloseButton onClick={() => setShowDataModal(false)}>×</CloseButton>
            </ModalHeader>
            
            {renderDataTable()}
            
            <ControlRow style={{ marginTop: '24px', justifyContent: 'flex-end' }}>
              <ControlButton onClick={handleDownloadData}>
                <FaDownload size={14} />
                Download Data
              </ControlButton>
            </ControlRow>
          </ModalContent>
        </DataModal>
      )}
    </PhysicsContainer>
  );
};

export default PhysicsVisualization;
