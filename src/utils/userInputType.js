import { useState, useEffect } from 'react';

/**
 * @description Custom React hook to detect the primary input device type based on
 * CSS Interaction Media Features Level 4 (`pointer: coarse`). This is the most
 * reliable modern method for distinguishing touch-first devices from mouse/pointer-first devices.
 * It helps tailor UI interactions (e.g., disabling hover effects for touch).
 * The hook updates the state if the primary input mechanism changes (e.g., docking a tablet).
 * It's safe for server-side rendering (SSR), returning 'unknown' initially on the server
 * and determining the type on the client-side.
 *
 * @returns {'touch' | 'mouse' | 'unknown'} The detected primary input type: 'touch', 'mouse', or 'unknown'.
 *          - 'touch': Primary input is coarse (e.g., finger on a touchscreen).
 *          - 'mouse': Primary input is fine (e.g., mouse, trackpad, stylus).
 *          - 'unknown': Detection hasn't run yet (SSR or initial client render).
 *
 * @example
 * import React from 'react';
 * import useInputDeviceType from './hooks/useInputDeviceType';
 *
 * function MyInteractiveElement() {
 *   const inputType = useInputDeviceType();
 *
 *   const handleClick = () => {
 *     console.log('Element activated!');
 *     // Toggle visibility or perform action
 *   };
 *
 *   const handleMouseEnter = () => {
 *     if (inputType === 'mouse') {
 *       console.log('Showing tooltip on hover');
 *       // Show hover effect
 *     }
 *   };
 *
 *   const handleMouseLeave = () => {
 *      if (inputType === 'mouse') {
 *        console.log('Hiding tooltip on hover leave');
 *        // Hide hover effect
 *      }
 *   };
 *
 *    // Apply different classes or logic based on input type
 *    const interactionClass = inputType === 'touch' ? 'interaction-touch' : 'interaction-mouse';
 *
 *   if (inputType === 'unknown') {
 *      // Optional: Render a loading state or default behavior during initial check
 *      return <div>Loading interaction mode...</div>;
 *   }
 *
 *   return (
 *     <button
 *       className={`interactive-button ${interactionClass}`}
 *       onClick={handleClick} // Click/tap works for both
 *       onMouseEnter={handleMouseEnter} // Hover logic primarily for mouse
 *       onMouseLeave={handleMouseLeave} // Hover logic primarily for mouse
 *     >
 *       {inputType === 'touch' ? 'Tap Me' : 'Click or Hover Me'}
 *     </button>
 *   );
 * }
 *
 * export default MyInteractiveElement;
 */
function useInputDeviceType() {
  // Initialize state - 'unknown' is safe for SSR and initial client render
  const [inputType, setInputType] = useState('unknown');

  useEffect(() => {
    // Check only on the client-side where window.matchMedia is available
    if (typeof window === 'undefined' || !window.matchMedia) {
      // Default assumption for SSR or unsupported environments.
      // You could default to 'mouse' if that makes more sense for your base case.
      setInputType('mouse');
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');

    // Function to update state based on the media query match status
    const updateDeviceType = (event) => {
      setInputType(event.matches ? 'touch' : 'mouse');
    };

    // Initial check when the component mounts on the client
    updateDeviceType(mediaQuery);

    // Listen for changes in the media query (e.g., device docked/undocked)
    // Use the modern addEventListener if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateDeviceType);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers (deprecated but necessary for wider compatibility)
      mediaQuery.addListener(updateDeviceType);
    }

    // Cleanup function: remove the listener when the component unmounts
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateDeviceType);
      } else if (mediaQuery.removeListener) {
        // Fallback for older browsers
        mediaQuery.removeListener(updateDeviceType);
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount

  return inputType;
}

export default useInputDeviceType;