import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/utils/mockProfiles';
import { MatchScore, calculateMatch } from '@/utils/matcher';
import { supabase } from '@/lib/supabase';
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
      try {
        const stored = localStorage.getItem('studysync-profile');
        const myProfile: UserProfile | null = stored ? JSON.parse(stored) : null;
        setUserProfile(myProfile);

        const myIdStr = localStorage.getItem('studysync-myId');
        if (!myIdStr) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('id, name, courses, schedule, study_style, phone, email, instagram');
        if (error) throw error;

        const users: UserProfile[] = (data || []).map((u: any) => ({
          id: u.id,
          name: u.name || `User ${u.id}`,
          courses: u.courses || [],
          schedule: u.schedule || '',
          studyStyle: u.study_style || 'Visual',
          phone: u.phone || undefined,
          email: u.email || undefined,
          instagram: u.instagram || undefined,
        }));

        const meId = Number(myIdStr);
        const me = users.find(u => Number(u.id) === meId);
        if (!me) {
          setLoading(false);
          return;
        }

        const candidates = users.filter(u => Number(u.id) !== meId);
        // Use existing matcher util
        const scored = candidates
          .map((c) => ({ profile: c, score: calculateMatch(me, c) })) as Array<{ profile: UserProfile; score: MatchScore }>;

        setMatches(scored.sort((a, b) => b.score.score - a.score.score).slice(0, 9));
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

      const start = window.prompt('Enter start time (ISO, e.g., 2025-11-01T10:00:00Z)');
      if (!start) return;
      const end = window.prompt('Enter end time (ISO, after start)');
      if (!end) return;

      const { error } = await supabase.from('sessions').insert({
        from_user_id: Number(myIdStr),
        to_user_id: Number(targetId),
        start_at: start,
        end_at: end,
        note: '',
        status: 'pending',
      });
      if (error) throw error;
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
