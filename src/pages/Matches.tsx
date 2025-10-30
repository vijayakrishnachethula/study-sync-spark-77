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
  const [pending, setPending] = useState<Array<{ id: number; from_user_id: number; start_at: string; end_at: string }>>([]);
  const [pendingConns, setPendingConns] = useState<Array<{ id: number; from_user_id: number; from_name: string; accept_token: string }>>([]);
  const [connectedIds, setConnectedIds] = useState<Set<number>>(new Set());

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

        // Fetch pending sessions where I'm the recipient
        const { data: pend, error: pErr } = await supabase
          .from('sessions')
          .select('id, from_user_id, start_at, end_at, status')
          .eq('to_user_id', meId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (pErr) throw pErr;
        setPending((pend || []).map((s: any) => ({ id: s.id, from_user_id: s.from_user_id, start_at: s.start_at, end_at: s.end_at })));

        // Fetch connections to gate propose
        // 1) Connected pairs involving me
        const { data: connsConnected, error: cErr } = await supabase
          .from('connections')
          .select('id, user_a_id, user_b_id, status')
          .or(`user_a_id.eq.${meId},user_b_id.eq.${meId}`)
          .eq('status', 'connected');
        if (cErr) throw cErr;
        const cSet = new Set<number>();
        (connsConnected || []).forEach((c: any) => {
          const other = c.user_a_id === meId ? c.user_b_id : c.user_a_id;
          cSet.add(Number(other));
        });
        setConnectedIds(cSet);

        // 2) Pending incoming connection requests (to me)
        const { data: connsPending, error: cpErr } = await supabase
          .from('connections')
          .select('id, user_a_id, accept_token')
          .eq('user_b_id', meId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (cpErr) throw cpErr;
        const fromIds = (connsPending || []).map((c: any) => c.user_a_id);
        let nameById: Record<number, string> = {};
        if (fromIds.length) {
          const { data: fromUsers, error: fuErr } = await supabase
            .from('users')
            .select('id, name')
            .in('id', fromIds);
          if (fuErr) throw fuErr;
          (fromUsers || []).forEach((u: any) => { nameById[Number(u.id)] = u.name || `User ${u.id}`; });
        }
        setPendingConns((connsPending || []).map((c: any) => ({ id: c.id, from_user_id: c.user_a_id, from_name: nameById[Number(c.user_a_id)] || `User ${c.user_a_id}` , accept_token: c.accept_token })));
      } catch (err) {
        console.log('Failed to fetch matches', err);
      } finally {
        setLoading(false);
      }
    };

  const handleAccept = async (sessionId: number) => {
    try {
      const res = await fetch('/api/accept-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId }),
      });
      if (!res.ok) throw new Error('Failed to accept');
      toast.success('Session accepted! Emails sent.');
      setPending((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      console.log('Accept failed', e);
      toast.error(`Accept failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleDecline = async (sessionId: number) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'declined' })
        .eq('id', sessionId);
      if (error) throw error;
      toast.success('Session declined');
      setPending((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e: any) {
      console.log('Decline failed', e);
      toast.error(`Decline failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleConnect = async (targetId: number) => {
    try {
      const myIdStr = localStorage.getItem('studysync-myId');
      if (!myIdStr) {
        toast.error('Please create your profile first.');
        navigate('/');
        return;
      }
      const res = await fetch('/api/connect-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_user_id: Number(myIdStr), to_user_id: Number(targetId) })
      });
      if (!res.ok) throw new Error('Failed to send connect request');
      toast.success('Connection request sent!');
    } catch (e: any) {
      console.log('Connect failed', e);
      toast.error(`Connect failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleAcceptConn = async (connId: number, token: string) => {
    try {
      window.location.href = `/api/connect-accept?cid=${connId}&t=${encodeURIComponent(token || '')}`;
    } catch (e) {
      console.log('Conn accept failed', e);
      toast.error('Failed to accept connection');
    }
  };

  const handleDeclineConn = async (connId: number) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'declined' })
        .eq('id', connId);
      if (error) throw error;
      toast.success('Connection declined');
      setPendingConns((prev) => prev.filter((c) => c.id !== connId));
    } catch (e: any) {
      console.log('Conn decline failed', e);
      toast.error(`Decline failed: ${e?.message || 'Unknown error'}`);
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

      // Default: next full hour for 60 minutes
      const now = new Date();
      const startDt = new Date(now);
      startDt.setMinutes(0, 0, 0);
      startDt.setHours(startDt.getHours() + 1);
      const endDt = new Date(startDt);
      endDt.setHours(endDt.getHours() + 1);

      const res = await fetch('/api/propose-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: Number(myIdStr),
          to_user_id: Number(targetId),
          start_at: startDt.toISOString(),
          end_at: endDt.toISOString(),
          topic: 'Study Session',
          message: ''
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to propose');
      }
      toast.success('Session proposed! Email sent to recipient.');
    } catch (e: any) {
      console.log('Failed to propose session', e);
      toast.error(`Failed to propose session: ${e?.message || 'Unknown error'}`);
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
        {/* Pending Connections */}
        {pendingConns.length > 0 && (
          <div className="mb-8 p-4 border rounded-xl bg-card">
            <h2 className="text-2xl font-semibold mb-3">Pending connection requests</h2>
            <div className="space-y-3">
              {pendingConns.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">From {c.from_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptConn(c.id, c.accept_token)} className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                    <Button onClick={() => handleDeclineConn(c.id)} variant="outline">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Sessions */}
        {pending.length > 0 && (
          <div className="mb-8 p-4 border rounded-xl bg-card">
            <h2 className="text-2xl font-semibold mb-3">Pending session requests</h2>
            <div className="space-y-3">
              {pending.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">From user #{s.from_user_id}</div>
                    <div className="text-muted-foreground">{new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAccept(s.id)} className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                    <Button onClick={() => handleDecline(s.id)} variant="outline">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                onConnect={handleConnect}
                isConnected={connectedIds.has(Number(match.profile.id))}
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
