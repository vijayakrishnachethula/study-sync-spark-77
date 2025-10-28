import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';

export const PowerPairBadge = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 10, stiffness: 200 }}
      className="absolute -top-3 -right-3 z-10"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-secondary text-white rounded-full p-3 shadow-glow"
      >
        <FaTrophy className="text-2xl" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-secondary text-white px-2 py-1 rounded text-xs font-bold"
      >
        Power Pair!
      </motion.div>
    </motion.div>
  );
};
