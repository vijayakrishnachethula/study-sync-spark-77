import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaClock, FaBrain, FaRocket, FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/utils/mockProfiles';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { ProTipsModal } from '@/components/ProTipsModal';
import { TerminalModal } from '@/components/TerminalModal';
import { useToast } from '@/hooks/use-toast';

const studyStyles: UserProfile['studyStyle'][] = ['Visual', 'Auditory', 'Kinesthetic', 'Reader'];

const styleIcons = {
  Visual: '👁️',
  Auditory: '👂',
  Kinesthetic: '✋',
  Reader: '📖',
};

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    courses: '',
    schedule: '',
    studyStyle: '' as UserProfile['studyStyle'] | '',
    phone: '',
    email: '',
    instagram: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.courses.trim()) {
      newErrors.courses = 'At least one course is required';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule is required';
    }

    if (!formData.studyStyle) {
      newErrors.studyStyle = 'Study style is required';
    }

    // Require email for notifications
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required for notifications';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Parse courses
    const courses = formData.courses.split(',').map(c => c.trim()).filter(c => c);

    // Create user profile
    const userProfile: UserProfile = {
      id: 'user',
      name: formData.name,
      courses,
      schedule: formData.schedule,
      studyStyle: formData.studyStyle as UserProfile['studyStyle'],
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      instagram: formData.instagram || undefined,
    };

    // Save basic profile locally regardless of backend status
    localStorage.setItem('studysync-profile', JSON.stringify(userProfile));

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userProfile.name,
          courses: userProfile.courses,
          schedule: userProfile.schedule,
          study_style: userProfile.studyStyle as any,
          bio: userProfile.bio || '',
          phone: userProfile.phone || '',
          email: userProfile.email || '',
          instagram: userProfile.instagram || '',
        })
        .select('id')
        .single();

      if (error) throw error;
      if (data?.id) {
        localStorage.setItem('studysync-myId', String(data.id));
      }
      setIsSubmitting(false);
      navigate('/matches');
    } catch (err) {
      console.log('Failed to save profile to Supabase', err);
      setIsSubmitting(false);
      navigate('/matches');
    }

    setTimeout(() => {
      setShowProTips(true);
      setTimeout(() => {
        toast({
          title: 'Profile Created!',
          description: 'Finding your perfect study matches...',
        });
        navigate('/matches');
      }, 3000);
    }, 1000);
  };

  // Easter egg: detect "debugme" in courses
  const handleCoursesChange = (value: string) => {
    setFormData({ ...formData, courses: value });
    if (value.toLowerCase().includes('debugme')) {
      setShowTerminal(true);
      // Remove "debugme" from actual value
      setFormData({ ...formData, courses: value.replace(/debugme/gi, '').trim() });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="inline-block mb-4"
          >
            <FaBook className="text-6xl text-primary" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Find Your Study Match
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect with CS students who share your courses, schedule, and learning style
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-card p-8 rounded-2xl shadow-elegant space-y-6"
        >
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={errors.name ? 'animate-shake' : ''}
          >
            <Label htmlFor="name" className="text-lg font-semibold flex items-center gap-2">
              <FaRocket className="text-primary" />
              Your Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Alex Chen"
              className="mt-2 focus:ring-2 focus:ring-primary focus:scale-[1.01] transition-all"
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </motion.div>

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={errors.courses ? 'animate-shake' : ''}
          >
            <Label htmlFor="courses" className="text-lg font-semibold flex items-center gap-2">
              <FaBook className="text-primary" />
              Your Courses (comma-separated)
            </Label>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <Input
                id="courses"
                value={formData.courses}
                onChange={(e) => handleCoursesChange(e.target.value)}
                placeholder="CS101, CS220, MATH215 (try 'debugme'!)"
                className="mt-2 focus:ring-2 focus:ring-primary transition-all animate-pulse-soft"
              />
            </motion.div>
            {errors.courses && <p className="text-destructive text-sm mt-1">{errors.courses}</p>}
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={errors.schedule ? 'animate-shake' : ''}
          >
            <Label htmlFor="schedule" className="text-lg font-semibold flex items-center gap-2">
              <FaClock className="text-primary" />
              Your Available Schedule
            </Label>
            <Textarea
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Mon/Wed 2-5pm, Fri 10am-2pm"
              className="mt-2 focus:ring-2 focus:ring-primary transition-all resize-none"
              rows={3}
            />
            {errors.schedule && <p className="text-destructive text-sm mt-1">{errors.schedule}</p>}
          </motion.div>

          {/* Contact Details (optional) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone (optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 123 4567"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="mt-2"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="instagram" className="text-sm font-medium">Instagram (optional)</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@alex"
                className="mt-2"
              />
            </div>
          </motion.div>

          {/* Study Style - Learner Orbs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={errors.studyStyle ? 'animate-shake' : ''}
          >
            <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FaBrain className="text-primary" />
              Your Study Style
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {studyStyles.map((style, idx) => (
                <motion.label
                  key={style}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.1, type: 'spring' }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    boxShadow: '0 0 20px rgba(74, 144, 226, 0.5)'
                  }}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 cursor-pointer transition-all
                    ${formData.studyStyle === style 
                      ? 'border-primary bg-primary/10 shadow-glow' 
                      : 'border-border hover:border-primary/50 bg-gradient-card'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="studyStyle"
                    value={style}
                    checked={formData.studyStyle === style}
                    onChange={(e) => setFormData({ ...formData, studyStyle: e.target.value as UserProfile['studyStyle'] })}
                    className="sr-only"
                  />
                  
                  {/* Learner Orb */}
                  <motion.div
                    animate={{ 
                      scale: formData.studyStyle === style ? [1, 1.1, 1] : 1,
                      rotate: formData.studyStyle === style ? [0, 360] : 0
                    }}
                    transition={{ duration: 0.5 }}
                    className={`
                      text-4xl w-16 h-16 flex items-center justify-center rounded-full
                      ${formData.studyStyle === style 
                        ? 'gradient-primary shadow-glow' 
                        : 'bg-muted'
                      }
                    `}
                  >
                    {styleIcons[style]}
                  </motion.div>
                  
                  <span className="font-medium text-center">{style}</span>
                  
                  {/* Checkmark */}
                  {formData.studyStyle === style && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <FaCheckCircle className="text-2xl text-secondary" />
                    </motion.div>
                  )}
                </motion.label>
              ))}
            </div>
            {errors.studyStyle && <p className="text-destructive text-sm mt-1">{errors.studyStyle}</p>}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg py-6 gradient-primary text-white font-semibold shadow-elegant hover:shadow-glow transition-all relative overflow-hidden"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      🔍
                    </motion.div>
                    Matching...
                  </span>
                ) : (
                  'Find Study Partners'
                )}
              </Button>
            </motion.div>
          </motion.div>
        </motion.form>
      </div>

      {/* Modals */}
      <ProTipsModal 
        isOpen={showProTips} 
        onClose={() => setShowProTips(false)}
        studyStyle={formData.studyStyle || 'Visual'}
      />
      <TerminalModal 
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
      />
    </div>
  );
};

export default ProfileForm;
