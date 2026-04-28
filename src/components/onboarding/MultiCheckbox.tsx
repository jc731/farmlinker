import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  searchable?: boolean;
  columns?: 1 | 2 | 3;
}

export function MultiCheckbox({ options, value, onChange, searchable = false, columns = 2 }: Props) {
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter(v => v !== option) : [...value, option]);
  };

  return (
    <div className="space-y-2">
      {searchable && (
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}
      <div
        className={cn(
          'grid gap-2 rounded-md border border-input p-3',
          searchable && 'max-h-48 overflow-y-auto',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3'
        )}
      >
        {filtered.map(option => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => toggle(option)}
              className="accent-primary"
            />
            {option}
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No matches</p>
        )}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} selected</p>
      )}
    </div>
  );
}
