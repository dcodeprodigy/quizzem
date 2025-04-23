import React from 'react';
import { motion } from 'framer-motion';

const containerStyle = {
  display: 'flex',
  gap: '5px', // gap between dots
  alignItems: 'flex-end', 
  height: '16px',
  width: 'fit-content', 
};

const circleStyle = {
  display: 'block',
  width: '8px', // Size of each circle
  height: '8px',
  backgroundColor: 'currentColor', 
  borderRadius: '50%',
  transformOrigin: 'left center' 
};

// Variants for the container to orchestrate staggering
const containerVariants = {
  initial: {}, 
  animate: {
    transition: {
      staggerChildren: 0.25, // Delay between each child animation starting 
    },
  },
};

// Variants for the individual circles' animation
const circleVariants = {
  initial: {
      scaleY: 1 // Start at full height
  },
  animate: {
    scaleY: [1, 0.3, 1], // Animate scaleY: full -> small -> full
    transition: {
      duration: 1.5, // Duration of one pulse cycle (seconds)
      repeat: Infinity,
      ease: 'easeInOut', 
    },
  },
};

function LoadingDots() {
  return (
    <motion.div
      style={containerStyle}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      aria-label="Loading..." 
    >
      <motion.span style={circleStyle} variants={circleVariants} />
      <motion.span style={circleStyle} variants={circleVariants} />
      <motion.span style={circleStyle} variants={circleVariants} />
    </motion.div>
  );
}

export default LoadingDots;
