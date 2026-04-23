'use client';

interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function Chip({ label, selected, onToggle, disabled = false }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`chip${selected ? ' selected' : ''}${disabled && !selected ? ' disabled' : ''}`}
    >
      {selected && <span className="chip-check">✓</span>}
      {label}
    </button>
  );
}
