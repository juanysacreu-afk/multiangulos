import React from 'react';
import {
  Bot,
  Rocket,
  Wand2,
  Sparkles,
  Crown,
  Cat,
  Zap,
  Smile,
  LucideProps,
} from 'lucide-react';

interface AvatarIconProps extends LucideProps {
  avatarId?: string;
  emoji?: string;
  className?: string;
}

// Custom crisp SVG for Dino Titán
const DinoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    strokeWidth="0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 3c-2.2 0-4 1.2-5 3-.6 1.1-1.2 2.2-2.1 3.1-1 .9-2.2 1.4-3.9 1.4H6v2h1c1.5 0 2.8.5 3.8 1.5.8.8 1.3 1.8 1.5 2.9l-2.3 2.1 1.4 1.4 3-2.7c.3.5.7.9 1.2 1.2l-.6 2.5 1.9.5.8-3.1c1.1-.3 2-1 2.6-2 .7-1.1 1.1-2.4 1.4-3.7.2-1 .3-2 .3-3.1V5c0-1.1-.9-2-2-2zm-3 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
  </svg>
);

// Custom crisp SVG for Zorro Astuto
const FoxIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 4l3 9 5-3 5 3 3-9-4 2-4-2-4 2z" />
    <path d="M8 17l4 4 4-4" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

export const AvatarIcon: React.FC<AvatarIconProps> = ({
  avatarId,
  emoji,
  className = 'w-6 h-6',
  ...rest
}) => {
  const val = (avatarId || emoji || '').toLowerCase();

  if (val.includes('dino') || val.includes('\u{1F996}')) {
    return <DinoIcon className={className} />;
  }
  if (val.includes('zorro') || val.includes('\u{1F98A}')) {
    return <FoxIcon className={className} />;
  }
  if (val.includes('astronauta') || val.includes('rocket') || val.includes('\u{1F680}')) {
    return <Rocket className={className} {...rest} />;
  }
  if (val.includes('mago') || val.includes('\u{1F9D9}')) {
    return <Wand2 className={className} {...rest} />;
  }
  if (val.includes('unicornio') || val.includes('\u{1F984}')) {
    return <Sparkles className={className} {...rest} />;
  }
  if (val.includes('leon') || val.includes('\u{1F981}')) {
    return <Crown className={className} {...rest} />;
  }
  if (val.includes('michi') || val.includes('cat') || val.includes('\u{1F431}')) {
    return <Cat className={className} {...rest} />;
  }
  if (val.includes('super-rayo') || val.includes('rayo') || val.includes('\u26A1')) {
    return <Zap className={className} {...rest} />;
  }
  if (val.includes('panda') || val.includes('\u{1F43C}')) {
    return <Smile className={className} {...rest} />;
  }
  if (val.includes('ninja') || val.includes('robot') || val.includes('\u{1F916}')) {
    return <Bot className={className} {...rest} />;
  }

  return <Bot className={className} {...rest} />;
};
