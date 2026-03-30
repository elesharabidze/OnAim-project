import { Box, Typography } from '@mui/material'

interface PreviewSegment {
  label: string
  color: string
  weight: number
}

interface WheelPreviewProps {
  segments: PreviewSegment[]
  backgroundColor?: string
  borderColor?: string
  size?: number
  /** Current rotation in degrees (for spin animation) */
  rotation?: number
  /** Enables CSS transition when rotation changes */
  spinning?: boolean
  /** Duration of the spin transition in ms */
  spinDuration?: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${cx} ${cy}`,
    `L ${s.x.toFixed(3)} ${s.y.toFixed(3)}`,
    `A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`,
    'Z',
  ].join(' ')
}

function truncateLabel(text: string, sweepDeg: number): string {
  const maxLen = Math.max(2, Math.floor(sweepDeg / 12))
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

export default function WheelPreview({
  segments,
  backgroundColor = '#ffffff',
  borderColor = '#333333',
  size = 300,
  rotation = 0,
  spinning = false,
  spinDuration = 4000,
}: WheelPreviewProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  const hubR = r * 0.13
  const labelR = r * 0.62
  const fontSize = Math.max(9, Math.min(size * 0.038, 13))

  const validSegs = segments.filter((s) => s.weight > 0)
  const totalWeight = validSegs.reduce((sum, s) => sum + s.weight, 0)

  if (validSegs.length === 0 || totalWeight === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `3px solid #ddd`,
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center" px={2}>
          Add segments to preview
        </Typography>
      </Box>
    )
  }

  type SliceRow = PreviewSegment & { path: string; sweepDeg: number; midDeg: number }

  const slices = validSegs.reduce<{ items: SliceRow[]; cumAngle: number }>(
    (acc, seg) => {
      const sweepDeg = (seg.weight / totalWeight) * 360
      const startDeg = acc.cumAngle
      const endDeg = acc.cumAngle + sweepDeg
      const midDeg = startDeg + sweepDeg / 2
      acc.items.push({
        ...seg,
        path: slicePath(cx, cy, r, startDeg, endDeg),
        sweepDeg,
        midDeg,
      })
      return { items: acc.items, cumAngle: endDeg }
    },
    { items: [], cumAngle: 0 }
  ).items

  return (
    <Box sx={{ position: 'relative', width: size, height: size, userSelect: 'none' }}>
      {/* Fixed pointer arrow at top */}
      <Box
        sx={{
          position: 'absolute',
          top: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `22px solid ${borderColor}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />

      {/* Rotating wheel */}
      <Box
        sx={{
          width: size,
          height: size,
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
          transformOrigin: 'center',
          willChange: spinning ? 'transform' : 'auto',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: 'block' }}
          aria-label="Wheel preview"
        >
          {/* Background fill */}
          <circle cx={cx} cy={cy} r={r} fill={backgroundColor} />

          {/* Pie slices */}
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke={borderColor}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ))}

          {/* Labels — rotated radially, flipped for readability in bottom half */}
          {slices.map((s, i) => {
            if (s.sweepDeg < 10) return null
            const label = truncateLabel(s.label || `Seg ${i + 1}`, s.sweepDeg)
            const rawRot = s.midDeg - 90
            const rot = rawRot > 90 && rawRot <= 270 ? rawRot + 180 : rawRot
            const lp = polarToCartesian(cx, cy, labelR, s.midDeg)
            return (
              <text
                key={`lbl-${i}`}
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fontWeight="700"
                fontFamily="Inter, Arial, sans-serif"
                fill="#fff"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth={2.5}
                paintOrder="stroke"
                transform={`rotate(${rot}, ${lp.x}, ${lp.y})`}
              >
                {label}
              </text>
            )
          })}

          {/* Outer border ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={borderColor} strokeWidth={3} />

          {/* Divider tick marks */}
          {slices.map((s, i) => {
            const p1 = polarToCartesian(cx, cy, r - 1, s.midDeg - s.sweepDeg / 2)
            const p2 = polarToCartesian(cx, cy, r * 0.88, s.midDeg - s.sweepDeg / 2)
            return (
              <line
                key={`tick-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={borderColor}
                strokeWidth={1}
                opacity={0.4}
              />
            )
          })}

          {/* Hub shadow */}
          <circle cx={cx} cy={cy} r={hubR + 2} fill="rgba(0,0,0,0.15)" />
          {/* Hub */}
          <circle cx={cx} cy={cy} r={hubR} fill={borderColor} />
          <circle cx={cx} cy={cy} r={hubR * 0.55} fill="#fff" />
        </svg>
      </Box>
    </Box>
  )
}
