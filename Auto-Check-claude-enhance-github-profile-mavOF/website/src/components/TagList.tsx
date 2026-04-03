'use client';

interface TagListProps {
  tags: string[];
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
  clickable?: boolean;
}

export default function TagList({ tags, activeTag, onTagClick, clickable = false }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          onClick={clickable && onTagClick ? () => onTagClick(tag) : undefined}
          className={`tag ${clickable ? 'cursor-pointer' : 'cursor-default'} ${
            activeTag === tag ? 'tag-active' : ''
          }`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
