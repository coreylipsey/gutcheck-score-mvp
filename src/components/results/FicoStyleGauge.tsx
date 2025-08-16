interface FicoStyleGaugeProps {
  score: number;
  maxScore?: number;
  minScore?: number;
  currentTier: {
    stars: number;
    name: string;
    creditLabel: string;
    color: string;
    percentile: string;
  };
  starTiers: Array<{
    stars: number;
    min: number;
    max: number;
    name: string;
    creditLabel: string;
    color: string;
    percentile: string;
  }>;
}

export function FicoStyleGauge({ 
  score, 
  maxScore = 100, 
  minScore = 35, 
  currentTier,
  starTiers 
}: FicoStyleGaugeProps) {
  
  // Safety checks to prevent NaN values
  const safeScore = isNaN(score) || score === null || score === undefined ? 0 : Math.max(minScore, Math.min(maxScore, score));
  const safeMaxScore = isNaN(maxScore) || maxScore === null || maxScore === undefined ? 100 : maxScore;
  const safeMinScore = isNaN(minScore) || minScore === null || minScore === undefined ? 35 : minScore;
  
  // Calculate proportional segments based on actual score ranges
  const createProportionalSegments = () => {
    const centerX = 200;
    const centerY = 220;
    const radius = 130;
    const strokeWidth = 28;
    
    const segments: Array<{
      path: string;
      color: string;
      tier: string;
      startAngle: number;
      endAngle: number;
      score: number;
    }> = [];
    const totalRange = safeMaxScore - safeMinScore; // 100 - 35 = 65 points
    const totalArcAngle = 180; // Semicircle
    
    let currentAngle = 0;
    
    starTiers.forEach((tier, index) => {
      // Calculate the actual range for this tier
      const tierRange = tier.max - tier.min + 1; // Include both endpoints
      // Calculate the proportional angle based on actual range
      const tierAngleSpan = (tierRange / totalRange) * totalArcAngle;
      
      // Calculate arc start and end angles  
      const segmentStartAngle = 180 + currentAngle; // Start from left (180°)
      const segmentEndAngle = 180 + currentAngle + tierAngleSpan;
      
      // Convert to radians for SVG path calculations
      const startRad = segmentStartAngle * (Math.PI / 180);
      const endRad = segmentEndAngle * (Math.PI / 180);
      
      // Calculate the arc path coordinates
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      const largeArcFlag = tierAngleSpan > 180 ? 1 : 0;
      
      // Create arc path for this segment
      const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      
      segments.push({
        path: arcPath,
        color: tier.color,
        tier: tier.name,
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        score: tier.min
      });
      
      currentAngle += tierAngleSpan;
    });
    
    return segments;
  };

  // Calculate needle position - positioned outside the arc
  const getNeedlePosition = () => {
    const centerX = 200;
    const centerY = 220;
    const innerRadius = 140; // Start closer to the colored arc
    const outerRadius = 170; // Longer needle for more prominence
    
    const scoreRange = safeScore - safeMinScore;
    const totalRange = safeMaxScore - safeMinScore;
    const angle = 180 + (scoreRange / totalRange) * 180; // 180 to 360 degrees
    const angleRad = angle * (Math.PI / 180);
    
    // Needle starts closer to the colored arc
    const needleStartX = centerX + innerRadius * Math.cos(angleRad);
    const needleStartY = centerY + innerRadius * Math.sin(angleRad);
    
    // Needle ends further out for more prominence
    const needleEndX = centerX + outerRadius * Math.cos(angleRad);
    const needleEndY = centerY + outerRadius * Math.sin(angleRad);
    
    return { 
      startX: needleStartX, 
      startY: needleStartY,
      endX: needleEndX, 
      endY: needleEndY,
      angle 
    };
  };

  const segments = createProportionalSegments();
  const needlePos = getNeedlePosition();
  
  const centerX = 200;
  const centerY = 220;
  const radius = 130;

  return (
    <div className="relative">
      <svg width="400" height="320" viewBox="0 0 400 320" className="overflow-visible">
        
        {/* Background arc */}
        <path
          d={`M 70 220 A 130 130 0 0 1 330 220`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="28"
        />
        
        {/* Proportional colored segments with straight line breaks */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill="none"
            stroke={segment.color}
            strokeWidth="28"
            className="transition-all duration-1500 ease-out"
          />
        ))}
        
        {/* Score markers - only breakpoint numbers */}
        {starTiers.map((tier, index) => {
          const tierAngle = 180 + ((tier.min - safeMinScore) / (safeMaxScore - safeMinScore)) * 180;
          const tierAngleRad = tierAngle * (Math.PI / 180);
          const markerRadius = 165; // Positioned outside the needle
          const markerX = centerX + markerRadius * Math.cos(tierAngleRad);
          const markerY = centerY + markerRadius * Math.sin(tierAngleRad);
          
          return (
            <g key={index}>
              {/* Score marker tick */}
              <line
                x1={centerX + 115 * Math.cos(tierAngleRad)}
                y1={centerY + 115 * Math.sin(tierAngleRad)}
                x2={centerX + 145 * Math.cos(tierAngleRad)}
                y2={centerY + 145 * Math.sin(tierAngleRad)}
                stroke="#6B7280"
                strokeWidth="2"
              />
              
              {/* Score number only */}
              <text
                x={markerX}
                y={markerY + 5}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-600"
              >
                {tier.min}
              </text>
            </g>
          );
        })}
        
        {/* External needle - more prominent */}
        <g>
          <line
            x1={needlePos.startX}
            y1={needlePos.startY}
            x2={needlePos.endX}
            y2={needlePos.endY}
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
            className="drop-shadow-sm transition-all duration-2000 ease-out"
          />
          
          {/* Larger needle tip indicator */}
          <circle
            cx={needlePos.endX}
            cy={needlePos.endY}
            r="4"
            fill="#1f2937"
          />
        </g>
        
        {/* Scale range labels - just min and max */}
        <text x="70" y="250" textAnchor="middle" className="text-sm font-medium fill-gray-600">
          {safeMinScore}
        </text>
        <text x="330" y="250" textAnchor="middle" className="text-sm font-medium fill-gray-600">
          {safeMaxScore}
        </text>
      </svg>
      
      {/* Center score display - only the number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '40px' }}>
        <div 
          className="text-6xl md:text-7xl font-bold leading-none"
          style={{ 
            background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {safeScore}
        </div>
      </div>
    </div>
  );
}
