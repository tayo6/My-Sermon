import React, { useState, useMemo } from 'react';
import { Church, User, Note } from '../types';
import { CONTINENTS } from '../data/churchDirectory';
import { 
  Search, 
  MapPin, 
  Globe2, 
  Building2, 
  Users, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  Filter, 
  X, 
  UserCheck, 
  UserPlus, 
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from './Button';

interface ChurchDirectoryViewProps {
  churches: Church[];
  users: User[];
  notes: Note[];
  currentUser: User;
  onFollow: (userId: string) => void;
  onSelectNote: (note: Note) => void;
  onViewChurchNotes: (churchName: string) => void;
  initialSearchQuery?: string;
  initialStateFilter?: string;
}

export const ChurchDirectoryView: React.FC<ChurchDirectoryViewProps> = ({
  churches,
  users,
  notes,
  currentUser,
  onFollow,
  onSelectNote,
  onViewChurchNotes,
  initialSearchQuery = '',
  initialStateFilter = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>(initialStateFilter || 'all');
  const [directoryMode, setDirectoryMode] = useState<'churches' | 'writers'>('churches');
  const [expandedChurchId, setExpandedChurchId] = useState<string | null>(null);

  // Derive unique countries and states based on current selection
  const availableCountries = useMemo(() => {
    let filtered = churches;
    if (selectedContinent !== 'all') {
      filtered = filtered.filter(c => c.continent === selectedContinent);
    }
    return Array.from(new Set(filtered.map(c => c.country))).sort();
  }, [churches, selectedContinent]);

  const availableStates = useMemo(() => {
    let filtered = churches;
    if (selectedContinent !== 'all') {
      filtered = filtered.filter(c => c.continent === selectedContinent);
    }
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(c => c.country === selectedCountry);
    }
    return Array.from(new Set(filtered.map(c => c.state))).sort();
  }, [churches, selectedContinent, selectedCountry]);

  // Compute writers writing for each church (matching user.churchAffiliation or notes written for church)
  const churchStatsMap = useMemo(() => {
    const map = new Map<string, { writers: User[]; notes: Note[] }>();

    churches.forEach(church => {
      // Find users affiliated directly or who have authored notes for this church
      const churchNotes = notes.filter(n => n.church.toLowerCase().trim() === church.name.toLowerCase().trim());
      const authorIds = new Set(churchNotes.map(n => n.authorId));

      const churchWriters = users.filter(u => 
        (u.churchAffiliation && u.churchAffiliation.toLowerCase().trim() === church.name.toLowerCase().trim()) ||
        authorIds.has(u.id)
      );

      map.set(church.id, {
        writers: churchWriters,
        notes: churchNotes
      });
    });

    return map;
  }, [churches, users, notes]);

  // Filtered Churches
  const filteredChurches = useMemo(() => {
    return churches.filter(church => {
      // Continent filter
      if (selectedContinent !== 'all' && church.continent !== selectedContinent) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'all' && church.country !== selectedCountry) {
        return false;
      }

      // State filter
      if (selectedState !== 'all' && church.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }

      // Search query (church name, city, state, country, pastor, or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = church.name.toLowerCase().includes(q);
        const matchesCity = church.city.toLowerCase().includes(q);
        const matchesState = church.state.toLowerCase().includes(q);
        const matchesCountry = church.country.toLowerCase().includes(q);
        const matchesContinent = church.continent.toLowerCase().includes(q);
        const matchesPastor = church.leadPastor?.toLowerCase().includes(q) || false;
        
        // Also match if a writer for this church matches
        const stats = churchStatsMap.get(church.id);
        const matchesWriter = stats?.writers.some(w => w.name.toLowerCase().includes(q) || w.handle.toLowerCase().includes(q));

        if (!matchesName && !matchesCity && !matchesState && !matchesCountry && !matchesContinent && !matchesPastor && !matchesWriter) {
          return false;
        }
      }

      return true;
    });
  }, [churches, selectedContinent, selectedCountry, selectedState, searchQuery, churchStatsMap]);

  // Filtered Writers
  const filteredWriters = useMemo(() => {
    return users.filter(user => {
      // Find user's associated church or user's location
      const userChurch = churches.find(c => c.name.toLowerCase() === user.churchAffiliation?.toLowerCase());
      const continent = user.location?.continent || userChurch?.continent;
      const country = user.location?.country || userChurch?.country;
      const state = user.location?.state || userChurch?.state;

      if (selectedContinent !== 'all' && continent !== selectedContinent) {
        return false;
      }

      if (selectedCountry !== 'all' && country !== selectedCountry) {
        return false;
      }

      if (selectedState !== 'all' && state?.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesHandle = user.handle.toLowerCase().includes(q);
        const matchesBio = user.bio.toLowerCase().includes(q);
        const matchesChurch = user.churchAffiliation?.toLowerCase().includes(q) || false;
        const matchesState = state?.toLowerCase().includes(q) || false;
        const matchesCountry = country?.toLowerCase().includes(q) || false;

        if (!matchesName && !matchesHandle && !matchesBio && !matchesChurch && !matchesState && !matchesCountry) {
          return false;
        }
      }

      return true;
    });
  }, [users, churches, selectedContinent, selectedCountry, selectedState, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedContinent('all');
    setSelectedCountry('all');
    setSelectedState('all');
  };

  const hasActiveFilters = searchQuery || selectedContinent !== 'all' || selectedCountry !== 'all' || selectedState !== 'all';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              Global Church & Writers Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Churches & Writers by Location
            </h1>
            <p className="text-stone-500 text-sm mt-1 max-w-2xl">
              Explore churches and writers across different continents, countries, and states (e.g. California, Texas, London, Lagos) and see exactly how many writers are documenting sermons for each church.
            </p>
          </div>

          {/* Directory Mode Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto">
            <button
              onClick={() => setDirectoryMode('churches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                directoryMode === 'churches'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              Churches ({filteredChurches.length})
            </button>
            <button
              onClick={() => setDirectoryMode('writers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                directoryMode === 'writers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-orange-600" />
              Writers ({filteredWriters.length})
            </button>
          </div>
        </div>
      </div>

      {/* Free & Built-In Notice Badge */}
      <div className="mb-6 p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>100% Free & Built-in:</strong> Direct in-memory indexing powered by local geographic tagging. No Google Search, external API, or paid services required.
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-orange-700 hover:underline shrink-0"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Main Search and Location Filters Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs mb-8 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search church name, state (e.g. 'California'), city, country, or pastor..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-sm text-stone-800 placeholder:text-stone-400 font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Location Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Quick Filter:
          </span>
          <button
            onClick={() => { setSelectedContinent('North America'); setSelectedCountry('United States'); setSelectedState('California'); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              selectedState === 'California'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            California, USA
          </button>
          <button
            onClick={() => { setSelectedContinent('North America'); setSelectedCountry('United States'); setSelectedState('Texas'); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              selectedState === 'Texas'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            Texas, USA
          </button>
          <button
            onClick={() => { setSelectedContinent('Europe'); setSelectedCountry('United Kingdom'); setSelectedState('Greater London'); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              selectedCountry === 'United Kingdom'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            London, UK
          </button>
          <button
            onClick={() => { setSelectedContinent('Africa'); setSelectedCountry('Nigeria'); setSelectedState('Lagos'); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              selectedCountry === 'Nigeria'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            Lagos, Nigeria
          </button>
          <button
            onClick={() => { setSelectedContinent('Oceania'); setSelectedCountry('Australia'); setSelectedState('all'); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
              selectedCountry === 'Australia'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            Australia
          </button>
        </div>

        {/* 3-Tier Hierarchy Selectors: Continent -> Country -> State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100">
          {/* Continent Dropdown */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
              1. Continent
            </label>
            <select
              value={selectedContinent}
              onChange={(e) => {
                setSelectedContinent(e.target.value);
                setSelectedCountry('all');
                setSelectedState('all');
              }}
              className="w-full text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
            >
              <option value="all">All Continents (Global)</option>
              {CONTINENTS.map(cont => (
                <option key={cont} value={cont}>{cont}</option>
              ))}
            </select>
          </div>

          {/* Country Dropdown */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
              2. Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState('all');
              }}
              className="w-full text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
            >
              <option value="all">All Countries</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* State / Province Dropdown */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
              3. State / Province (e.g. California)
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
            >
              <option value="all">All States / Provinces</option>
              {availableStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-stone-500 border-t border-stone-100">
          <div>
            Showing <strong className="text-stone-900">{directoryMode === 'churches' ? filteredChurches.length : filteredWriters.length}</strong> {directoryMode}
            {selectedState !== 'all' && (
              <span> in <span className="font-bold text-orange-600">{selectedState}</span></span>
            )}
            {selectedCountry !== 'all' && (
              <span>, {selectedCountry}</span>
            )}
            {selectedContinent !== 'all' && selectedCountry === 'all' && (
              <span> in {selectedContinent}</span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-orange-600 hover:text-orange-800 font-bold hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: CHURCHES DIRECTORY */}
      {directoryMode === 'churches' && (
        <div className="space-y-6">
          {filteredChurches.map(church => {
            const stats = churchStatsMap.get(church.id) || { writers: [], notes: [] };
            const isExpanded = expandedChurchId === church.id;

            return (
              <div 
                key={church.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-orange-200 transition-all overflow-hidden"
              >
                <div className="p-6">
                  {/* Church Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 hover:text-orange-600 transition-colors">
                          {church.name}
                        </h2>
                        {church.continent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {church.continent}
                          </span>
                        )}
                      </div>

                      {/* Geographic Location Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          {church.city}, <span className="text-stone-900 font-bold underline decoration-orange-300">{church.state}</span>, {church.country}
                        </span>
                        {church.leadPastor && (
                          <>
                            <span className="text-stone-300">•</span>
                            <span>Lead Pastor: <strong>{church.leadPastor}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Writers Count Highlight Badge */}
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
                        <div className="text-xl font-black text-orange-600 leading-none">
                          {stats.writers.length}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-800 mt-1">
                          {stats.writers.length === 1 ? 'Writer' : 'Writers'} Active
                        </div>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-center">
                        <div className="text-xl font-black text-stone-800 leading-none">
                          {stats.notes.length}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mt-1">
                          Sermon {stats.notes.length === 1 ? 'Note' : 'Notes'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Church Description */}
                  {church.description && (
                    <p className="text-stone-600 text-sm leading-relaxed mb-5 font-serif">
                      {church.description}
                    </p>
                  )}

                  {/* Writers Preview Chips */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Writers writing for this church:
                      </span>
                      {stats.writers.length > 0 ? (
                        <div className="flex items-center -space-x-2">
                          {stats.writers.map(w => (
                            <img
                              key={w.id}
                              src={w.avatar}
                              alt={w.name}
                              title={`${w.name} (${w.handle})`}
                              className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-2xs"
                            />
                          ))}
                          <span className="pl-3 text-xs font-semibold text-stone-700">
                            {stats.writers.map(w => w.name).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">No registered note writers yet</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {stats.notes.length > 0 && (
                        <button
                          onClick={() => onViewChurchNotes(church.name)}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          View {stats.notes.length} Notes
                        </button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedChurchId(isExpanded ? null : church.id)}
                        className="text-xs font-bold px-3 py-1.5 h-auto rounded-lg"
                      >
                        {isExpanded ? 'Hide Writers' : `Explore ${stats.writers.length} Writers`}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Drawer: Writers List and Recent Notes */}
                {isExpanded && (
                  <div className="bg-stone-50/90 border-t border-stone-200 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Writers Detailed Cards */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-orange-600" />
                        Writers Documenting Notes for {church.name} ({stats.writers.length})
                      </h4>

                      {stats.writers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stats.writers.map(writer => {
                            const isFollowing = currentUser.following.includes(writer.id);
                            return (
                              <div
                                key={writer.id}
                                className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex items-start justify-between gap-3"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <img
                                    src={writer.avatar}
                                    alt={writer.name}
                                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-sm text-stone-900 truncate">
                                      {writer.name}
                                    </div>
                                    <div className="text-xs text-stone-400 truncate mb-1">
                                      {writer.handle}
                                    </div>
                                    <p className="text-xs text-stone-600 line-clamp-2 font-serif">
                                      {writer.bio}
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
                                      <span><strong>{writer.totalNotes}</strong> notes</span>
                                      <span><strong>{writer.followers}</strong> followers</span>
                                    </div>
                                  </div>
                                </div>

                                {writer.id !== currentUser.id && (
                                  <button
                                    onClick={() => onFollow(writer.id)}
                                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                      isFollowing
                                        ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-2xs'
                                    }`}
                                  >
                                    {isFollowing ? 'Following' : 'Follow'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500 italic bg-white p-4 rounded-xl border border-stone-200">
                          Be the first writer to take and publish notes for {church.name}!
                        </p>
                      )}
                    </div>

                    {/* Recent Notes From This Church */}
                    {stats.notes.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-orange-600" />
                          Recent Notes from {church.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {stats.notes.slice(0, 4).map(note => (
                            <div
                              key={note.id}
                              onClick={() => onSelectNote(note)}
                              className="bg-white p-3.5 rounded-xl border border-stone-200 hover:border-orange-300 hover:shadow-xs cursor-pointer transition-all"
                            >
                              <div className="text-[11px] font-semibold text-stone-400 mb-1 flex items-center justify-between">
                                <span>{new Date(note.date).toLocaleDateString()}</span>
                                <span className="font-bold text-stone-600">{note.preacher}</span>
                              </div>
                              <h5 className="font-serif font-bold text-stone-900 text-sm hover:text-orange-600 truncate mb-1">
                                {note.topic}
                              </h5>
                              <p className="text-xs text-stone-500 line-clamp-1">
                                {note.content.replace(/[#*`_]/g, '')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredChurches.length === 0 && (
            <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-6">
              <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-900 text-lg mb-1">No churches match your search</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-4">
                We couldn't find any churches matching your selected continent, country, or state criteria.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Search Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: WRITERS DIRECTORY */}
      {directoryMode === 'writers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWriters.map(writer => {
            const isFollowing = currentUser.following.includes(writer.id);
            const userChurch = churches.find(c => c.name.toLowerCase() === writer.churchAffiliation?.toLowerCase());
            const displayState = writer.location?.state || userChurch?.state;
            const displayCountry = writer.location?.country || userChurch?.country;
            const displayContinent = writer.location?.continent || userChurch?.continent;

            return (
              <div 
                key={writer.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:border-orange-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={writer.avatar}
                        alt={writer.name}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200 shadow-xs"
                      />
                      <div>
                        <h3 className="font-bold text-stone-900 text-base leading-tight">
                          {writer.name}
                        </h3>
                        <p className="text-xs text-stone-400 font-medium">
                          {writer.handle}
                        </p>
                      </div>
                    </div>

                    {writer.id !== currentUser.id && (
                      <button
                        onClick={() => onFollow(writer.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          isFollowing
                            ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-2xs'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>

                  {/* Church & Geographic Location Badges */}
                  <div className="space-y-1 mb-3">
                    {writer.churchAffiliation && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                        <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>{writer.churchAffiliation}</span>
                      </div>
                    )}
                    {displayState && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>
                          <strong className="text-stone-700">{displayState}</strong>
                          {displayCountry && `, ${displayCountry}`}
                          {displayContinent && ` (${displayContinent})`}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 font-serif leading-relaxed mb-4">
                    {writer.bio}
                  </p>
                </div>

                {/* Footer Stats & Quick Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-4">
                    <span><strong>{writer.totalNotes}</strong> Notes</span>
                    <span><strong>{writer.followers}</strong> Followers</span>
                  </div>

                  {writer.churchAffiliation && (
                    <button
                      onClick={() => onViewChurchNotes(writer.churchAffiliation!)}
                      className="text-orange-600 font-bold hover:underline text-xs flex items-center gap-1"
                    >
                      Church Notes <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredWriters.length === 0 && (
            <div className="col-span-full text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 p-6">
              <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-900 text-lg mb-1">No writers found</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-4">
                We couldn't find any writers matching your location filters.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
