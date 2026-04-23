'use client';

interface RadioCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RadioCard({ label, selected, onSelect }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`radio-card${selected ? ' selected' : ''}`}
    >
      {selected && <span className="radio-dot" />}
      <span>{label}</span>
    </button>
  );
}
