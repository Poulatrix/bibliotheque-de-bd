import React from 'react';

interface AlphabetNavProps {
  onLetterClick: (letter: string) => void;
}

export function AlphabetNav({ onLetterClick }: AlphabetNavProps) {
  const alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <nav className="alphabet-nav">
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(letter)}
          className="hover:bg-library-accent hover:text-white"
        >
          {letter}
        </button>
      ))}
    </nav>
  );
}