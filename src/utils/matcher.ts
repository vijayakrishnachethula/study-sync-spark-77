import { UserProfile } from './mockProfiles';

export interface MatchScore {
  userId: string;
  score: number;
  breakdown: {
    courseOverlap: number;
    scheduleCompatibility: number;
    studyStyleMatch: number;
  };
}

/**
 * Matcher Algorithm - O(n) complexity
 * 
 * Scoring breakdown (0-100):
 * - 60% Course Overlap: Percentage of courses in common
 * - 25% Schedule Compatibility: Check for conflicts using regex patterns
 * - 15% Study Style Match: Binary match (same style = 15, different = 0)
 */
export function calculateMatch(userProfile: UserProfile, candidateProfile: UserProfile): MatchScore {
  // 1. Course Overlap (60 points max)
  const userCourses = new Set(userProfile.courses.map(c => c.toUpperCase()));
  const candidateCourses = new Set(candidateProfile.courses.map(c => c.toUpperCase()));
  
  const commonCourses = [...userCourses].filter(course => candidateCourses.has(course));
  const totalUniqueCourses = new Set([...userCourses, ...candidateCourses]).size;
  
  const courseOverlap = totalUniqueCourses > 0 
    ? (commonCourses.length / totalUniqueCourses) * 60 
    : 0;

  // 2. Schedule Compatibility (25 points max)
  // Extract day/time patterns and check for conflicts
  const scheduleCompatibility = checkScheduleCompatibility(
    userProfile.schedule, 
    candidateProfile.schedule
  );

  // 3. Study Style Match (15 points max)
  const studyStyleMatch = userProfile.studyStyle === candidateProfile.studyStyle ? 15 : 0;

  // Total score
  const score = Math.round(courseOverlap + scheduleCompatibility + studyStyleMatch);

  return {
    userId: candidateProfile.id,
    score,
    breakdown: {
      courseOverlap: Math.round(courseOverlap),
      scheduleCompatibility: Math.round(scheduleCompatibility),
      studyStyleMatch
    }
  };
}

/**
 * Check schedule compatibility using regex patterns
 * Returns score out of 25 based on overlapping availability
 */
function checkScheduleCompatibility(schedule1: string, schedule2: string): number {
  // Extract days (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const daysRegex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/gi;
  
  const days1 = new Set((schedule1.match(daysRegex) || []).map(d => d.toLowerCase()));
  const days2 = new Set((schedule2.match(daysRegex) || []).map(d => d.toLowerCase()));
  
  // Find common days
  const commonDays = [...days1].filter(day => days2.has(day));
  
  // If no common days, perfect compatibility (no conflicts)
  if (commonDays.length === 0) {
    return 25;
  }
  
  // If there are common days, check for time conflicts
  // Simple heuristic: more common days = potential for study together
  const overlapScore = (commonDays.length / Math.max(days1.size, days2.size)) * 25;
  
  return Math.min(25, overlapScore);
}

/**
 * Find all matches for a user profile
 * Returns sorted array of matches (highest score first)
 */
export function findMatches(userProfile: UserProfile, candidates: UserProfile[]): MatchScore[] {
  return candidates
    .filter(candidate => candidate.id !== userProfile.id)
    .map(candidate => calculateMatch(userProfile, candidate))
    .sort((a, b) => b.score - a.score);
}
