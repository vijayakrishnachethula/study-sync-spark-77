import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-elegant"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <FaBook className="text-2xl text-primary" />
          </motion.div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StudySync
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/"
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </Link>
          <Link 
            to="/matches"
            className={`font-medium transition-colors ${
              location.pathname === '/matches' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Matches
          </Link>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FaMoon className="text-lg text-primary" />
            ) : (
              <FaSun className="text-lg text-secondary" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};
