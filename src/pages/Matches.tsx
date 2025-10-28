import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/utils/mockProfiles';
import { MatchScore } from '@/utils/matcher';
import axios from 'axios';
import { MatchCard } from '@/components/MatchCard';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CosmicLoader } from '@/components/CosmicLoader';
import { Button } from '@/components/ui/button';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';

const Matches = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Array<{ profile: UserProfile; score: MatchScore }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const storedProfile = localStorage.getItem('studysync-profile');
      if (!storedProfile) {
        navigate('/');
        return;
      }
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let myIdStr = localStorage.getItem('studysync-myId');
      const profile: UserProfile = JSON.parse(storedProfile);
      setUserProfile(profile);

      // If we don't have an id yet (e.g., profile saved before backend was added), create it now
      if (!myIdStr) {
        try {
          const res = await axios.post(`${baseURL}/api/users`, {
            name: profile.name,
            courses: profile.courses,
            schedule: profile.schedule,
            studyStyle: profile.studyStyle,
          });
          const savedId = res.data?.id;
          if (savedId) {
            myIdStr = String(savedId);
            localStorage.setItem('studysync-myId', myIdStr);
            localStorage.setItem('studysync-profile', JSON.stringify({ ...profile, id: myIdStr }));
          }
        } catch (e) {
          console.log('Failed to create user for matches', e);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await axios.get(`${baseURL}/api/matches`, { params: { myId: myIdStr } });
        const data = res.data as Array<{ profile: UserProfile; score: MatchScore }>;
        setMatches(data);
      } catch (err) {
        console.log('Failed to fetch matches', err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate]);

  if (loading) {
    return <CosmicLoader />;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative">
      {/* Constellation Background */}
      <ParticleBackground />
      
      <div className="container mx-auto max-w-7xl relative z-10">
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
