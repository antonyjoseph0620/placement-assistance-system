export default function ReadinessGauge({ score, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Determine color based on score
  let color = '#ef4444'; // Red (0-59)
  if (score >= 80) color = '#10b981'; // Green (80-100)
  else if (score >= 60) color = '#f59e0b'; // Yellow (60-79)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg
        className="transform -rotate-90 absolute"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      
      {/* Score Text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-display font-bold text-3xl" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-white/50 font-mono tracking-widest mt-1 uppercase">
          Score
        </span>
      </div>
    </div>
  );
}
