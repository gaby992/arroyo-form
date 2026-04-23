'use client';

import { KeyboardEvent } from 'react';

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  multiline?: boolean;
  maxLength?: number;
  error?: boolean;
  autoFocus?: boolean;
}

export default function TextInput({
  value,
  onChange,
  onEnter,
  placeholder,
  type = 'text',
  multiline = false,
  maxLength,
  error = false,
  autoFocus = false,
}: TextInputProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  const baseClass = `form-input${error ? ' shake' : ''}`;

  if (multiline) {
    return (
      <textarea
        className={baseClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        rows={4}
      />
    );
  }

  return (
    <input
      className={baseClass}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKey}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
    />
  );
}
