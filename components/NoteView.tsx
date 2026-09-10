import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Note, User, Comment } from '../types';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  UserPlus, 
  MapPin, 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Headphones, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Video, 
  Mic, 
  MoreVertical, 
  Gauge, 
  Zap, 
  RotateCcw, 
  RotateCw, 
  Bookmark, 
  ChevronDown,
  Tag,
  BookOpen
} from 'lucide-react';
import { Button } from './Button';
import { generateStudyGuide } from '../services/geminiService';

interface NoteViewProps {
  note: Note;
  author: User;
  currentUser: User;
  allNotes?: Note[];
  onBack: () => void;
  onFollow: (userId: string) => void;
  onLike: (noteId: string) => void;
  onAddComment: (noteId: string, content: string) => void;
  onSelectNote?: (note: Note) => void;
  onTagClick?: (value: string, type: 'church' | 'preacher' | 'series' | 'tag') => void;
}

const AudioWaveform: React.FC<{ progress: number; onSeek: (percent: number) => void; isActive: boolean }> = ({ progress, onSeek, isActive }) => {
    const bars = useMemo(() => Array.from({ length: 60 }, () => Math.floor(Math.random() * 70) + 15), []);
    
    return (
        <div className="h-16 flex items-center justify-between w-full cursor-pointer group px-1"
             onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 onSeek(x / rect.width);
             }}>
            {bars.map((height, i) => {
                const barPercent = i / bars.length;
                const isPlayed = barPercent <= progress;
                return (
                    <div 
                        key={i}
                        className={`w-[3px] rounded-full transition-all duration-300 ${isPlayed ? 'bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.4)]' : 'bg-stone-200 group-hover:bg-stone-300'} ${isActive && isPlayed ? 'animate-pulse' : ''}`}
                        style={{ height: `${height}%` }}
                    />
                );
            })}
        </div>
    );
};

export const NoteView: React.FC<NoteViewProps> = ({ 
  note, 
  author, 
  currentUser, 
  allNotes = [],
  onBack, 
  onFollow,
  onLike,
  onAddComment,
  onSelectNote,
  onTagClick
}) => {
  const [commentText, setCommentText] = useState('');
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(currentUser.following.includes(author.id));
  const [isBookmarked, setIsBookmarked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const isLiked = note.likedBy?.includes(currentUser.id) || false;

  // Find related notes in the same series or by the same preacher
  const relatedSeriesNotes = useMemo(() => {
    if (!note.series) return [];
    return allNotes.filter(n => n.id !== note.id && n.series === note.series);
  }, [allNotes, note.id, note.series]);

  const relatedPreacherNotes = useMemo(() => {
    if (!note.preacher) return [];
    return allNotes.filter(n => n.id !== note.id && n.preacher === note.preacher && n.series !== note.series);
  }, [allNotes, note.id, note.preacher, note.series]);

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    const result = await generateStudyGuide(note.content, note.topic);
    setAiContent(result);
    setIsAiLoading(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(note.id, commentText);
      setCommentText('');
    }
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleWaveSeek = (percent: number) => {
    if(audioRef.current && duration > 0) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const skipTime = (amount: number) => {
    if(audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if(audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if(audioRef.current) audioRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if(audioRef.current) audioRef.current.muted = newMute;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Process content to style sub-topics
  const renderContent = (content: string) => {
    const parts = content.split(/(### .*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('### ')) {
        return (
          <h3 key={i} className="text-2xl font-bold font-serif text-stone-900 mt-12 mb-6 border-l-4 border-orange-600 pl-6 py-2 bg-orange-50/50 rounded-r-xl tracking-tight">
            {part.replace('### ', '')}
          </h3>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <nav className="flex items-center justify-between mb-12">
        <button 
          onClick={onBack} 
          className="group flex items-center text-stone-400 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Notes
        </button>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsBookmarked(!isBookmarked)} 
             className={`p-2 transition-colors ${isBookmarked ? 'text-orange-600' : 'text-stone-400 hover:text-stone-900'}`}
             title={isBookmarked ? 'Bookmarked' : 'Bookmark note'}
           >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
           </button>
           <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Share2 className="w-5 h-5"/></button>
        </div>
      </nav>

      {/* Author & Context */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={author.avatar} alt={author.name} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center border-2 border-white">
                <Zap className="w-3 h-3 text-white fill-current" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 leading-none mb-1">{author.name}</h3>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">{author.churchAffiliation || 'Contributor'}</p>
            </div>
          </div>
          {author.id !== currentUser.id && (
            <Button 
              variant={isFollowing ? "outline" : "primary"} 
              size="sm"
              onClick={() => {
                onFollow(author.id);
                setIsFollowing(!isFollowing);
              }}
              className="px-5 text-xs font-bold"
            >
              {isFollowing ? 'Following' : 'Follow Writer'}
            </Button>
          )}
        </div>

        {/* Sermon Series Tag Badge */}
        {note.series && (
          <div className="mb-4">
            <button
              onClick={() => onTagClick && onTagClick(note.series!, 'series')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
              <span>Sermon Series: {note.series}</span>
              <span className="text-[10px] text-amber-700 underline font-normal ml-1">Explore series →</span>
            </button>
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif text-stone-900 mb-8 leading-[1.1] tracking-tight">
          {note.topic}
        </h1>
        
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-stone-200/80 mb-6 bg-white/50 rounded-2xl px-4">
          <div 
            onClick={() => onTagClick && onTagClick(note.preacher, 'preacher')}
            className="flex flex-col gap-1 px-3 border-r border-stone-200/60 cursor-pointer group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 group-hover:text-orange-600">
              <UserPlus className="w-3 h-3 text-orange-500" /> Preacher
            </span>
            <span className="text-sm font-bold text-stone-800 truncate group-hover:text-orange-600 group-hover:underline">
              {note.preacher}
            </span>
          </div>

          <div 
            onClick={() => onTagClick && onTagClick(note.church, 'church')}
            className="flex flex-col gap-1 px-3 border-r border-stone-200/60 cursor-pointer group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5 group-hover:text-orange-600">
              <MapPin className="w-3 h-3 text-stone-400" /> Church
            </span>
            <span className="text-sm font-bold text-stone-800 truncate group-hover:text-orange-600 group-hover:underline">
              {note.church}
            </span>
          </div>

          <div className="flex flex-col gap-1 px-3 border-r border-stone-200/60">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-stone-400" /> Sermon Date
            </span>
            <span className="text-sm font-bold text-stone-800 truncate">
              {new Date(note.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex flex-col gap-1 px-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-stone-400" /> Time & Category
            </span>
            <span className="text-sm font-bold text-stone-800 truncate">
              {note.time} ({note.category})
            </span>
          </div>
        </div>

        {/* Categorization Theme Tags Row */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {note.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick && onTagClick(tag, 'tag')}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-transparent transition-all"
                title={`Find all notes tagged #${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Modern Studio Audio Section */}
      {note.audioUrl && (
        <section className="mb-16">
          <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            
            <audio 
              ref={audioRef} 
              src={note.audioUrl} 
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} 
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden" 
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              {/* Main Controls Hub */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6">
                  <button onClick={() => skipTime(-15)} className="text-stone-500 hover:text-white transition-colors" title="Rewind 15s">
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  
                  <button onClick={togglePlay} className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-stone-900 hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95 group/play">
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  
                  <button onClick={() => skipTime(15)} className="text-stone-500 hover:text-white transition-colors" title="Forward 15s">
                    <RotateCw className="w-6 h-6" />
                  </button>
                </div>
                <button onClick={cyclePlaybackRate} className="text-[10px] font-black bg-stone-800 text-stone-400 px-3 py-1.5 rounded-full hover:bg-stone-700 hover:text-white transition-colors border border-stone-700">
                  {playbackRate}x Speed
                </button>
              </div>

              {/* Visualizer & Scrubber */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-between items-end mb-1">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full bg-orange-600 ${isPlaying ? 'animate-ping' : ''}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Master Stream</span>
                   </div>
                   <span className="text-[11px] font-mono font-bold text-stone-400 bg-stone-800/50 px-2 py-1 rounded">
                     {formatTime(currentTime)} <span className="text-stone-600 mx-1">/</span> {formatTime(duration)}
                   </span>
                </div>
                
                <div className="bg-stone-800/40 rounded-3xl p-4 border border-stone-800/50">
                  <AudioWaveform progress={duration ? currentTime / duration : 0} onSeek={handleWaveSeek} isActive={isPlaying} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 relative">
                    <button onClick={toggleMute} onMouseEnter={() => setShowVolumeSlider(true)} className="text-stone-500 hover:text-white transition-colors p-2 bg-stone-800/50 rounded-full border border-stone-700">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    {showVolumeSlider && (
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange} 
                        onMouseLeave={() => setShowVolumeSlider(false)}
                        className="w-24 accent-orange-500 cursor-pointer" 
                      />
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    Preacher Voice Master Audio
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Embedded Video Section */}
      {note.videoUrl && (
        <section className="mb-16 rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-xl bg-black">
          {getYoutubeId(note.videoUrl) ? (
            <iframe 
              className="w-full aspect-video" 
              src={`https://www.youtube.com/embed/${getYoutubeId(note.videoUrl)}`} 
              title="Sermon Video" 
              allowFullScreen 
            />
          ) : (
            <video controls className="w-full aspect-video" src={note.videoUrl} />
          )}
        </section>
      )}

      {/* Sermon Notes Content Body */}
      <main className="prose prose-stone prose-lg max-w-none font-serif leading-loose text-stone-800 mb-16">
        <div className="whitespace-pre-wrap">{renderContent(note.content)}</div>
      </main>

      {/* AI Study Guide Assistant */}
      <section className="my-16 bg-gradient-to-br from-orange-50/50 to-amber-50/30 p-8 sm:p-10 rounded-[2.5rem] border border-orange-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">Ministry Study Companion</h3>
              <p className="text-xs text-stone-500">Extract insights, questions, and personal prayer points</p>
            </div>
          </div>
          <Button 
            onClick={handleAiGenerate} 
            isLoading={isAiLoading}
            size="sm"
            className="rounded-xl px-6 self-start sm:self-auto font-bold"
          >
            {aiContent ? 'Regenerate Study Guide' : 'Generate Study Guide'}
          </Button>
        </div>

        {aiContent && (
          <div className="mt-6 p-6 bg-white rounded-2xl border border-orange-200/60 shadow-xs prose prose-stone text-stone-700 text-sm leading-relaxed">
            <div className="whitespace-pre-wrap font-sans">{aiContent}</div>
          </div>
        )}
      </section>

      {/* Related Sermon Series Notes */}
      {relatedSeriesNotes.length > 0 && (
        <section className="my-16 p-8 bg-amber-50/60 rounded-3xl border border-amber-200/80">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-4 h-4 text-orange-600 fill-orange-600" />
            <h3 className="font-serif text-xl font-bold text-stone-900">
              More in Series: {note.series}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedSeriesNotes.map(rn => (
              <div
                key={rn.id}
                onClick={() => onSelectNote && onSelectNote(rn)}
                className="bg-white p-4 rounded-xl border border-amber-100 hover:border-orange-300 hover:shadow-sm cursor-pointer transition-all"
              >
                <div className="text-[11px] font-bold text-stone-400 mb-1 flex items-center justify-between">
                  <span>{new Date(rn.date).toLocaleDateString()}</span>
                  <span>{rn.preacher}</span>
                </div>
                <h4 className="font-bold font-serif text-stone-900 hover:text-orange-600 text-base mb-1">
                  {rn.topic}
                </h4>
                <p className="text-stone-500 text-xs line-clamp-1">
                  {rn.content.replace(/[#*`_]/g, '')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-6 z-30 flex justify-center">
        <div className="bg-stone-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border border-white/10">
          <button 
            onClick={() => onLike(note.id)}
            className="flex items-center gap-2 text-stone-300 hover:text-red-400 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-bold">{note.likes}</span>
          </button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <div className="flex items-center gap-2 text-stone-300">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-bold">{note.comments.length}</span>
          </div>

          <div className="w-px h-6 bg-white/20" />

          <button 
            onClick={() => setIsBookmarked(!isBookmarked)} 
            className={`transition-colors ${isBookmarked ? 'text-orange-400' : 'text-stone-300 hover:text-white'}`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Discussion Area */}
      <section className="mt-16 pt-16 border-t border-stone-200/80 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-serif text-2xl font-bold text-stone-900">The Fellowship Reflections</h3>
          <div className="px-3.5 py-1 bg-stone-100 rounded-full text-xs font-bold text-stone-600">
            {note.comments.length} {note.comments.length === 1 ? 'Reflection' : 'Reflections'}
          </div>
        </div>
        
        <form onSubmit={handleCommentSubmit} className="mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-xs focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-500 transition-all">
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share how this sermon revelation spoke to your walk..."
              className="w-full text-stone-800 placeholder:text-stone-300 bg-transparent outline-none resize-none h-28 text-base font-serif"
            />
            <div className="flex justify-end pt-2 border-t border-stone-100">
              <Button type="submit" size="sm" disabled={!commentText.trim()} className="rounded-xl px-6 font-bold text-xs">
                Share Reflection
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {note.comments.map(comment => (
            <div key={comment.id} className="flex gap-4 p-5 bg-white rounded-2xl border border-stone-100 shadow-xs">
              <img src={comment.userAvatar} className="w-10 h-10 rounded-full object-cover border border-stone-200" alt="" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-stone-900 text-sm">{comment.userName}</span>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-stone-700 text-sm leading-relaxed font-serif">"{comment.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
