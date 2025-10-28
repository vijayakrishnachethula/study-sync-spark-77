import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

export const CosmicLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative">
        {/* Rotating stars */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="relative w-32 h-32"
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={angle}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `rotate(${angle}deg) translate(50px) rotate(-${angle}deg)`,
              }}
            >
              <FaStar 
                className="text-2xl"
                style={{ 
                  color: i % 2 === 0 ? '#4A90E2' : '#7ED321',
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Center glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full gradient-primary opacity-30 blur-xl"
        />

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Finding Your Matches...
        </motion.p>
      </div>
    </div>
  );
};
