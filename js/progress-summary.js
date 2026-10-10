// Summary of a profile's progress in one course: averages of the last lesson sessions,
// lessons passed, stars and the streak. Shown in "Mi progreso" and on the profile's home.

import { lessonStates } from './course.js';
import { currentStreak, attemptDates } from './achievements.js';

export const RECENT_SESSIONS = 10;

const average = (list, pick) => (list.length ? Math.round(list.reduce((sum, item) => sum + pick(item), 0) / list.length) : null);

/**
 * @returns {{ avgWpm: number | null, avgAccuracy: number | null, passed: number, total: number,
 *   stars: number, streak: number }}  averages are null without sessions
 */
export function summarizeProgress(profile, layoutId, course, today = new Date()) {
  const progress = profile.progress[layoutId] ?? {};
  const recent = (progress.history ?? []).slice(-RECENT_SESSIONS);
  const states = [...lessonStates(course, progress, profile.mode).values()];
  return {
    avgWpm: average(recent.filter((entry) => entry.wpm !== null), (entry) => entry.wpm),
    avgAccuracy: average(recent, (entry) => entry.accuracy),
    passed: states.filter((state) => state.status === 'completed').length,
    total: course.lessons.length,
    stars: states.reduce((sum, state) => sum + state.stars, 0),
    streak: currentStreak(attemptDates(profile), today),
  };
}
