import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { FaTrophy, FaBook, FaClock, FaBrain, FaQuestionCircle } from 'react-icons/fa';
import { UserProfile } from '@/utils/mockProfiles';
import { MatchScore } from '@/utils/matcher';
import { RadarChart } from './RadarChart';
import { PowerPairBadge } from './PowerPairBadge';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface MatchCardProps {
  profile: UserProfile;
  matchScore: MatchScore;
  index: number;
}

const csFacts = [
  "💡 Console.log tip: Use %o for objects!",
  "🚀 Tip: Use debugger; for instant breakpoints",
  "⚡ Pro tip: Array.reduce() is your friend",
  "🎯 Did you know? Git bisect finds bugs fast",
];

export const MatchCard = ({ profile, matchScore, index }: MatchCardProps) => {
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-secondary text-secondary-foreground';
    if (score >= 60) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const handleConnect = () => {
    setConnected(true);
    
    if (matchScore.score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A90E2', '#7ED321', '#FFD700']
      });
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    // Small confetti sparks on drop
    if (Math.abs(info.offset.y) > 20) {
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { x: info.point.x / window.innerWidth, y: info.point.y / window.innerHeight },
        colors: ['#4A90E2', '#7ED321'],
        startVelocity: 15,
        ticks: 30,
      });
    }
  };

  const isPowerPair = matchScore.score >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      whileHover={{ 
        scale: isDragging ? 1 : 1.02,
        rotate: isDragging ? 0 : 1,
        boxShadow: '0 20px 60px -10px rgba(74, 144, 226, 0.4)',
        transition: { duration: 0.2 }
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing relative"
    >
      {isPowerPair && <PowerPairBadge />}
      
      <Card className="p-6 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-card relative overflow-hidden">
        {/* Score Badge */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">{profile.name}</h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${getScoreColor(matchScore.score)}`}
          >
            <FaTrophy />
            <span className="font-bold text-lg">{matchScore.score}%</span>
          </motion.div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-muted-foreground italic mb-4">{profile.bio}</p>
        )}

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <FaBook className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Courses</p>
              <p className="text-foreground">{profile.courses.join(', ')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <FaClock className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Schedule</p>
              <p className="text-foreground">{profile.schedule}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <FaBrain className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground">Study Style</p>
              <p className="text-foreground">{profile.studyStyle}</p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="my-6 p-4 bg-background/50 rounded-lg">
          <RadarChart
            courseOverlap={matchScore.breakdown.courseOverlap}
            scheduleCompatibility={matchScore.breakdown.scheduleCompatibility}
            studyStyleMatch={matchScore.breakdown.studyStyleMatch}
          />
        </div>

        {/* CS Icebreaker Quiz - Code Chips */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FaQuestionCircle className="text-primary" />
            <p className="font-semibold text-foreground">CS Icebreaker: What's your go-to debugging trick?</p>
          </div>
          <div className="space-y-2">
            {['Console.log everything', 'Breakpoints & debugger', 'Ask AI for help'].map((option, idx) => (
              <motion.label
                key={option}
                className="relative flex items-center gap-2 cursor-pointer group"
                onHoverStart={() => setShowTooltip(option)}
                onHoverEnd={() => setShowTooltip(null)}
              >
                <motion.div
                  whileHover={{ rotateY: 180, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all
                    ${quizAnswer === option 
                      ? 'border-secondary bg-secondary/20 shadow-glow' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`quiz-${profile.id}`}
                    value={option}
                    checked={quizAnswer === option}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </motion.div>
                
                {/* CS Fact Tooltip */}
                {showTooltip === option && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 left-0 right-0 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs z-10 shadow-lg"
                  >
                    {csFacts[idx]}
                  </motion.div>
                )}
              </motion.label>
            ))}
          </div>
        </div>

        {/* Connect Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleConnect}
            disabled={connected}
            className="w-full gradient-primary text-white font-semibold"
          >
            {connected ? '✓ Connected!' : 'Connect'}
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
};
