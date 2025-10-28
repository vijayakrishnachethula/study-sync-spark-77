import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaBook, FaClock, FaBrain } from 'react-icons/fa';
import { UserProfile } from '@/utils/mockProfiles';
import { MatchScore } from '@/utils/matcher';
import { RadarChart } from './RadarChart';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface MatchCardProps {
  profile: UserProfile;
  matchScore: MatchScore;
  index: number;
}

export const MatchCard = ({ profile, matchScore, index }: MatchCardProps) => {
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [connected, setConnected] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: 'spring',
        bounce: 0.4
      }}
      whileHover={{ 
        scale: 1.03,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="p-6 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-card">
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

        {/* CS Icebreaker Quiz */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <p className="font-semibold mb-3 text-foreground">CS Icebreaker: What's your go-to debugging trick?</p>
          <div className="space-y-2">
            {['Console.log everything', 'Breakpoints & debugger', 'Ask AI for help'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name={`quiz-${profile.id}`}
                  value={option}
                  checked={quizAnswer === option}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Connect Button */}
        <Button
          onClick={handleConnect}
          disabled={connected}
          className="w-full gradient-primary text-white font-semibold"
        >
          {connected ? '✓ Connected!' : 'Connect'}
        </Button>
      </Card>
    </motion.div>
  );
};
