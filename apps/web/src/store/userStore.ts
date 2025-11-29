import { createSignal } from 'solid-js';

export interface User {
  userId: string;
  phoneNumber: string;
  name: string;
  occupation: string;
  icon: string;
  personaType: 'gig_worker' | 'daily_wage';
}

// User definitions matching backend seed
export const AVAILABLE_USERS: Omit<User, 'userId'>[] = [
  {
    phoneNumber: '+919876500001',
    name: 'Ravi',
    occupation: 'Swiggy Delivery Partner',
    icon: '🚴',
    personaType: 'gig_worker',
  },
  {
    phoneNumber: '+919876500002',
    name: 'Ramesh',
    occupation: 'Construction Worker',
    icon: '👷',
    personaType: 'daily_wage',
  },
  {
    phoneNumber: '+919876500003',
    name: 'Vivek',
    occupation: 'IT Professional',
    icon: '💻',
    personaType: 'gig_worker',
  },
];

export const [currentUser, setCurrentUser] = createSignal<User | null>(null);

export function setUser(user: User) {
  setCurrentUser(user);
  // Store in localStorage for persistence
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function loadUserFromStorage() {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      return user;
    } catch (e) {
      console.error('Error loading user from storage:', e);
    }
  }
  return null;
}

export function clearUser() {
  setCurrentUser(null);
  localStorage.removeItem('currentUser');
}

