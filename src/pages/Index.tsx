import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaClock, FaBrain, FaRocket } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/utils/mockProfiles';
import { useToast } from '@/hooks/use-toast';

const studyStyles: UserProfile['studyStyle'][] = ['Visual', 'Auditory', 'Kinesthetic', 'Reader'];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    courses: '',
    schedule: '',
    studyStyle: '' as UserProfile['studyStyle'] | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Parse courses (comma-separated)
    const courses = formData.courses.split(',').map(c => c.trim()).filter(c => c);

    // Create user profile
    const userProfile: UserProfile = {
      id: 'user',
      name: formData.name,
      courses,
      schedule: formData.schedule,
      studyStyle: formData.studyStyle as UserProfile['studyStyle'],
    };

    // Save to localStorage
    localStorage.setItem('studysync-profile', JSON.stringify(userProfile));

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Profile Created!',
        description: 'Finding your perfect study matches...',
      });
      
      navigate('/matches');
    }, 1000);
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="inline-block mb-4"
          >
            <FaBook className="text-6xl gradient-primary bg-clip-text text-transparent" style={{ WebkitTextFillColor: 'transparent' }} />
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
              className="mt-2 focus:ring-2 focus:ring-primary transition-all"
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </motion.div>

          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={errors.courses ? 'animate-shake' : ''}
          >
            <Label htmlFor="courses" className="text-lg font-semibold flex items-center gap-2">
              <FaBook className="text-primary" />
              Your Courses (comma-separated)
            </Label>
            <Input
              id="courses"
              value={formData.courses}
              onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
              placeholder="CS101, CS220, MATH215"
              className="mt-2 focus:ring-2 focus:ring-primary transition-all"
            />
            {errors.courses && <p className="text-destructive text-sm mt-1">{errors.courses}</p>}
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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

          {/* Study Style */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className={errors.studyStyle ? 'animate-shake' : ''}
          >
            <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
              <FaBrain className="text-primary" />
              Your Study Style
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {studyStyles.map((style, idx) => (
                <motion.label
                  key={style}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className={`
                    flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${formData.studyStyle === style 
                      ? 'border-primary bg-primary/10 shadow-glow' 
                      : 'border-border hover:border-primary/50'
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
                  <span className="font-medium">{style}</span>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-lg py-6 gradient-primary text-white font-semibold shadow-elegant hover:shadow-glow transition-all"
            >
              {isSubmitting ? 'Finding Matches...' : 'Find Study Partners'}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default Index;
