import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'w-8 h-8 rounded-full' }) => {
  const [error, setError] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'CS';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  // Color gradient based on name hash for consistent elegant colors
  const getGradient = (str: string) => {
    const gradients = [
      'from-indigo-600 to-purple-600',
      'from-emerald-600 to-teal-600',
      'from-cyan-600 to-blue-600',
      'from-rose-600 to-pink-600',
      'from-amber-600 to-orange-600',
      'from-violet-600 to-indigo-600',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (!src || error) {
    return (
      <div 
        className={`${className} bg-gradient-to-tr ${getGradient(name)} flex items-center justify-center font-bold text-white text-[11px] shadow-sm select-none border border-white/10 flex-shrink-0`}
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={`${className} object-cover flex-shrink-0`}
      referrerPolicy="no-referrer"
    />
  );
};
