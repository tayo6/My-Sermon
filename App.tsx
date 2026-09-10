import React, { useState, useEffect, useMemo } from 'react';
import { Feed } from './components/Feed';
import { NoteEditor } from './components/NoteEditor';
import { NoteView } from './components/NoteView';
import { Leaderboard } from './components/Leaderboard';
import { SearchView } from './components/SearchView';
import { ChurchDirectoryView } from './components/ChurchDirectoryView';
import { Button } from './components/Button';
import { User, Note, ViewState, Church } from './types';
import { INITIAL_CHURCHES } from './data/churchDirectory';
import { 
  PenSquare, 
  Home, 
  Award, 
  Search, 
  Bell, 
  Sparkles, 
  Globe2, 
  Building2, 
  MapPin, 
  Compass,
  Users
} from 'lucide-react';

// --- MOCK USERS WITH GEOGRAPHIC LOCATIONS (STATES, COUNTRIES, CONTINENTS) ---
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarahj',
    avatar: 'https://picsum.photos/100/100?random=1',
    bio: 'Sunday School Teacher & Mom. Taking notes at Grace Community Church.',
    followers: 142,
    following: ['2', '3', '4'],
    churchAffiliation: 'Grace Community Church',
    location: {
      city: 'Sun Valley',
      state: 'California',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 15
  },
  {
    id: '3',
    name: 'David Chen',
    handle: '@dchen_youth',
    avatar: 'https://picsum.photos/100/100?random=3',
    bio: 'Youth leader and scripture scribe in California. Loving the Word.',
    followers: 89,
    following: ['1', '2'],
    churchAffiliation: 'Grace Community Church',
    location: {
      city: 'Sun Valley',
      state: 'California',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 8
  },
  {
    id: '4',
    name: 'Hannah Morales',
    handle: '@hannah_worship',
    avatar: 'https://picsum.photos/100/100?random=11',
    bio: 'Worship leader and prayer scribe based in Northern California.',
    followers: 215,
    following: ['1', '3'],
    churchAffiliation: 'Bethel Church',
    location: {
      city: 'Redding',
      state: 'California',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 12
  },
  {
    id: '5',
    name: 'Marcus Vance',
    handle: '@marcus_la',
    avatar: 'https://picsum.photos/100/100?random=12',
    bio: 'Urban missionary documenting theological expositions in Los Angeles, California.',
    followers: 178,
    following: ['1', '2'],
    churchAffiliation: 'Reality LA',
    location: {
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 9
  },
  {
    id: '6',
    name: 'Chloe Bennett',
    handle: '@chloebennett',
    avatar: 'https://picsum.photos/100/100?random=13',
    bio: 'Documenting community outreach sermons in San Diego, California.',
    followers: 110,
    following: ['4', '5'],
    churchAffiliation: 'The Rock Church',
    location: {
      city: 'San Diego',
      state: 'California',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 6
  },
  {
    id: '2',
    name: 'Rev. Mark Thompson',
    handle: '@revmark',
    avatar: 'https://picsum.photos/100/100?random=2',
    bio: 'Senior Pastor at City Light Cathedral. Sharing insights & sermon notes.',
    followers: 540,
    following: ['1'],
    churchAffiliation: 'City Light Cathedral',
    location: {
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 42
  },
  {
    id: '7',
    name: 'Austin Wright',
    handle: '@austin_tx',
    avatar: 'https://picsum.photos/100/100?random=14',
    bio: 'Documenting expository teaching across North Texas congregations.',
    followers: 195,
    following: ['2'],
    churchAffiliation: 'The Village Church',
    location: {
      city: 'Flower Mound',
      state: 'Texas',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 14
  },
  {
    id: '8',
    name: 'Olumide Adebayo',
    handle: '@olumide_scribe',
    avatar: 'https://picsum.photos/100/100?random=15',
    bio: 'Leadership & discipleship note taker in Lagos, Nigeria.',
    followers: 320,
    following: ['1', '2'],
    churchAffiliation: 'The Elevation Church',
    location: {
      city: 'Lekki',
      state: 'Lagos',
      country: 'Nigeria',
      continent: 'Africa'
    },
    totalNotes: 22
  },
  {
    id: '9',
    name: 'Blessing Okonjo',
    handle: '@blessing_o',
    avatar: 'https://picsum.photos/100/100?random=16',
    bio: 'Kingdom principles and purpose-driven sermon notes in Lagos.',
    followers: 245,
    following: ['8'],
    churchAffiliation: 'Daystar Christian Centre',
    location: {
      city: 'Ikeja',
      state: 'Lagos',
      country: 'Nigeria',
      continent: 'Africa'
    },
    totalNotes: 18
  },
  {
    id: '10',
    name: 'Edward Sterling',
    handle: '@edward_htb',
    avatar: 'https://picsum.photos/100/100?random=17',
    bio: 'Alpha course and London church notes contributor.',
    followers: 290,
    following: ['1', '7'],
    churchAffiliation: 'Holy Trinity Brompton (HTB)',
    location: {
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      continent: 'Europe'
    },
    totalNotes: 17
  },
  {
    id: '11',
    name: 'Liam Walker',
    handle: '@liam_sydney',
    avatar: 'https://picsum.photos/100/100?random=18',
    bio: 'Documenting praise, theology, and worship ministry from Sydney.',
    followers: 180,
    following: ['4'],
    churchAffiliation: 'Hillsong Church',
    location: {
      city: 'Sydney',
      state: 'New South Wales',
      country: 'Australia',
      continent: 'Oceania'
    },
    totalNotes: 11
  },
  {
    id: 'me',
    name: 'Guest User',
    handle: '@guest',
    avatar: 'https://picsum.photos/100/100?random=4',
    bio: 'Aspiring sermon scribe and lifelong student of the Word.',
    followers: 0,
    following: ['1', '8'],
    churchAffiliation: 'Hope Chapel',
    location: {
      city: 'Charlotte',
      state: 'North Carolina',
      country: 'United States',
      continent: 'North America'
    },
    totalNotes: 0
  }
];

// --- MOCK NOTES ACROSS DIFFERENT CHURCHES AND REGIONS ---
const MOCK_NOTES: Note[] = [
  // California - Grace Community Church
  {
    id: '104',
    authorId: '3',
    topic: 'The Sound of Worship',
    preacher: 'Pastor Chris Tomlin',
    church: 'Grace Community Church',
    series: 'Heart of Worship',
    tags: ['Worship', 'Praise', 'Spiritual Warfare', 'Prayer'],
    date: '2023-11-05',
    time: '06:00 PM',
    category: 'General',
    content: "## The Heart of Worship\n\nIt's not about the music, it's about the posture of our hearts. When we sing, we are declaring war on the lies of the enemy.\n\n### Why we sing?\n- To remember God's faithfulness.\n- To shift our atmosphere.\n- To unify the body.\n\nI managed to record the bridge of the final song, it was powerful (check the audio below).\n\n## Practical Application\nStart your day with a song of praise before you look at your phone.",
    likes: 56,
    likedBy: ['1', '2'],
    comments: [],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    createdAt: Date.now() - 2000000
  },
  {
    id: '106',
    authorId: '1',
    topic: 'The Secret Place of the Most High',
    preacher: 'Pastor Chris Tomlin',
    church: 'Grace Community Church',
    series: 'Heart of Worship',
    tags: ['Worship', 'Prayer', 'Intimacy', 'Presence'],
    date: '2023-11-19',
    time: '06:00 PM',
    category: 'General',
    content: "Psalm 91: He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.\n\n### The Posture of Abiding\n- Intimacy with God is not an event, but a lifestyle of abiding.\n- Silence and solitude in prayer creates space for the Holy Spirit to reveal deep truths.",
    likes: 31,
    likedBy: ['2', '4'],
    comments: [],
    createdAt: Date.now() - 1000000
  },
  {
    id: '102',
    authorId: '1',
    topic: "David and Goliath: A Kid's Perspective",
    preacher: 'Mrs. Higgins',
    church: 'Grace Community Church',
    series: 'Heroes of Faith',
    tags: ['Courage', 'Children', 'Faith', 'Trust'],
    date: '2023-10-22',
    time: '09:00 AM',
    category: 'Children',
    content: "Today in Sunday School we learned that no giant is too big for God. David was small, but his faith was BIG.\n\nFive smooth stones represented:\n- Faith\n- Obedience\n- Courage\n- Trust\n- Preparation\n\nRemember to pray when you are scared!",
    likes: 12,
    likedBy: [],
    comments: [],
    createdAt: Date.now() - 5000000
  },

  // California - Bethel Church
  {
    id: '107',
    authorId: '4',
    topic: 'Hosting the Manifest Presence',
    preacher: 'Bill Johnson',
    church: 'Bethel Church',
    series: 'Atmosphere of Heaven',
    tags: ['Presence', 'Holy Spirit', 'Revival', 'Faith'],
    date: '2023-11-12',
    time: '10:00 AM',
    category: 'General',
    content: "When we prioritize the presence of God above our agendas, miracles become natural byproducts of His nearness.\n\n### Core Realities:\n1. Awareness of the Holy Spirit.\n2. Peace as an offensive spiritual weapon.\n3. Gratitude unlocks supernatural sight.",
    likes: 64,
    likedBy: ['1', '3', '5'],
    comments: [],
    createdAt: Date.now() - 3500000
  },

  // California - Reality LA
  {
    id: '108',
    authorId: '5',
    topic: 'Seeking the Peace of the City',
    preacher: 'Jeremy Treat',
    church: 'Reality LA',
    series: 'The City & The Kingdom',
    tags: ['Culture', 'City Renewal', 'Gospel', 'Community'],
    date: '2023-11-05',
    time: '11:00 AM',
    category: 'General',
    content: "Jeremiah 29:7 calls us to seek the welfare of the city where we are placed. In Los Angeles, our Christian witness is shown through self-giving love, hospitality, and relentless truth.",
    likes: 42,
    likedBy: ['1', '4'],
    comments: [],
    createdAt: Date.now() - 2500000
  },

  // California - The Rock Church
  {
    id: '109',
    authorId: '6',
    topic: 'Pervasive Hope in Dark Times',
    preacher: 'Miles McPherson',
    church: 'The Rock Church',
    series: 'Do Something',
    tags: ['Evangelism', 'Service', 'Hope', 'Outreach'],
    date: '2023-10-29',
    time: '09:30 AM',
    category: 'General',
    content: "God didn't call us to be spectators in church buildings; He called us to be the hands and feet of Jesus on the streets of San Diego and across the world.",
    likes: 29,
    likedBy: ['5'],
    comments: [],
    createdAt: Date.now() - 6000000
  },

  // Illinois - City Light Cathedral
  {
    id: '101',
    authorId: '2',
    topic: 'Walking in Divine Purpose',
    preacher: 'Rev. Mark Thompson',
    church: 'City Light Cathedral',
    series: 'Identity & Destiny',
    tags: ['Purpose', 'Destiny', 'Faith', 'Identity', 'Calling'],
    date: '2023-10-22',
    time: '10:30 AM',
    category: 'General',
    content: "The purpose of a thing is found in the mind of its creator. We often look to our circumstances to define us, but God looks at His original intent.\n\nKey Points:\n1. Purpose precedes production.\n2. You are not a mistake.\n3. God's timing is perfect.\n\nScripture references: Jeremiah 29:11, Ephesians 2:10.\n\nQuote: \"If you don't know the purpose of a thing, abuse is inevitable.\" - Myles Munroe (cited).",
    likes: 45,
    likedBy: ['1', '3'],
    comments: [
      { id: 'c1', userId: '1', userName: 'Sarah Jenkins', userAvatar: MOCK_USERS[0].avatar, content: 'This was exactly what I needed to hear today!', timestamp: new Date() }
    ],
    createdAt: Date.now() - 10000000
  },
  {
    id: '105',
    authorId: '2',
    topic: 'Standing Unshakable in the Storm',
    preacher: 'Rev. Mark Thompson',
    church: 'City Light Cathedral',
    series: 'Identity & Destiny',
    tags: ['Faith', 'Courage', 'Trials', 'Spiritual Warfare'],
    date: '2023-11-12',
    time: '10:30 AM',
    category: 'General',
    content: "Part 2 of Identity & Destiny sermon series.\n\nStorms do not create your character, they reveal whose foundation you stand upon.\n\n### The Anchor of Hope\n- Faith is not the absence of doubt, but the courage to trust.\n- Matthew 7:24-27: Building your house upon the Rock.",
    likes: 38,
    likedBy: ['3'],
    comments: [],
    createdAt: Date.now() - 4000000
  },

  // Texas - The Village Church
  {
    id: '110',
    authorId: '7',
    topic: 'The Weight of Glory & Grace',
    preacher: 'Matt Chandler',
    church: 'The Village Church',
    series: 'Grace & Truth',
    tags: ['Grace', 'Gospel', 'Sovereignty', 'Theology'],
    date: '2023-11-19',
    time: '11:15 AM',
    category: 'General',
    content: "God is not waiting for you to clean yourself up before He receives you. The Gospel is that while we were still sinners, Christ died for us.\n\nRomans 8: Nothing can separate us from the fierce, unfailing love of Christ.",
    likes: 51,
    likedBy: ['1', '2', '8'],
    comments: [],
    createdAt: Date.now() - 900000
  },

  // Nigeria - The Elevation Church
  {
    id: '111',
    authorId: '8',
    topic: 'Greatness by Design',
    preacher: 'Godman Akinlabi',
    church: 'The Elevation Church',
    series: 'Kingdom Excellence',
    tags: ['Leadership', 'Excellence', 'Destiny', 'Faith'],
    date: '2023-11-12',
    time: '09:00 AM',
    category: 'General',
    content: "You are created to solve problems in your generation. Excellence in marketplace ministry is a direct reflection of God's wisdom in you.",
    likes: 72,
    likedBy: ['1', '9', '10'],
    comments: [],
    createdAt: Date.now() - 3200000
  },

  // UK - Holy Trinity Brompton (HTB)
  {
    id: '112',
    authorId: '10',
    topic: 'Why Faith Makes Sense in Modern Europe',
    preacher: 'Nicky Gumbel',
    church: 'Holy Trinity Brompton (HTB)',
    series: 'Alpha Foundations',
    tags: ['Apologetics', 'Faith', 'Doubt', 'Alpha'],
    date: '2023-11-05',
    time: '06:30 PM',
    category: 'General',
    content: "Christianity is not blind faith; it is trust in the living Person of Jesus Christ supported by historical reliability and transformed hearts.",
    likes: 48,
    likedBy: ['1', '7'],
    comments: [],
    createdAt: Date.now() - 2100000
  },

  // North Carolina - Hope Chapel
  {
    id: '103',
    authorId: '3',
    topic: 'Radical Generosity',
    preacher: 'Ps. Michael Scott',
    church: 'Hope Chapel',
    series: 'Kingdom Economics',
    tags: ['Generosity', 'Giving', 'Stewardship', 'Faith'],
    date: '2023-10-29',
    time: '11:00 AM',
    category: 'General',
    content: "Generosity isn't just about money, it's about a posture of the heart. When we hold things loosely, God can entrust us with more.\n\nKey takeaway: Live with open hands and watch God multiply your capacity to bless others.",
    likes: 23,
    likedBy: ['2'],
    comments: [],
    createdAt: Date.now() - 15000000
  }
];

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(ViewState.FEED);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[11]); // Guest user
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [churches] = useState<Church[]>(INITIAL_CHURCHES);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Search parameters when navigating between search views
  const [searchParams, setSearchParams] = useState<{
    query?: string;
    church?: string | null;
    preacher?: string | null;
    series?: string | null;
    tag?: string | null;
    initialTab?: 'notes' | 'churches';
  }>({
    initialTab: 'notes'
  });

  // Dynamic available lists derived from notes
  const knownChurches = useMemo(() => Array.from(new Set(notes.map(n => n.church).filter(Boolean))), [notes]);
  const knownPreachers = useMemo(() => Array.from(new Set(notes.map(n => n.preacher).filter(Boolean))), [notes]);
  const knownSeries = useMemo(() => Array.from(new Set(notes.map(n => n.series).filter(Boolean) as string[])), [notes]);

  // Periodic notification ticker
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => ["New sermon note published from Grace Community Church in California!", ...prev]);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveNote = (noteData: Partial<Note>) => {
    const newNote: Note = {
      ...noteData as Note,
      id: Date.now().toString(),
      likedBy: [],
    };
    setNotes([newNote, ...notes]);
    setViewState(ViewState.FEED);
    
    // Update local user stats
    setCurrentUser(prev => ({ ...prev, totalNotes: prev.totalNotes + 1 }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, totalNotes: u.totalNotes + 1 } : u));
  };

  const handleFollow = (userId: string) => {
    if (currentUser.following.includes(userId)) {
      setCurrentUser(prev => ({
        ...prev,
        following: prev.following.filter(id => id !== userId)
      }));
    } else {
      setCurrentUser(prev => ({
        ...prev,
        following: [...prev.following, userId]
      }));
    }
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          followers: currentUser.following.includes(userId) ? u.followers - 1 : u.followers + 1
        };
      }
      return u;
    }));
  };

  const handleAddComment = (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          comments: [...note.comments, {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content,
            timestamp: new Date()
          }]
        };
      }
      return note;
    }));
  };

  const handleLike = (noteId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const hasLiked = note.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked 
          ? note.likedBy.filter(id => id !== currentUser.id)
          : [...note.likedBy, currentUser.id];
        
        const updatedNote = {
          ...note,
          likes: newLikedBy.length,
          likedBy: newLikedBy
        };
        
        if (selectedNote?.id === noteId) {
          setSelectedNote(updatedNote);
        }
        
        return updatedNote;
      }
      return note;
    }));
  };

  const handleOpenSearchWithFilter = (params?: {
    query?: string;
    church?: string | null;
    preacher?: string | null;
    series?: string | null;
    tag?: string | null;
    initialTab?: 'notes' | 'churches';
  }) => {
    setSearchParams(params || { initialTab: 'notes' });
    setSelectedNote(null);
    setViewState(ViewState.SEARCH);
  };

  const handleTagClick = (value: string, type: 'church' | 'preacher' | 'series' | 'tag') => {
    const params: typeof searchParams = { initialTab: 'notes' };
    if (type === 'church') params.church = value;
    if (type === 'preacher') params.preacher = value;
    if (type === 'series') params.series = value;
    if (type === 'tag') params.tag = value;
    handleOpenSearchWithFilter(params);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfbf9]">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-stone-200 bg-white sticky top-0 z-30 shadow-2xs">
        <h1 
          onClick={() => { setViewState(ViewState.FEED); setSelectedNote(null); }}
          className="font-serif font-bold text-xl text-stone-900 tracking-tight cursor-pointer"
        >
          SermonStack
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSearchWithFilter({ initialTab: 'churches' })}
            className={`p-2 rounded-lg transition-colors ${
              viewState === ViewState.SEARCH && searchParams.initialTab === 'churches' && !selectedNote 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Churches & Writers Directory"
          >
            <Globe2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOpenSearchWithFilter({ initialTab: 'notes' })}
            className={`p-2 rounded-lg transition-colors ${
              viewState === ViewState.SEARCH && searchParams.initialTab === 'notes' && !selectedNote 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Search sermon notes"
          >
            <Search className="w-5 h-5" />
          </button>
          <Button size="sm" onClick={() => { setViewState(ViewState.WRITE); setSelectedNote(null); }}>
            <PenSquare className="w-4 h-4 mr-1" /> Write
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation (Desktop) / Bottom Bar (Mobile) */}
      <nav className="fixed bottom-0 w-full md:relative md:w-64 md:h-screen bg-white md:bg-stone-50 border-t md:border-t-0 md:border-r border-stone-200 z-40 flex md:flex-col justify-around md:justify-start md:p-6 md:space-y-4">
        <div className="hidden md:block mb-4">
          <h1 
            onClick={() => { setViewState(ViewState.FEED); setSelectedNote(null); }}
            className="font-serif font-bold text-2xl text-stone-900 tracking-tight mb-1 cursor-pointer"
          >
            SermonStack
          </h1>
          <p className="text-xs text-stone-500 font-medium">Tag. Categorize. Discover.</p>
        </div>

        {/* 1. Discover Feed */}
        <button 
          onClick={() => { setViewState(ViewState.FEED); setSelectedNote(null); }}
          className={`p-3 md:p-2.5 md:w-full md:rounded-xl md:flex md:items-center md:space-x-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-all ${
            viewState === ViewState.FEED && !selectedNote ? 'text-orange-600 font-bold md:bg-orange-50 md:text-orange-700' : ''
          }`}
        >
          <Home className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline text-sm">Discover Feed</span>
        </button>

        {/* 2. Churches & Writers Directory */}
        <button 
          onClick={() => { handleOpenSearchWithFilter({ initialTab: 'churches' }); }}
          className={`p-3 md:p-2.5 md:w-full md:rounded-xl md:flex md:items-center md:space-x-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-all ${
            viewState === ViewState.SEARCH && searchParams.initialTab === 'churches' && !selectedNote ? 'text-orange-600 font-bold md:bg-orange-50 md:text-orange-700' : ''
          }`}
          title="Find churches and writers by state, country, or continent"
        >
          <Globe2 className="w-6 h-6 md:w-5 md:h-5 text-emerald-600" />
          <span className="hidden md:inline text-sm">Churches Directory</span>
        </button>

        {/* 3. Search Sermon Notes */}
        <button 
          onClick={() => { handleOpenSearchWithFilter({ initialTab: 'notes' }); }}
          className={`p-3 md:p-2.5 md:w-full md:rounded-xl md:flex md:items-center md:space-x-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-all ${
            viewState === ViewState.SEARCH && searchParams.initialTab === 'notes' && !selectedNote ? 'text-orange-600 font-bold md:bg-orange-50 md:text-orange-700' : ''
          }`}
        >
          <Search className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline text-sm">Search Notes</span>
        </button>

        {/* 4. Community Voices */}
        <button 
          onClick={() => { setViewState(ViewState.LEADERBOARD); setSelectedNote(null); }}
          className={`p-3 md:p-2.5 md:w-full md:rounded-xl md:flex md:items-center md:space-x-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-all ${
            viewState === ViewState.LEADERBOARD && !selectedNote ? 'text-orange-600 font-bold md:bg-orange-50 md:text-orange-700' : ''
          }`}
        >
          <Award className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline text-sm">Community Voices</span>
        </button>

        {/* Write Button (Desktop) */}
        <div className="hidden md:block pt-4 border-t border-stone-200">
          <Button className="w-full justify-center shadow-xs" onClick={() => { setViewState(ViewState.WRITE); setSelectedNote(null); }}>
            <PenSquare className="w-4 h-4 mr-2" />
            New Sermon Note
          </Button>
        </div>

        {/* Mobile Only Create Button in Nav */}
        <button 
          onClick={() => { setViewState(ViewState.WRITE); setSelectedNote(null); }}
          className="md:hidden p-3 text-orange-600"
        >
          <PenSquare className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-[calc(100vh-60px)] md:h-screen pb-16 md:pb-0">
        {/* Notification Ticker */}
        {notifications.length > 0 && viewState === ViewState.FEED && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-center text-xs font-medium text-orange-800 animate-in slide-in-from-top duration-500">
            <Bell className="w-3.5 h-3.5 mr-2 text-orange-600 shrink-0" />
            <span>{notifications[0]}</span>
          </div>
        )}

        {/* View Switcher */}
        {viewState === ViewState.WRITE ? (
          <NoteEditor 
            currentUser={currentUser} 
            onCancel={() => setViewState(ViewState.FEED)}
            onSave={handleSaveNote}
            knownChurches={knownChurches}
            knownPreachers={knownPreachers}
            knownSeries={knownSeries}
          />
        ) : selectedNote ? (
          <NoteView 
            note={selectedNote}
            author={allUsers.find(u => u.id === selectedNote.authorId) || allUsers[0]}
            currentUser={currentUser}
            allNotes={notes}
            onBack={() => setSelectedNote(null)}
            onFollow={handleFollow}
            onLike={handleLike}
            onAddComment={handleAddComment}
            onSelectNote={(note) => setSelectedNote(note)}
            onTagClick={handleTagClick}
          />
        ) : viewState === ViewState.SEARCH ? (
          <SearchView
            notes={notes}
            users={allUsers}
            churches={churches}
            onNoteClick={(note) => setSelectedNote(note)}
            currentUser={currentUser}
            onFollow={handleFollow}
            initialQuery={searchParams.query || ''}
            initialChurch={searchParams.church || null}
            initialPreacher={searchParams.preacher || null}
            initialSeries={searchParams.series || null}
            initialTag={searchParams.tag || null}
            initialTab={searchParams.initialTab || 'notes'}
          />
        ) : viewState === ViewState.LEADERBOARD ? (
          <Leaderboard 
            users={allUsers}
            currentUser={currentUser}
            onFollow={handleFollow}
          />
        ) : (
          <Feed 
            notes={notes}
            users={allUsers}
            currentUser={currentUser}
            onNoteClick={(note) => setSelectedNote(note)}
            onOpenSearch={handleOpenSearchWithFilter}
          />
        )}
      </main>

      {/* Right Sidebar (Desktop) - Profile & Location Directory Quick Access */}
      <aside className="hidden lg:block w-80 p-6 border-l border-stone-200 bg-white overflow-y-auto">
        {/* User Profile Card */}
        <div className="flex items-center space-x-3 mb-6 p-3 bg-stone-50 rounded-2xl border border-stone-100">
          <img src={currentUser.avatar} className="w-10 h-10 rounded-full object-cover border border-white shadow-xs" alt="Profile" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-stone-900 truncate">{currentUser.name}</div>
            <div className="text-xs text-stone-400 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              {currentUser.location ? `${currentUser.location.city}, ${currentUser.location.state}` : currentUser.handle}
            </div>
          </div>
        </div>

        {/* Global Directory by State Quick Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              Churches by State / Region
            </h3>
            <button
              onClick={() => handleOpenSearchWithFilter({ initialTab: 'churches' })}
              className="text-[11px] font-bold text-orange-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {[
              { state: 'California', count: 4, country: 'USA', writersCount: 5 },
              { state: 'Texas', count: 2, country: 'USA', writersCount: 1 },
              { state: 'Lagos', count: 3, country: 'Nigeria', writersCount: 2 },
              { state: 'Greater London', count: 2, country: 'UK', writersCount: 1 },
              { state: 'New South Wales', count: 1, country: 'Australia', writersCount: 1 }
            ].map(loc => (
              <button
                key={loc.state}
                onClick={() => handleOpenSearchWithFilter({ query: loc.state, initialTab: 'churches' })}
                className="w-full text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50/60 border border-stone-200/60 text-stone-900 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold group-hover:text-orange-600 block">
                    {loc.state}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {loc.country} • {loc.writersCount} {loc.writersCount === 1 ? 'writer' : 'writers'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-white text-stone-600 px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                  {loc.count} {loc.count === 1 ? 'church' : 'churches'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sermon Series Spotlight */}
        <div className="mb-8">
          <h3 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Active Sermon Series
          </h3>
          <div className="space-y-2">
            {knownSeries.map(series => {
              const count = notes.filter(n => n.series === series).length;
              return (
                <button
                  key={series}
                  onClick={() => handleOpenSearchWithFilter({ series, initialTab: 'notes' })}
                  className="w-full text-left p-2.5 rounded-xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-100 text-amber-950 transition-all flex items-center justify-between group"
                >
                  <span className="text-xs font-bold group-hover:text-orange-700 truncate mr-2">
                    {series}
                  </span>
                  <span className="text-[10px] font-semibold bg-white text-amber-900 px-2 py-0.5 rounded-md shadow-2xs">
                    {count} {count === 1 ? 'part' : 'parts'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contributing Scribes */}
        <div className="mb-6">
          <h3 className="font-bold text-stone-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-600" />
            Featured Writers
          </h3>
          <div className="space-y-3">
            {allUsers.filter(u => u.id !== currentUser.id).slice(0, 4).map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-800 truncate">{user.name}</div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {user.location?.state ? `${user.location.state}, ${user.location.country}` : user.churchAffiliation}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(user.id)} 
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 shrink-0 ml-2"
                >
                  {currentUser.following.includes(user.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
