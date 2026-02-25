'use client';

interface Props {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({ value, max = 100, label, showPercent = false }: Props) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full space-y-1">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-gray-600">
          {label && <span>{label}</span>}
          {showPercent && <span>{percent}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
