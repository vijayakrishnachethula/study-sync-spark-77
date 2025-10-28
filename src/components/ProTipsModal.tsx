import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaTimes } from 'react-icons/fa';
import { Button } from './ui/button';

interface ProTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyStyle: string;
}

const tips = {
  Visual: [
    "🎨 Use mind maps and flowcharts for algorithms",
    "📊 Draw out data structures on whiteboards",
    "🖼️ Create visual debugging diagrams",
  ],
  Auditory: [
    "🗣️ Explain code out loud (rubber duck debugging!)",
    "🎧 Join study group discussions and pair programming",
    "📻 Listen to CS podcasts during commutes",
  ],
  Kinesthetic: [
    "⌨️ Type out code examples while learning",
    "🎮 Use interactive coding challenges",
    "🤹 Build mini-projects to practice concepts",
  ],
  Reader: [
    "📚 Read official documentation thoroughly",
    "📖 Take detailed notes with code snippets",
    "✍️ Write blog posts to solidify understanding",
  ],
};

export const ProTipsModal = ({ isOpen, onClose, studyStyle }: ProTipsModalProps) => {
  const styleTips = tips[studyStyle as keyof typeof tips] || tips.Visual;

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card rounded-2xl shadow-elegant p-6 m-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaLightbulb className="text-3xl text-secondary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground">Pro Tips</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <FaTimes />
                </Button>
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-4">
                Based on your <span className="text-primary font-semibold">{studyStyle}</span> learning style:
              </p>

              <motion.div className="space-y-3">
                {styleTips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 bg-gradient-card rounded-lg"
                  >
                    <p className="text-foreground">{tip}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Close Button */}
              <Button
                onClick={onClose}
                className="w-full mt-6 gradient-primary text-white"
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
