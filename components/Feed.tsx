import React, { useState, useMemo } from 'react';
import { Note, User } from '../types';
import { 
  MessageSquare, 
  Heart, 
  Mic, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  PlayCircle, 
  Clock, 
  Search, 
  Bookmark, 
  Tag, 
  X, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { Button } from './Button';

interface FeedProps {
  notes: Note[];
  users: User[];
  onNoteClick: (note: Note) => void;
  currentUser: User;
  onOpenSearch?: (initialFilter?: { query?: string; church?: string; preacher?: string; series?: string; tag?: string }) => void;
}

export const Feed: React.FC<FeedProps> = ({ 
  notes, 
  users, 
  onNoteClick, 
  currentUser,
  onOpenSearch
}) => {
  const [filter, setFilter] = useState<'all' | 'following' | 'children'>('all');
  const [churchFilter, setChurchFilter] = useState<string | null>(null);
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  const getAuthor = (authorId: string) => users.find(u => u.id === authorId);

  // Calculate reading time estimate
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time < 1 ? 1 : time;
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        // Church filter
        if (churchFilter && note.church !== churchFilter) return false;
        
        // Series filter
        if (seriesFilter && note.series !== seriesFilter) return false;

        // Tag filter
        if (tagFilter && (!note.tags || !note.tags.includes(tagFilter))) return false;

        // Category/Audience filter
        if (filter === 'children' && note.category !== 'Children') return false;
        if (filter === 'following' && !currentUser.following.includes(note.authorId)) return false;

        // Quick search
        if (quickSearch.trim()) {
          const q = quickSearch.toLowerCase().trim();
          const inTopic = note.topic?.toLowerCase().includes(q);
          const inContent = note.content?.toLowerCase().includes(q);
          const inPreacher = note.preacher?.toLowerCase().includes(q);
          const inChurch = note.church?.toLowerCase().includes(q);
          const inSeries = note.series?.toLowerCase().includes(q);
          const inTags = note.tags?.some(t => t.toLowerCase().includes(q));

          if (!inTopic && !inContent && !inPreacher && !inChurch && !inSeries && !inTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [notes, filter, churchFilter, seriesFilter, tagFilter, quickSearch, currentUser.following]);

  const churches = useMemo(() => Array.from(new Set(notes.map(n => n.church).filter(Boolean))), [notes]);
  const seriesList = useMemo(() => Array.from(new Set(notes.map(n => n.series).filter(Boolean) as string[])), [notes]);
  const popularTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).slice(0, 8);
  }, [notes]);

  const clearFilters = () => {
    setChurchFilter(null);
    setSeriesFilter(null);
    setTagFilter(null);
    setQuickSearch('');
    setFilter('all');
  };

  const hasActiveCustomFilters = Boolean(churchFilter || seriesFilter || tagFilter || quickSearch);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-1">The Well</h1>
            <p className="text-stone-500 text-sm font-medium">Daily revelations and sermon notes from the community.</p>
          </div>
          {onOpenSearch && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenSearch()} 
              className="hidden sm:flex items-center gap-2 text-xs font-bold border-stone-300"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              Advanced Search
            </Button>
          )}
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="mb-6 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Quick search by preacher, sermon series, church, topic, or scripture..."
            className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white border border-stone-200 focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-sm text-stone-800 placeholder:text-stone-400 font-medium shadow-2xs transition-all"
          />
          {quickSearch && (
            <button
              onClick={() => setQuickSearch('')}
              className="absolute right-12 p-1 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onOpenSearch && (
            <button
              onClick={() => onOpenSearch({ query: quickSearch })}
              className="absolute right-3 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
              title="Open in full Search View with date and tag filters"
            >
              Filter
            </button>
          )}
        </div>
      </div>

      {/* Modern Tab Bar */}
      <div className="flex items-center space-x-6 mb-6 border-b border-stone-200 sticky top-0 bg-[#fcfbf9]/95 backdrop-blur-md z-20 pt-2">
        {['all', 'following', 'children'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f as any)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              filter === f ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {f === 'all' ? 'Discover Feed' : f === 'following' ? 'Following' : 'Kids Ministry'}
            {filter === f && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-full animate-in fade-in zoom-in duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Categorization Chips Bar: Church & Sermon Series */}
      <div className="space-y-3 mb-8 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/60">
        
        {/* Church Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1 mr-1">
            <MapPin className="w-3 h-3" /> Churches:
          </span>
          <button
            onClick={() => setChurchFilter(null)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all border ${
              churchFilter === null
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
            }`}
          >
            All
          </button>
          {churches.map(church => (
            <button
              key={church}
              onClick={() => setChurchFilter(churchFilter === church ? null : church)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all border ${
                churchFilter === church 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {church}
            </button>
          ))}
        </div>

        {/* Sermon Series Chips */}
        {seriesList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1 mr-1">
              <Bookmark className="w-3 h-3 text-orange-600" /> Series:
            </span>
            {seriesList.map(series => (
              <button
                key={series}
                onClick={() => setSeriesFilter(seriesFilter === series ? null : series)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all border ${
                  seriesFilter === series
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                    : 'bg-white text-amber-800/80 border-amber-200/70 hover:bg-amber-50'
                }`}
              >
                {series}
              </button>
            ))}
          </div>
        )}

        {/* Theme Tags Chips */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-200/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all ${
                  tagFilter === tag
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Active Filter summary & clear */}
        {hasActiveCustomFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
            <span className="text-stone-500">
              Showing filtered results ({filteredNotes.length} notes)
            </span>
            <button
              onClick={clearFilters}
              className="text-orange-600 hover:underline font-bold text-[11px]"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Notes List */}
      <div className="space-y-10">
        {filteredNotes.map(note => {
          const author = getAuthor(note.authorId);
          if (!author) return null;
          const readTime = getReadingTime(note.content);
          
          return (
            <article 
              key={note.id} 
              className="group cursor-pointer relative transition-all duration-300 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 hover:border-orange-200 hover:shadow-md"
              onClick={() => onNoteClick(note)}
            >
              {/* Header: Author + Meta */}
              <div className="flex items-start gap-3.5 mb-4">
                <img 
                  src={author.avatar} 
                  alt={author.name} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 hover:underline">{author.name}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-tight flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.date || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-orange-500" />
                      <span className="font-semibold">{note.preacher}</span>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{note.church}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3 h-3 mr-1" /> {readTime} min read
                </div>
              </div>

              {/* Sermon Series Tag Badge */}
              {note.series && (
                <div className="mb-2">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSeriesFilter(seriesFilter === note.series ? null : note.series!);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
                  >
                    <Bookmark className="w-3 h-3 text-orange-600 fill-orange-600" />
                    Series: {note.series}
                  </span>
                </div>
              )}

              {/* Title / Topic */}
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                {note.topic}
              </h2>

              {/* Media Availability Badges */}
              {(note.audioUrl || note.videoUrl) && (
                <div className="flex gap-2 mb-3">
                  {note.audioUrl && (
                    <div className="flex items-center px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-widest border border-orange-100">
                      <Mic className="w-3 h-3 mr-1 animate-pulse" />
                      Audio Included
                    </div>
                  )}
                  {note.videoUrl && (
                    <div className="flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                      <PlayCircle className="w-3 h-3 mr-1" />
                      Video Included
                    </div>
                  )}
                </div>
              )}

              {/* Excerpt */}
              <p className="text-stone-600 font-serif text-base line-clamp-2 mb-4 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                {note.content.replace(/[#*`_]/g, '')}
              </p>

              {/* Tags & Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                {/* Theme Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {note.tags && note.tags.map(t => (
                    <span 
                      key={t}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTagFilter(tagFilter === t ? null : t);
                      }}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                  {note.category === 'Children' && (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Kids Ministry
                    </span>
                  )}
                </div>

                {/* Social Counters */}
                <div className="flex items-center gap-6 text-stone-400 text-xs font-semibold ml-auto">
                  <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                    <Heart className={`w-3.5 h-3.5 ${note.likedBy.includes(currentUser.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{note.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{note.comments.length}</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="text-center py-24 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 px-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-stone-400 w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-900 mb-1">No notes matching your criteria</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              We couldn't find any sermon notes for the selected filter or search query.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
