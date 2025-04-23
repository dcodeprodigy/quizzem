import React from "react";
import {motion, AnimatePresence} from "framer-motion";


const OverlayAnimation = ({ isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                key="retake-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" // High z-index
            >
                {/* Animated "Q" Logo */}
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }} // Breathing effect
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} // Loop animation
                    className="text-9xl font-bold"
                    style={{
                        // Sleek gradient text
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', // Blue gradient
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 5px rgba(59, 130, 246, 0.4))' // Soft shadow
                    }}
                >
                    Q
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default OverlayAnimation;