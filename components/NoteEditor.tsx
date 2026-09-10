import React, { useState, useRef } from 'react';
import { User, Note } from '../types';
import { Button } from './Button';
import { 
  ArrowLeft, 
  Save, 
  Bold, 
  Italic, 
  Heading, 
  List, 
  Video, 
  Mic, 
  Layout, 
  FileText, 
  Globe, 
  PlusSquare, 
  Tag, 
  Bookmark, 
  Plus, 
  X, 
  Calendar, 
  Clock,
  Sparkles,
  MapPin,
  User as UserIcon
} from 'lucide-react';

interface NoteEditorProps {
  currentUser: User;
  onCancel: () => void;
  onSave: (note: Partial<Note>) => void;
  knownChurches?: string[];
  knownPreachers?: string[];
  knownSeries?: string[];
}

const COMMON_TAG_SUGGESTIONS = [
  'Faith',
  'Worship',
  'Prayer',
  'Grace',
  'Healing',
  'Holy Spirit',
  'Purpose',
  'Generosity',
  'Discipleship',
  'Leadership',
  'Spiritual Warfare',
  'Courage',
  'Love',
  'Family'
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  currentUser, 
  onCancel, 
  onSave,
  knownChurches = ['Grace Community Church', 'City Light Cathedral', 'Hope Chapel'],
  knownPreachers = ['Rev. Mark Thompson', 'Pastor Chris Tomlin', 'Ps. Michael Scott', 'Mrs. Higgins'],
  knownSeries = ['Heart of Worship', 'Identity & Destiny', 'Heroes of Faith', 'Kingdom Economics']
}) => {
  const [topic, setTopic] = useState('');
  const [preacher, setPreacher] = useState('');
  const [church, setChurch] = useState(currentUser.churchAffiliation || '');
  const [series, setSeries] = useState('');
  const [tags, setTags] = useState<string[]>(['Faith']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [category, setCategory] = useState<'General' | 'Children' | 'Youth' | 'Conference'>('General');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);
        
        const newText = `${before}${prefix}${selection}${suffix}${after}`;
        setContent(newText);
        
        // Reset cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + prefix.length;
            textareaRef.current.selectionEnd = start + prefix.length + selection.length;
            textareaRef.current.focus();
          }
        }, 0);
    }
  };

  const addSubTopic = () => {
    const subTopicPrefix = '\n\n### [New Sub-Topic Name]\n\n- ';
    insertFormat(subTopicPrefix);
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTagInput.trim().replace(/^#/, '');
    if (clean && !tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleToggleSuggestedTag = (tagToAdd: string) => {
    if (tags.includes(tagToAdd)) {
      handleRemoveTag(tagToAdd);
    } else {
      setTags([...tags, tagToAdd]);
    }
  };

  const handlePublish = () => {
    if (!topic || !content || !preacher || !church) return;
    onSave({ 
      topic, 
      preacher, 
      church, 
      series: series.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      content, 
      date, 
      time, 
      category, 
      videoUrl, 
      audioUrl, 
      likes: 0, 
      comments: [], 
      authorId: currentUser.id, 
      createdAt: Date.now() 
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col">
      {/* Premium Editorial Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button 
            onClick={onCancel} 
            className="text-stone-500 hover:text-stone-900 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Discard Draft
          </button>
          <div className="hidden sm:block h-6 w-px bg-stone-200" />
          <h2 className="hidden sm:flex text-sm font-bold text-stone-900 items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" /> 
            <span className="font-serif italic text-stone-500">Writing:</span> 
            <span className="truncate max-w-[280px]">{topic || 'Untitled Sermon'}</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handlePublish} 
            disabled={!topic.trim() || !content.trim() || !preacher.trim() || !church.trim()} 
            className="px-7 shadow-lg shadow-orange-100 ring-2 ring-orange-50 text-sm"
          >
            <Save className="w-4 h-4 mr-2" /> Publish Note
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Categorization & Logistics Sidebar */}
        <aside className="lg:col-span-4 p-6 sm:p-8 space-y-6 bg-stone-50/60 border-r border-stone-200 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* Section: Categorization & Tags */}
          <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-600" /> Categorization & Tags
              </h3>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Essential</span>
            </div>

            {/* Sermon Topic */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Sermon Topic / Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="e.g. Walking in Divine Purpose" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-sm font-semibold transition-all" 
              />
            </div>

            {/* Sermon Series Tagging */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-orange-600" />
                  Sermon Series Tag
                </label>
                {series && (
                  <button 
                    onClick={() => setSeries('')} 
                    className="text-[10px] text-stone-400 hover:text-stone-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input 
                type="text" 
                value={series} 
                onChange={(e) => setSeries(e.target.value)} 
                placeholder="e.g. Identity & Destiny, Heart of Worship" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-xs font-semibold" 
              />
              {/* Existing Series suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-medium text-stone-400 self-center">Existing:</span>
                {knownSeries.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeries(s)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                      series === s 
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Preacher / Speaker Tagging */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                Preacher / Speaker <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={preacher} 
                onChange={(e) => setPreacher(e.target.value)} 
                placeholder="e.g. Rev. Mark Thompson" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-xs font-semibold" 
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-medium text-stone-400 self-center">Quick pick:</span>
                {knownPreachers.slice(0, 3).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreacher(p)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                      preacher === p 
                        ? 'bg-blue-100 text-blue-900 border-blue-300' 
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Church Tagging */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                Church Tag <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={church} 
                onChange={(e) => setChurch(e.target.value)} 
                placeholder="e.g. City Light Cathedral, Grace Community Church" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 focus:bg-white focus:ring-3 focus:ring-orange-100 focus:border-orange-500 outline-none text-xs font-semibold" 
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-medium text-stone-400 self-center">Known:</span>
                {knownChurches.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChurch(c)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                      church === c 
                        ? 'bg-stone-900 text-white border-stone-900' 
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Tags (Faith, Prayer, Grace, etc.) */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Biblical & Topical Tags
              </label>
              
              {/* Selected Tags list */}
              <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-stone-50 rounded-xl border border-stone-200/80">
                {tags.length === 0 ? (
                  <span className="text-xs text-stone-400 italic">No tags added yet</span>
                ) : (
                  tags.map(t => (
                    <span 
                      key={t}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-stone-200 text-stone-800 px-2.5 py-1 rounded-full shadow-xs"
                    >
                      #{t}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(t)}
                        className="text-stone-400 hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add custom tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add custom tag (e.g. Holiness, Joy)..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomTag()}
                  disabled={!customTagInput.trim()}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Quick suggestion tags */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Suggested:</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_TAG_SUGGESTIONS.map(st => {
                    const isAdded = tags.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleToggleSuggestedTag(st)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                          isAdded 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '}#{st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </section>

          {/* Section: Sermon Date & Category */}
          <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Calendar className="w-4 h-4 text-stone-400" /> Sermon Date & Classification
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Service Time
                </label>
                <input 
                  type="text" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  placeholder="e.g. 10:30 AM" 
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200" 
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-stone-500 uppercase">
                Audience / Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'General', label: 'General Sermon' },
                  { id: 'Children', label: 'Kids Ministry' },
                  { id: 'Youth', label: 'Youth Group' },
                  { id: 'Conference', label: 'Conference' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`text-xs font-semibold py-2 px-2.5 rounded-xl border text-center transition-all ${
                      category === cat.id
                        ? 'bg-orange-50 text-orange-800 border-orange-300 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Media Integration */}
          <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Globe className="w-4 h-4 text-stone-400" /> Media Recordings
            </h3>
            
            <div className="relative group">
              <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="url" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="Video Link (YouTube or MP4)" 
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-xs" 
              />
            </div>

            <div className="relative group">
              <Mic className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="url" 
                value={audioUrl} 
                onChange={(e) => setAudioUrl(e.target.value)} 
                placeholder="Audio Link (MP3/Podcast)" 
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none text-xs" 
              />
            </div>
          </section>

        </aside>

        {/* Expansive Writing Canvas */}
        <main className="lg:col-span-8 bg-white flex flex-col h-[calc(100vh-73px)]">
          {/* Enhanced Formatting Bar */}
          <div className="px-6 sm:px-10 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-1">
              {[
                { icon: Bold, action: () => insertFormat('**', '**'), tip: "Bold" },
                { icon: Italic, action: () => insertFormat('*', '*'), tip: "Italic" },
                { icon: List, action: () => insertFormat('- '), tip: "Bullet Point" }
              ].map((btn, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={btn.action} 
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-stone-200" 
                  title={btn.tip}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
              <div className="w-px h-5 bg-stone-300 mx-2" />
              <button 
                type="button"
                onClick={addSubTopic} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-orange-600 hover:text-orange-700 hover:border-orange-300 hover:shadow-xs transition-all text-xs font-bold"
              >
                <PlusSquare className="w-3.5 h-3.5" />
                Insert Sub-Topic
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400">
               <span>Draft Ready</span>
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 relative group">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did the preacher speak today? Write key scriptures, quotes, and revelations..."
              className="w-full h-full p-8 sm:p-12 lg:p-16 focus:outline-none font-serif text-lg lg:text-xl leading-[1.9] text-stone-800 resize-none placeholder:text-stone-300 selection:bg-orange-100"
            />
          </div>

          <footer className="px-8 py-4 border-t border-stone-200 flex justify-between items-center bg-stone-50/30 text-xs">
             <div className="flex items-center gap-6">
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                 <Heading className="w-3.5 h-3.5 text-stone-400" /> {content.split('###').length - 1} Sub-topics
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                 <FileText className="w-3.5 h-3.5 text-stone-400" /> {content.trim() ? content.trim().split(/\s+/).length : 0} Words
               </span>
             </div>
             <div className="text-[11px] text-stone-400 font-medium">
               Tagged to: <span className="font-semibold text-stone-600">{church || 'None'}</span>
             </div>
          </footer>
        </main>

      </div>
    </div>
  );
};
