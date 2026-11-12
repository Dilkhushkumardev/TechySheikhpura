import React, { useMemo } from 'react';

interface DelegateQrSvgProps {
  seedText: string;
  label: string;
  className?: string;
}

/**
 * Generates a deterministic 13x13 QR-like visual matrix with 3 finder patterns
 * from a delegate registration payload so holographic pass badges render consistently.
 */
function buildQrCells(seedText: string): boolean[] {
  const size = 13;
  const cells = new Array<boolean>(size * size).fill(false);

  const setFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        cells[(startRow + r) * size + (startCol + c)] = isBorder || isCenter;
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 5);
  setFinder(size - 5, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash ^= r * 31 + c * 17 + 7;
      hash = Math.imul(hash, 16777619);
      cells[r * size + c] = (hash & 1) === 1;
    }
  }

  return cells;
}

export const DelegateQrSvg: React.FC<DelegateQrSvgProps> = ({
  seedText,
  label,
  className = 'w-16 h-16',
}) => {
  const cells = useMemo(() => buildQrCells(seedText), [seedText]);

  return (
    <svg
      viewBox="0 0 13 13"
      className={className}
      shapeRendering="crispEdges"
      aria-label={label}
    >
      <rect width="13" height="13" fill="#ffffff" />
      {cells.map((filled, idx) =>
        filled ? (
          <rect
            key={`qr-${Math.floor(idx / 13)}-${idx % 13}`}
            x={idx % 13}
            y={Math.floor(idx / 13)}
            width="1"
            height="1"
            fill="#020003"
          />
        ) : null
      )}
    </svg>
  );
};

