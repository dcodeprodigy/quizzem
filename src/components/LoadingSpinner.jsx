import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

// Define the animation name consistently
const spinAnimationName = 'spinner-spin-jsx'; // Unique name for this component's keyframes
const keyframesStyleId = 'spinner-keyframes-style'; // ID for the injected style tag

function LoadingSpinner({ size = 40 }) {
  // Inject keyframes into the document head if they don't exist
  useEffect(() => {
    // Check if the style tag already exists
    if (!document.getElementById(keyframesStyleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = keyframesStyleId; // Assign an ID to prevent duplicates
      styleSheet.innerHTML = `
        @keyframes ${spinAnimationName} {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }


  }, []);

  // Calculate border thickness based on size
  const borderThickness = Math.max(1, Math.round(size / 8));

  const spinnerStyle = {
    display: 'inline-block',
    width: `${size}px`,
    height: `${size}px`,
    border: `${borderThickness}px solid rgba(0, 0, 0, 0.1)`,
    borderTopColor: '#3498db', 
    borderRadius: '50%',
    animation: `${spinAnimationName} 1s linear infinite`, 
  };

  return (
    <div style={spinnerStyle} role="status" aria-live="polite">
      <span style={{
         border: 0,
         clip: 'rect(0 0 0 0)',
         height: '1px',
         margin: '-1px',
         overflow: 'hidden',
         padding: 0,
         position: 'absolute',
         width: '1px'
      }}>
         Loading...
      </span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.number,
};

export default LoadingSpinner;