import React from 'react';
import { useThemeColors } from '../utils/theme-utils';

const EbbHeading = () => {
  const themeColors = useThemeColors();

  const gradientColors = themeColors.root === 'bg-amber-50'
    ? ['#87CEEB', '#4682B4', '#1E90FF', '#00BFFF', '#B0E0E6'] // Flowing creek colors
    : ['#191970', '#000080', '#00008B', '#0000CD', '#4169E1']; // Moonlight on water colors

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 mb-8">
      <style>
        {`
          @keyframes waveFlow {
            0% { background-position: 0% 50%; }
            100% { background-position: -200% 50%; }
          }
          .wave-text {
            background: linear-gradient(
              45deg,
              ${gradientColors.join(', ')},
              ${gradientColors[0]}
            );
            background-size: 400% 400%;
            animation: waveFlow 8s linear infinite;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            text-fill-color: transparent;
          }
        `}
      </style>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center whitespace-normal break-words">
        <span className="wave-text inline-block">
          Ebb - Find Your Flow
        </span>
      </h1>
    </div>
  );
};

export default EbbHeading;