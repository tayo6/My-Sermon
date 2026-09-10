import React, { useState, useMemo } from 'react';
import { Note, User, Church } from '../types';
import { INITIAL_CHURCHES } from '../data/churchDirectory';
import { ChurchDirectoryView } from './ChurchDirectoryView';
import { 
  Search, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Bookmark, 
  Tag, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Clock, 
  Heart, 
  MessageSquare, 
  ArrowUpDown, 
  Check, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Mic,
  PlayCircle,
  Globe2
} from 'lucide-react';
import { Button } from './Button';

interface SearchViewProps {
  notes: Note[];
  users: User[];
  churches?: Church[];
  onNoteClick: (note: Note) => void;
  currentUser: User;
  onFollow?: (userId: string) => void;
  initialQuery?: string;
  initialTag?: string | null;
  initialChurch?: string | null;
  initialPreacher?: string | null;
  initialSeries?: string | null;
  initialTab?: 'notes' | 'churches';
}

export const SearchView: React.FC<SearchViewProps> = ({
  notes,
  users,
  churches,
  onNoteClick,
  currentUser,
  onFollow,
  initialQuery = '',
  initialTag = null,
  initialChurch = null,
  initialPreacher = null,
  initialSeries = null,
  initialTab = 'notes',
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'churches'>(initialTab);
  const [keyword, setKeyword] = useState(initialQuery);
  const [selectedChurch, setSelectedChurch] = useState<string | null>(initialChurch);
  const [selectedPreacher, setSelectedPreacher] = useState<string | null>(initialPreacher);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(initialSeries);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Date filtering state
  const [datePreset, setDatePreset] = useState<'all' | '7d' | '30d' | '90d' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'title'>('newest');
  
  // Filter panel expand toggle on mobile
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Derive unique lists with counts
  const churchesWithCount = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach(n => {
      if (n.church) {
        map.set(n.church, (map.get(n.church) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [notes]);

  const preachersWithCount = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach(n => {
      if (n.preacher) {
        map.set(n.preacher, (map.get(n.preacher) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [notes]);

  const seriesWithCount = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach(n => {
      if (n.series) {
        map.set(n.series, (map.get(n.series) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [notes]);

  const tagsWithCount = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach(n => {
      if (n.tags) {
        n.tags.forEach(t => {
          map.set(t, (map.get(t) || 0) + 1);
        });
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [notes]);

  // Quick preset helper
  const handleDatePreset = (preset: 'all' | '7d' | '30d' | '90d' | 'year' | 'custom') => {
    setDatePreset(preset);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    if (preset === 'custom') {
      return;
    }
    const now = new Date();
    let days = 7;
    if (preset === '30d') days = 30;
    if (preset === '90d') days = 90;
    if (preset === 'year') days = 365;
    
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(past.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedChurch(null);
    setSelectedPreacher(null);
    setSelectedSeries(null);
    setSelectedTag(null);
    setSelectedCategory('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(
    keyword.trim() ||
    selectedChurch ||
    selectedPreacher ||
    selectedSeries ||
    selectedTag ||
    selectedCategory !== 'all' ||
    datePreset !== 'all' ||
    startDate ||
    endDate
  );

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // 1. Keyword search
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const inTopic = note.topic?.toLowerCase().includes(q);
        const inContent = note.content?.toLowerCase().includes(q);
        const inPreacher = note.preacher?.toLowerCase().includes(q);
        const inChurch = note.church?.toLowerCase().includes(q);
        const inSeries = note.series?.toLowerCase().includes(q);
        const inSummary = note.summary?.toLowerCase().includes(q);
        const inTags = note.tags?.some(t => t.toLowerCase().includes(q));

        if (!inTopic && !inContent && !inPreacher && !inChurch && !inSeries && !inSummary && !inTags) {
          return false;
        }
      }

      // 2. Church filter
      if (selectedChurch && note.church !== selectedChurch) {
        return false;
      }

      // 3. Preacher filter
      if (selectedPreacher && note.preacher !== selectedPreacher) {
        return false;
      }

      // 4. Series filter
      if (selectedSeries && note.series !== selectedSeries) {
        return false;
      }

      // 5. Tag filter
      if (selectedTag) {
        if (!note.tags || !note.tags.includes(selectedTag)) {
          return false;
        }
      }

      // 6. Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'Children' && note.category !== 'Children') return false;
        if (selectedCategory === 'Youth' && note.category !== 'Youth') return false;
        if (selectedCategory === 'Conference' && note.category !== 'Conference') return false;
        if (selectedCategory === 'General' && note.category !== 'General') return false;
      }

      // 7. Date filtering
      if (startDate) {
        if (note.date < startDate) return false;
      }
      if (endDate) {
        if (note.date > endDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        // Sort by note date, fallback to createdAt
        return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime();
      }
      if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      if (sortBy === 'title') {
        return a.topic.localeCompare(b.topic);
      }
      return 0;
    });
  }, [
    notes,
    keyword,
    selectedChurch,
    selectedPreacher,
    selectedSeries,
    selectedTag,
    selectedCategory,
    startDate,
    endDate,
    sortBy
  ]);

  const getAuthor = (authorId: string) => users.find(u => u.id === authorId);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time < 1 ? 1 : time;
  };

  // Highlight helper for keyword matches in text
  const renderHighlighted = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 text-stone-900 rounded px-0.5 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Top Search & Directory Tabs */}
      <div className="flex items-center gap-6 border-b border-stone-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'notes'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sermon Notes Search</span>
          <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
            {filteredNotes.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('churches')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'churches'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Churches & Writers by Location</span>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
            States & Continents
          </span>
        </button>
      </div>

      {activeTab === 'churches' ? (
        <ChurchDirectoryView
          churches={churches && churches.length > 0 ? churches : INITIAL_CHURCHES}
          users={users}
          notes={notes}
          currentUser={currentUser}
          onFollow={onFollow || (() => {})}
          onSelectNote={onNoteClick}
          onViewChurchNotes={(churchName) => {
            setSelectedChurch(churchName);
            setActiveTab('notes');
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Sermon Search & Categorization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              Find Revelations & Notes
            </h1>
            <p className="text-stone-500 text-sm mt-1 max-w-2xl">
              Search by keywords, preacher, church, sermon series, biblical themes, or service dates.
            </p>
          </div>

      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            id="sermon-search-input"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search topics, scripture references, sermon series, or content..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-stone-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none text-base text-stone-900 placeholder:text-stone-400 font-medium transition-all shadow-sm"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <button
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
          <span>{showFiltersPanel ? 'Hide Filters' : 'Filter by Church, Series, Preacher, Date'}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-orange-600" />
          )}
        </button>
        <span className="text-xs font-semibold text-stone-500">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        </span>
      </div>

      {/* Categorization & Filter Controls Panel */}
      <div className={`space-y-5 bg-white border border-stone-200 rounded-2xl p-5 mb-8 shadow-sm ${showFiltersPanel ? 'block' : 'hidden md:block'}`}>
        
        {/* Row 1: Tagging Filters (Church, Preacher, Sermon Series) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Church Tag Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Church Tag
            </label>
            <select
              value={selectedChurch || ''}
              onChange={(e) => setSelectedChurch(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none"
            >
              <option value="">All Churches ({notes.length})</option>
              {churchesWithCount.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Preacher Tag Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-stone-400" />
              Preacher / Speaker
            </label>
            <select
              value={selectedPreacher || ''}
              onChange={(e) => setSelectedPreacher(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none"
            >
              <option value="">All Preachers</option>
              {preachersWithCount.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sermon Series Filter */}
          <div>
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-orange-500" />
              Sermon Series
            </label>
            <select
              value={selectedSeries || ''}
              onChange={(e) => setSelectedSeries(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none"
            >
              <option value="">All Sermon Series</option>
              {seriesWithCount.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Date Filtering */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Filter by Sermon Date
            </label>
            {/* Quick date presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Dates' },
                { id: '7d', label: 'Past 7 Days' },
                { id: '30d', label: 'Past Month' },
                { id: '90d', label: 'Past 3 Months' },
                { id: 'year', label: 'This Year' },
                { id: 'custom', label: 'Custom Range' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleDatePreset(preset.id as any)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    datePreset === preset.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Inputs (always visible or highlighted when custom or active) */}
          <div className="flex flex-wrap items-center gap-3 bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setDatePreset('all');
                }}
                className="text-xs text-stone-400 hover:text-stone-700 font-medium underline ml-auto"
              >
                Reset Date
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Tags Cloud & Series Quick Tags */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              Theme & Topic Tags
            </label>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag(null)}
                className="text-[10px] text-orange-600 hover:underline font-bold"
              >
                Clear Tag Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tagsWithCount.map(tag => {
              const isSelected = selectedTag === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  #{tag.name} <span className="opacity-60 text-[10px]">({tag.count})</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Active Filters Bar & Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'sermon note found' : 'sermon notes found'}
          </span>

          {/* Active filter badges */}
          {keyword.trim() && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full font-semibold">
              Keyword: "{keyword}"
              <button onClick={() => setKeyword('')} className="hover:text-orange-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedChurch && (
            <span className="inline-flex items-center gap-1 text-xs bg-stone-900 text-white px-2.5 py-1 rounded-full font-semibold">
              Church: {selectedChurch}
              <button onClick={() => setSelectedChurch(null)} className="hover:text-stone-300"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedPreacher && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
              Speaker: {selectedPreacher}
              <button onClick={() => setSelectedPreacher(null)} className="hover:text-blue-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedSeries && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-semibold">
              Series: {selectedSeries}
              <button onClick={() => setSelectedSeries(null)} className="hover:text-amber-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedTag && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
              Tag: #{selectedTag}
              <button onClick={() => setSelectedTag(null)} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {(startDate || endDate) && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full font-semibold">
              Date: {startDate || 'Start'} to {endDate || 'Present'}
              <button onClick={() => { setStartDate(''); setEndDate(''); setDatePreset('all'); }} className="hover:text-purple-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-stone-500 hover:text-stone-900 font-semibold underline ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset all
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs text-stone-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="newest">Newest Date</option>
            <option value="oldest">Oldest Date</option>
            <option value="likes">Most Liked</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {filteredNotes.map(note => {
          const author = getAuthor(note.authorId);
          const readTime = getReadingTime(note.content);

          return (
            <article
              key={note.id}
              onClick={() => onNoteClick(note)}
              className="bg-white border border-stone-200/80 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Card Meta Top: Series Badge & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {note.series && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSeries(note.series!);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100 transition-colors"
                      title="Filter by this sermon series"
                    >
                      <Bookmark className="w-3 h-3 text-orange-600 fill-orange-600" />
                      Series: {note.series}
                    </span>
                  )}
                  {note.category === 'Children' && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Kids Ministry
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(note.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {readTime} min read
                  </span>
                </div>
              </div>

              {/* Title / Topic */}
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 group-hover:text-orange-600 transition-colors mb-2 leading-snug">
                {renderHighlighted(note.topic, keyword)}
              </h2>

              {/* Preacher & Church Line */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium mb-4">
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreacher(note.preacher);
                  }}
                  className="flex items-center gap-1 hover:text-orange-600 hover:underline"
                  title="Filter by preacher"
                >
                  <UserIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-semibold">{renderHighlighted(note.preacher, keyword)}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChurch(note.church);
                  }}
                  className="flex items-center gap-1 hover:text-orange-600 hover:underline"
                  title="Filter by church"
                >
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{renderHighlighted(note.church, keyword)}</span>
                </span>
                {author && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-400">Notes by {author.name}</span>
                  </>
                )}
              </div>

              {/* Media Available Badges */}
              {(note.audioUrl || note.videoUrl) && (
                <div className="flex gap-2 mb-3">
                  {note.audioUrl && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider border border-orange-100">
                      <Mic className="w-3 h-3 mr-1" /> Audio Recorded
                    </span>
                  )}
                  {note.videoUrl && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                      <PlayCircle className="w-3 h-3 mr-1" /> Video Included
                    </span>
                  )}
                </div>
              )}

              {/* Snippet */}
              <p className="text-stone-600 font-serif text-sm sm:text-base line-clamp-2 leading-relaxed mb-4">
                {renderHighlighted(note.content.replace(/[#*`_]/g, ''), keyword)}
              </p>

              {/* Tags & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                {/* Theme Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {note.tags && note.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag);
                      }}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                      title={`Filter by #${tag}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social count */}
                <div className="flex items-center gap-4 text-xs font-semibold text-stone-400 ml-auto">
                  <span className="flex items-center gap-1">
                    <Heart className={`w-3.5 h-3.5 ${note.likedBy?.includes(currentUser.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {note.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {note.comments?.length || 0}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Search className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">No notes match your search</h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
              Try adjusting your search keywords, clearing specific church/preacher/series filters, or expanding the date range.
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </>
  )}
</div>
  );
};
