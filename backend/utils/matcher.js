/**
 * Simple matcher utility for StudySync - O(n) for small n
 *
 * Scoring (0-100):
 * - 60% Course Overlap: sharedCourses.length / min(lenA, lenB)
 * - 25% Schedule Compatibility: 1 if no overlapping HH:MM tokens, else 0
 * - 15% Study Style Match: 1 if equal, else 0
 */
function computeMatch(user, candidate) {
  const userCourses = Array.isArray(user.courses) ? user.courses : [];
  const candCourses = Array.isArray(candidate.courses) ? candidate.courses : [];

  const minLen = Math.max(1, Math.min(userCourses.length, candCourses.length));
  const userSet = new Set(userCourses.map((c) => String(c).trim().toUpperCase()));
  const shared = candCourses
    .map((c) => String(c).trim().toUpperCase())
    .filter((c) => userSet.has(c));

  const courseFactor = shared.length / minLen; // 0..1

  const timeRegex = /\b\d{1,2}:\d{2}\b/g;
  const timesA = new Set((String(user.schedule || '').match(timeRegex) || []).map((t) => t));
  const timesB = new Set((String(candidate.schedule || '').match(timeRegex) || []).map((t) => t));
  let overlap = false;
  for (const t of timesA) {
    if (timesB.has(t)) {
      overlap = true;
      break;
    }
  }
  const scheduleFactor = overlap ? 0 : 1;

  const styleFactor = String(user.studyStyle || '').toLowerCase() === String(candidate.studyStyle || '').toLowerCase() ? 1 : 0;

  const score01 = 0.6 * courseFactor + 0.25 * scheduleFactor + 0.15 * styleFactor;
  const score = Math.round(score01 * 100);

  return {
    userId: candidate.id,
    score,
    breakdown: {
      courseOverlap: Math.round(courseFactor * 60),
      scheduleCompatibility: Math.round(scheduleFactor * 25),
      studyStyleMatch: Math.round(styleFactor * 15),
    },
  };
}

module.exports = { computeMatch };


