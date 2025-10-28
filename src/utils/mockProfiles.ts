export interface UserProfile {
  id: string;
  name: string;
  courses: string[];
  schedule: string;
  studyStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reader';
  bio?: string;
}

export const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Alex Chen',
    courses: ['CS101', 'CS220', 'MATH215', 'CS310'],
    schedule: 'Mon/Wed 2-5pm, Fri 10am-2pm',
    studyStyle: 'Visual',
    bio: 'Love whiteboarding algorithms and flowcharts!'
  },
  {
    id: '2',
    name: 'Jordan Smith',
    courses: ['CS220', 'CS310', 'CS415', 'MATH220'],
    schedule: 'Tue/Thu 3-6pm, Sat 1-4pm',
    studyStyle: 'Auditory',
    bio: 'Best learner through discussion and explaining concepts.'
  },
  {
    id: '3',
    name: 'Sam Martinez',
    courses: ['CS101', 'CS310', 'CS405', 'PHYS201'],
    schedule: 'Mon/Wed 10am-1pm, Thu 2-5pm',
    studyStyle: 'Kinesthetic',
    bio: 'Hands-on coding sessions are my jam!'
  },
  {
    id: '4',
    name: 'Taylor Johnson',
    courses: ['CS220', 'MATH215', 'CS415', 'CS505'],
    schedule: 'Tue/Thu 1-4pm, Fri 3-6pm',
    studyStyle: 'Reader',
    bio: 'Prefer reading docs and textbooks before coding.'
  },
  {
    id: '5',
    name: 'Morgan Lee',
    courses: ['CS101', 'CS220', 'CS310', 'ENG201'],
    schedule: 'Mon/Wed 3-6pm, Sat 10am-1pm',
    studyStyle: 'Visual',
    bio: 'Diagrams and mind maps help me understand complex topics.'
  }
];
