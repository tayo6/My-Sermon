export interface ChurchLocation {
  city: string;
  state: string;       // e.g. "California", "Texas", "Lagos", "London"
  country: string;     // e.g. "United States", "United Kingdom", "Nigeria", "Australia"
  continent: string;   // e.g. "North America", "Europe", "Africa", "Oceania", "Asia", "South America"
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: string[]; // User IDs
  churchAffiliation?: string;
  location?: ChurchLocation;
  totalNotes: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

export interface Note {
  id: string;
  authorId: string;
  topic: string;
  preacher: string;
  church: string;
  series?: string; // Sermon Series name
  tags?: string[]; // Categorization tags (e.g., Faith, Worship, Prayer)
  date: string; // ISO date string (YYYY-MM-DD)
  time: string;
  content: string; // Markdown or rich text
  summary?: string; // AI Generated summary
  videoUrl?: string;
  audioUrl?: string;
  category: 'General' | 'Children' | 'Youth' | 'Conference';
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this note
  comments: Comment[];
  createdAt: number;
}

export enum ViewState {
  FEED = 'FEED',
  SEARCH = 'SEARCH',
  CHURCH_DIRECTORY = 'CHURCH_DIRECTORY',
  READ = 'READ',
  WRITE = 'WRITE',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
}

export interface Church {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  continent: string;
  leadPastor?: string;
  website?: string;
  description?: string;
  writersCount?: number;
  notesCount?: number;
}
