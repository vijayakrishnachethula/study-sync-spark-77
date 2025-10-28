import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaTimes } from 'react-icons/fa';
import { Button } from './ui/button';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalModal = ({ isOpen, onClose }: TerminalModalProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `$ studysync --analyze
> Initializing matcher algorithm...
> Scanning course databases...
> Computing compatibility scores...
> ✓ Match engine ready!
> 
> Pro tip: High course overlap (>60%) = study session gold!
> Easter egg unlocked! 🐛✨`;

  useEffect(() => {
    if (isOpen) {
      setDisplayedText('');
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isOpen, fullText]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden m-4 border border-primary/30">
              {/* Terminal Header */}
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <FaTerminal className="text-secondary" />
                  <span className="text-gray-300 font-mono text-sm">studysync-terminal</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-6 w-6 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </Button>
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-mono text-sm text-green-400 min-h-[300px]">
                <pre className="whitespace-pre-wrap">{displayedText}</pre>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-green-400 ml-1"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
