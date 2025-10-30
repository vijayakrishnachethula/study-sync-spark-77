import { useState } from 'react';
import { motion } from 'framer-motion';
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
  onPropose?: (targetId: string | number) => void;
  onConnect?: (targetId: number) => void;
  isConnected?: boolean;
}

export const MatchCard = ({ profile, matchScore, index, onPropose, onConnect, isConnected }: MatchCardProps) => {
  const [connected, setConnected] = useState<boolean>(Boolean(isConnected));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-secondary text-secondary-foreground';
    if (score >= 60) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const handleConnect = () => {
    if (onConnect) onConnect(Number(profile.id));
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
      whileHover={{ scale: 1.02, boxShadow: '0 20px 60px -10px rgba(74, 144, 226, 0.4)', transition: { duration: 0.2 } }}
      className="cursor-default relative"
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

        {/* Details (only name, courses, schedule) */}
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
        </div>

        {/* Removed CS Icebreaker for a cleaner UI */}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleConnect}
              disabled={connected}
              className="w-full gradient-primary text-white font-semibold"
            >
              {connected ? '✓ Connected!' : 'Connect'}
            </Button>
          </motion.div>
          {onPropose && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => onPropose(profile.id)}
                disabled={!connected}
                className="w-full"
              >
                {connected ? 'Propose session' : 'Connect first'}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
