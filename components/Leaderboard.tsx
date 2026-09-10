import React from 'react';
import { User } from '../types';
import { Trophy, Users, BookOpen } from 'lucide-react';
import { Button } from './Button';

interface LeaderboardProps {
  users: User[];
  onFollow: (id: string) => void;
  currentUser: User;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onFollow, currentUser }) => {
  // Sort users by total notes + followers (simple ranking algorithm)
  const rankedUsers = [...users].sort((a, b) => {
    const scoreA = (a.totalNotes * 2) + a.followers;
    const scoreB = (b.totalNotes * 2) + b.followers;
    return scoreB - scoreA;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-2">Community Voices</h2>
        <p className="text-stone-500">Top contributors enriching the Body of Christ</p>
      </div>

      <div className="space-y-4">
        {rankedUsers.map((user, index) => {
          const isFollowing = currentUser.following.includes(user.id);
          const isMe = currentUser.id === user.id;

          return (
            <div key={user.id} className="flex items-center p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 flex justify-center mr-4 font-bold text-stone-400 font-serif">
                 {index + 1}
              </div>
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-stone-100" />
              
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                    <h3 className="font-bold text-stone-900">{user.name}</h3>
                    {index < 3 && <Trophy className={`w-4 h-4 ml-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-stone-400' : 'text-amber-700'}`} />}
                </div>
                <div className="flex items-center text-xs text-stone-500 mt-1 space-x-3">
                    <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {user.totalNotes} notes</span>
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {user.followers} followers</span>
                </div>
                {user.churchAffiliation && (
                    <p className="text-xs text-stone-400 mt-1">{user.churchAffiliation}</p>
                )}
              </div>

              {!isMe && (
                  <Button 
                    variant={isFollowing ? 'ghost' : 'secondary'} 
                    size="sm"
                    onClick={() => onFollow(user.id)}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};