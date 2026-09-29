import React from 'react';

interface AvatarProps {
  name: string;
  hasFollowup?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Clean initials-based avatar adhering strictly to specification:
 * - Ink navy circle background (#12151C)
 * - Warm paper-colored initials (#EFEAE0)
 * - Muted gold ring (#C89B3C) if contact has an unresolved follow-up
 * - Strictly no photographic headshots
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  hasFollowup = false,
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return 'MM';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-20 h-20 text-[26px]',
  }[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`rounded-full flex items-center justify-center font-serif font-semibold select-none transition-all ${sizeClasses} ${
          hasFollowup
            ? 'ring-2 ring-[#C89B3C] ring-offset-2 ring-offset-[#FEF9EF]'
            : 'ring-1 ring-[#DDD7CD]'
        }`}
        style={{
          backgroundColor: '#12151C',
          color: '#EFEAE0',
        }}
        title={`${name}${hasFollowup ? ' (Unresolved follow-up pending)' : ''}`}
      >
        <span>{initials}</span>
      </div>

      {hasFollowup && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C89B3C] ring-2 ring-[#FEF9EF]"
          title="Unresolved Follow-up"
        />
      )}
    </div>
  );
};
