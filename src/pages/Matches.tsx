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
import { toast } from 'sonner';
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
      const baseURL =
        import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000'
          : '/api');
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
          // If backend is unreachable, still allow UI to render with empty matches
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

  const handlePropose = async (targetId: string | number) => {
    try {
      const myIdStr = localStorage.getItem('studysync-myId');
      if (!myIdStr) {
        toast.error('Please create your profile first.');
        navigate('/');
        return;
      }

      const start = window.prompt('Enter start time (ISO, e.g., 2025-10-30T12:00:00Z)');
      if (!start) return;
      const end = window.prompt('Enter end time (ISO, after start)');
      if (!end) return;

      const baseURL =
        import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000'
          : '/api');

      await axios.post(`${baseURL}/api/sessions/propose`, {
        fromUserId: Number(myIdStr),
        toUserId: Number(targetId),
        start,
        end,
      });
      toast.success('Session proposed! Waiting for acceptance.');
    } catch (e) {
      console.log('Failed to propose session', e);
      toast.error('Failed to propose session');
    }
  };

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
                onPropose={handlePropose}
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
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">
                No matches found right now. Your profile is saved.
              </p>
              <p className="text-sm text-muted-foreground">
                We’ll notify you when a match is available. (Notifications not implemented yet.)
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matches;
