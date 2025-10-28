import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, mockProfiles } from '@/utils/mockProfiles';
import { findMatches, MatchScore } from '@/utils/matcher';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';

const Matches = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Array<{ profile: UserProfile; score: MatchScore }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile from localStorage
    const storedProfile = localStorage.getItem('studysync-profile');
    
    if (!storedProfile) {
      navigate('/');
      return;
    }

    const profile: UserProfile = JSON.parse(storedProfile);
    setUserProfile(profile);

    // Calculate matches
    setTimeout(() => {
      const matchScores = findMatches(profile, mockProfiles);
      const matchedProfiles = matchScores.map(score => ({
        profile: mockProfiles.find(p => p.id === score.userId)!,
        score
      }));

      setMatches(matchedProfiles);
      setLoading(false);
    }, 1000);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <FaTrophy className="text-6xl gradient-primary bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }} />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">Finding Your Perfect Matches...</h2>
          <p className="text-muted-foreground mt-2">Analyzing compatibility factors</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </Button>

          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Study Matches
            </h1>
            <p className="text-xl text-muted-foreground">
              Found {matches.length} potential study partners for {userProfile?.name}
            </p>
          </div>
        </motion.div>

        {/* Match Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <MatchCard
                key={match.profile.id}
                profile={match.profile}
                matchScore={match.score}
                index={index}
              />
            ))}
          </div>
        </AnimatePresence>

        {/* No Matches Message */}
        {matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-muted-foreground">
              No matches found yet. Try updating your profile!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matches;
