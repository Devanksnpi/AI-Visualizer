import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ManimVisualization from './ManimVisualization';
import PlotVisualization from './PlotVisualization';
import SvgVisualization from './SvgVisualization';
import PhysicsVisualization from './PhysicsVisualization'; // New import

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  overflow: hidden;
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 16px;
`;

const NoVisualization = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  font-size: 18px;
  text-align: center;
  opacity: 0.8;
  background: #ffffff;
  border-radius: 16px;
  margin: 16px;
  border: 2px dashed #e2e8f0;
`;

// Removed unused VisualizationTitle component

const VisualizationCanvas = ({ visualization, isPlaying, currentTime, onTimeUpdate, onAnimationComplete, onSeek }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visualization) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visualization]);

  useEffect(() => {
    if (!visualization) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Reset animation time when currentTime is 0 (restart)
    if (currentTime === 0) {
      setAnimationTime(0);
    }

    const startTime = performance.now() - currentTime;

    const animate = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / visualization.duration, 1);
      
      setAnimationTime(progress * visualization.duration);
      onTimeUpdate(progress * visualization.duration);
      
      if (progress < 1 && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, visualization, currentTime, onTimeUpdate, onAnimationComplete]);

  useEffect(() => {
    if (!visualization) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw each layer
    if (visualization && visualization.layers && Array.isArray(visualization.layers)) {
      visualization.layers.forEach(layer => {
        drawLayer(ctx, layer, animationTime, rect);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualization, animationTime]);

  const drawLayer = (ctx, layer, time, canvasRect) => {
    if (!layer) return;
    
    const { type, props, animations } = layer;
    
    // Apply animations
    let animatedProps = { ...(props || {}) };
    if (animations && Array.isArray(animations)) {
      animations.forEach(animation => {
      if (animation.property === 'orbit') {
        const angle = (time / animation.duration) * 2 * Math.PI;
        animatedProps.x = animation.centerX + Math.cos(angle) * animation.radius;
        animatedProps.y = animation.centerY + Math.sin(angle) * animation.radius;
      } else {
        // For other properties, use time-based interpolation
        const startTime = animation.start || 0;
        const endTime = animation.end || animation.duration || 1000;
        const duration = endTime - startTime;
        
        if (time >= startTime) {
          const progress = Math.min((time - startTime) / duration, 1);
          const value = animation.from + (animation.to - animation.from) * progress;
          animatedProps[animation.property] = value;
        }
      }
      });
    }

    // Draw based on type
    switch (type) {
      case 'circle':
        drawCircle(ctx, animatedProps);
        break;
      case 'rectangle':
        drawRectangle(ctx, animatedProps);
        break;
      case 'arrow':
        drawArrow(ctx, animatedProps);
        break;
      case 'line':
        drawLine(ctx, animatedProps);
        break;
      case 'text':
        drawText(ctx, animatedProps);
        break;
      case 'ellipse':
        drawEllipse(ctx, animatedProps);
        break;
      case 'polygon':
        drawPolygon(ctx, animatedProps);
        break;
      case 'path':
        drawPath(ctx, animatedProps);
        break;
      default:
        console.warn(`Unknown layer type: ${type}`);
    }
  };

  const drawCircle = (ctx, props) => {
    const { x, y, r, fill, stroke, strokeWidth, gradient, shadow, glow } = props;
    
    // Add shadow/glow effect
    if (shadow || glow) {
      ctx.save();
      ctx.shadowColor = shadow || glow || 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = glow ? 15 : 8;
      ctx.shadowOffsetX = shadow ? 2 : 0;
      ctx.shadowOffsetY = shadow ? 2 : 0;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    
    if (fill) {
      if (gradient) {
        // Create gradient
        const gradientObj = ctx.createRadialGradient(x - r/3, y - r/3, 0, x, y, r);
        gradientObj.addColorStop(0, gradient.from || fill);
        gradientObj.addColorStop(1, gradient.to || fill);
        ctx.fillStyle = gradientObj;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
    
    if (shadow || glow) {
      ctx.restore();
    }
  };

  const drawRectangle = (ctx, props) => {
    const { x, y, width, height, fill, stroke, strokeWidth, gradient, shadow, borderRadius } = props;
    
    // Add shadow effect
    if (shadow) {
      ctx.save();
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    ctx.beginPath();
    
    if (borderRadius) {
      // Rounded rectangle
      const r = borderRadius;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      ctx.rect(x, y, width, height);
    }
    
    if (fill) {
      if (gradient) {
        // Create linear gradient
        const gradientObj = ctx.createLinearGradient(x, y, x + width, y + height);
        gradientObj.addColorStop(0, gradient.from || fill);
        gradientObj.addColorStop(1, gradient.to || fill);
        ctx.fillStyle = gradientObj;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
    
    if (shadow) {
      ctx.restore();
    }
  };

  const drawArrow = (ctx, props) => {
    const { x, y, dx, dy, color, strokeWidth, gradient, glow, headSize } = props;
    const headLength = headSize || 12;
    const angle = Math.atan2(dy, dx);
    
    // Add glow effect
    if (glow) {
      ctx.save();
      ctx.shadowColor = color || '#000';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    ctx.strokeStyle = color || '#000';
    ctx.lineWidth = strokeWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw arrow line with gradient if specified
    if (gradient) {
      const gradientObj = ctx.createLinearGradient(x, y, x + dx, y + dy);
      gradientObj.addColorStop(0, gradient.from || color);
      gradientObj.addColorStop(1, gradient.to || color);
      ctx.strokeStyle = gradientObj;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    
    // Draw arrow head with better proportions
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(
      x + dx - headLength * Math.cos(angle - Math.PI / 6),
      y + dy - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(
      x + dx - headLength * Math.cos(angle + Math.PI / 6),
      y + dy - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    
    if (glow) {
      ctx.restore();
    }
  };

  const drawLine = (ctx, props) => {
    const { x1, y1, x2, y2, color, strokeWidth, gradient, dash, glow } = props;
    
    // Add glow effect
    if (glow) {
      ctx.save();
      ctx.shadowColor = color || '#000';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    ctx.strokeStyle = color || '#000';
    ctx.lineWidth = strokeWidth || 2;
    ctx.lineCap = 'round';
    
    // Add dashed line if specified
    if (dash) {
      ctx.setLineDash(dash);
    }
    
    // Add gradient if specified
    if (gradient) {
      const gradientObj = ctx.createLinearGradient(x1, y1, x2, y2);
      gradientObj.addColorStop(0, gradient.from || color);
      gradientObj.addColorStop(1, gradient.to || color);
      ctx.strokeStyle = gradientObj;
    }
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Reset line dash
    if (dash) {
      ctx.setLineDash([]);
    }
    
    if (glow) {
      ctx.restore();
    }
  };

  const drawText = (ctx, props) => {
    const { x, y, text, fontSize, color, fontFamily, stroke, strokeWidth, shadow, background } = props;
    
    ctx.font = `${fontSize || 16}px ${fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add background if specified
    if (background) {
      const textMetrics = ctx.measureText(text);
      const padding = 8;
      const bgWidth = textMetrics.width + padding * 2;
      const bgHeight = fontSize + padding * 2;
      
      ctx.fillStyle = background.color || 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(x - bgWidth/2, y - bgHeight/2, bgWidth, bgHeight);
    }
    
    // Add shadow if specified
    if (shadow) {
      ctx.save();
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    }
    
    // Add stroke if specified
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 1;
      ctx.strokeText(text, x, y);
    }
    
    ctx.fillStyle = color || '#000';
    ctx.fillText(text, x, y);
    
    if (shadow) {
      ctx.restore();
    }
  };

  const drawEllipse = (ctx, props) => {
    const { x, y, rx, ry, fill, stroke, strokeWidth, gradient, shadow, rotation } = props;
    
    // Add shadow effect
    if (shadow) {
      ctx.save();
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    ctx.save();
    ctx.translate(x, y);
    if (rotation) {
      ctx.rotate(rotation * Math.PI / 180);
    }
    
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
    
    if (fill) {
      if (gradient) {
        const gradientObj = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
        gradientObj.addColorStop(0, gradient.from || fill);
        gradientObj.addColorStop(1, gradient.to || fill);
        ctx.fillStyle = gradientObj;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
    
    ctx.restore();
    
    if (shadow) {
      ctx.restore();
    }
  };

  const drawPolygon = (ctx, props) => {
    const { points, fill, stroke, strokeWidth, gradient, shadow } = props;
    
    if (!points || points.length < 3) return;
    
    // Add shadow effect
    if (shadow) {
      ctx.save();
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    
    if (fill) {
      if (gradient) {
        const gradientObj = ctx.createLinearGradient(
          Math.min(...points.map(p => p.x)), 
          Math.min(...points.map(p => p.y)),
          Math.max(...points.map(p => p.x)), 
          Math.max(...points.map(p => p.y))
        );
        gradientObj.addColorStop(0, gradient.from || fill);
        gradientObj.addColorStop(1, gradient.to || fill);
        ctx.fillStyle = gradientObj;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
    
    if (shadow) {
      ctx.restore();
    }
  };

  const drawPath = (ctx, props) => {
    const { path, fill, stroke, strokeWidth, gradient, shadow } = props;
    
    if (!path) return;
    
    // Add shadow effect
    if (shadow) {
      ctx.save();
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    ctx.beginPath();
    
    // Parse path commands (simplified SVG path syntax)
    const commands = path.split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
    let currentX = 0, currentY = 0;
    
    for (const command of commands) {
      if (!command) continue;
      
      const type = command[0];
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      
      switch (type.toLowerCase()) {
        case 'm': // Move to
          if (type === 'M') {
            currentX = coords[0];
            currentY = coords[1];
          } else {
            currentX += coords[0];
            currentY += coords[1];
          }
          ctx.moveTo(currentX, currentY);
          break;
        case 'l': // Line to
          if (type === 'L') {
            currentX = coords[0];
            currentY = coords[1];
          } else {
            currentX += coords[0];
            currentY += coords[1];
          }
          ctx.lineTo(currentX, currentY);
          break;
        case 'z': // Close path
          ctx.closePath();
          break;
        default:
          console.warn(`Unknown SVG path command: ${type}`);
          break;
      }
    }
    
    if (fill) {
      if (gradient) {
        const gradientObj = ctx.createLinearGradient(0, 0, 100, 100);
        gradientObj.addColorStop(0, gradient.from || fill);
        gradientObj.addColorStop(1, gradient.to || fill);
        ctx.fillStyle = gradientObj;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    }
    
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
    
    if (shadow) {
      ctx.restore();
    }
  };

  if (!visualization) {
    return (
      <CanvasContainer>
        <NoVisualization>
          <div>
            <h3>No Visualization Yet</h3>
            <p>Ask a question to see an interactive visualization!</p>
          </div>
        </NoVisualization>
      </CanvasContainer>
    );
  }

  // Check visualization type and render appropriate component
  if (visualization.type === 'manim' && visualization.videoUrl) {
    return (
      <ManimVisualization
        videoUrl={visualization.videoUrl}
        title={visualization.title || "Manim Animation"}
        onAnimationComplete={onAnimationComplete}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onSeek={onSeek || (() => {})}
      />
    );
  }

  if (visualization.type === 'plot' && visualization.imageUrl) {
    return (
      <PlotVisualization
        imageUrl={visualization.imageUrl}
        title={visualization.title || "Scientific Plot"}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  if (visualization.type === 'svg' && visualization.svgUrl) {
    return (
      <SvgVisualization
        svgUrl={visualization.svgUrl}
        title={visualization.title || "Technical Diagram"}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  if (visualization.type === 'physics' && visualization.simulationUrl) {
    return (
      <PhysicsVisualization
        simulationUrl={visualization.simulationUrl}
        dataUrl={visualization.dataUrl}
        title={visualization.title || "Physics Simulation"}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  // Default canvas visualization
  return (
    <CanvasContainer>
      <Canvas ref={canvasRef} />
    </CanvasContainer>
  );
};

export default VisualizationCanvas;
