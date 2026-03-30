import { useCallback, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CasinoIcon from '@mui/icons-material/Casino'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PATHS } from '@/routes/paths'
import type { DetailCreatedLocationState } from '@/routes/locationState'
import { useConsumeRouterFlash } from '@/shared/hooks/useConsumeRouterFlash'
import { formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import WheelPreview from '../components/WheelPreview'
import { useDeleteWheel, useWheel } from '../hooks'
import type { WheelPrizeType, WheelStatus } from '../types'

const SPIN_DURATION = 4000

const STATUS_STYLE: Record<WheelStatus, { label: string; bgcolor: string; color: string }> = {
  draft: { label: 'Draft', bgcolor: '#f0f0f0', color: '#555' },
  active: { label: 'Active', bgcolor: '#e6f7ec', color: '#389e0d' },
  inactive: { label: 'Inactive', bgcolor: '#fff1f0', color: '#cf1322' },
}

const PRIZE_TYPE_LABELS: Record<WheelPrizeType, string> = {
  coins: 'Coins',
  freeSpin: 'Free Spin',
  bonus: 'Bonus',
  nothing: 'Nothing',
}

const PRIZE_TYPE_COLOR: Record<WheelPrizeType, string> = {
  coins: '#b7791f',
  freeSpin: '#1677ff',
  bonus: '#389e0d',
  nothing: '#999',
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing="0.05em"
          mb={2}
        >
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box display="flex" gap={2} py={0.75}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 200, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
  )
}

export default function WheelDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wheel, isLoading, isError } = useWheel(id)
  const deleteMutation = useDeleteWheel()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createdSnackbarOpen, setCreatedSnackbarOpen] = useState(false)

  useConsumeRouterFlash(
    (state) =>
      (state as DetailCreatedLocationState | null)?.createdFlash ? true : undefined,
    () => setCreatedSnackbarOpen(true)
  )

  // Spin animation state
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winnerSnackbar, setWinnerSnackbar] = useState<{
    open: boolean
    label: string
    color: string
    prizeType: WheelPrizeType
  }>({ open: false, label: '', color: '#ccc', prizeType: 'nothing' })
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSpin = useCallback(() => {
    if (!wheel || isSpinning || wheel.segments.length === 0) return

    const validSegs = wheel.segments.filter((s) => s.weight > 0)
    const totalWeight = validSegs.reduce((sum, s) => sum + s.weight, 0)
    if (totalWeight === 0) return

    // Pick a winning segment by weight
    let rand = Math.random() * totalWeight
    let winnerSeg = validSegs[validSegs.length - 1]
    let winnerStart = 0
    let cumWeight = 0
    for (const seg of validSegs) {
      winnerStart = (cumWeight / totalWeight) * 360
      cumWeight += seg.weight
      if (rand < cumWeight) {
        winnerSeg = seg
        break
      }
      rand = Math.random() * totalWeight // fallback safety
    }

    // We want the pointer (at top = 0°) to land in the middle of the winning segment.
    // The wheel starts at rotation=0 meaning segment 0 top is at 0°.
    // When wheel rotates R degrees clockwise, the segment originally at angle A is now at (A - R + 360) % 360.
    // We want the pointer to be at the midpoint of the winning segment.
    const winnerMidDeg = winnerStart + ((winnerSeg.weight / totalWeight) * 360) / 2
    // We need: (winnerMidDeg - targetRotation) % 360 ≡ 0 (mod 360)
    // So targetRotation ≡ winnerMidDeg (mod 360)
    const extraSpins = 5
    const baseRotation = rotation % 360
    let targetOffset = winnerMidDeg - baseRotation
    if (targetOffset <= 0) targetOffset += 360
    const targetRotation = rotation + extraSpins * 360 + targetOffset

    setIsSpinning(true)
    setRotation(targetRotation)

    if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    spinTimerRef.current = setTimeout(() => {
      setIsSpinning(false)
      setWinnerSnackbar({
        open: true,
        label: winnerSeg.label,
        color: winnerSeg.color,
        prizeType: winnerSeg.prizeType as WheelPrizeType,
      })
    }, SPIN_DURATION + 100)
  }, [wheel, isSpinning, rotation])

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      navigate(PATHS.wheel.root, { state: { flashMessage: 'Wheel deleted.' } })
    } catch {
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !wheel) {
    return (
      <Box maxWidth={600} mx="auto" py={4}>
        <Alert severity="error">
          Failed to load wheel. It may have been deleted or the server is offline.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(PATHS.wheel.root)}
        >
          Back to List
        </Button>
      </Box>
    )
  }

  const statusStyle = STATUS_STYLE[wheel.status]
  const totalWeight = wheel.segments.reduce((sum, s) => sum + s.weight, 0)

  return (
    <Box maxWidth={1100} mx="auto">
      {/* Header */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <CasinoIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h5">{wheel.name}</Typography>
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Wheel details &amp; configuration
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(PATHS.wheel.root)}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => navigate(PATHS.wheel.edit(id))}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', lg: '1fr 340px' }}
        gap={3}
        alignItems="start"
      >
        {/* Left: Detail sections */}
        <Stack spacing={3}>
          {/* Basic Information */}
          <DetailSection title="Basic Information">
            <Stack divider={<Divider />} spacing={0}>
              <FieldRow
                label="ID"
                value={
                  <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem" color="text.secondary">
                    {wheel.id}
                  </Typography>
                }
              />
              <FieldRow
                label="Name"
                value={<Typography variant="body2" fontWeight={600}>{wheel.name}</Typography>}
              />
              <FieldRow
                label="Description"
                value={
                  <Typography variant="body2" color={wheel.description ? 'text.primary' : 'text.secondary'}>
                    {wheel.description || '—'}
                  </Typography>
                }
              />
              <FieldRow
                label="Status"
                value={
                  <Chip
                    label={statusStyle.label}
                    size="small"
                    sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 600 }}
                  />
                }
              />
              <FieldRow
                label="Created At"
                value={<Typography variant="body2">{formatDateTime(wheel.createdAt)}</Typography>}
              />
              <FieldRow
                label="Updated At"
                value={<Typography variant="body2">{formatDateTime(wheel.updatedAt)}</Typography>}
              />
            </Stack>
          </DetailSection>

          {/* Spin Configuration */}
          <DetailSection title="Spin Configuration">
            <Stack divider={<Divider />} spacing={0}>
              <FieldRow
                label="Spin Cost"
                value={
                  wheel.spinCost === 0 ? (
                    <Chip label="Free" size="small" sx={{ bgcolor: '#e6f7ec', color: '#389e0d', fontWeight: 600 }} />
                  ) : (
                    <Typography variant="body2" fontWeight={600}>
                      🪙 {wheel.spinCost.toLocaleString()} coins
                    </Typography>
                  )
                }
              />
              <FieldRow
                label="Max Spins per User"
                value={
                  <Typography variant="body2" fontWeight={600}>
                    {wheel.maxSpinsPerUser.toLocaleString()}
                  </Typography>
                }
              />
            </Stack>
          </DetailSection>

          {/* Wheel Colors */}
          <DetailSection title="Wheel Appearance">
            <Stack divider={<Divider />} spacing={0}>
              <FieldRow
                label="Background Color"
                value={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        bgcolor: wheel.backgroundColor,
                        border: '1px solid rgba(0,0,0,0.15)',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontFamily="monospace">
                      {wheel.backgroundColor}
                    </Typography>
                  </Box>
                }
              />
              <FieldRow
                label="Border / Hub Color"
                value={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        bgcolor: wheel.borderColor,
                        border: '1px solid rgba(0,0,0,0.15)',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" fontFamily="monospace">
                      {wheel.borderColor}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </DetailSection>

          {/* Segments Table */}
          <DetailSection title={`Segments (${wheel.segments.length})`}>
            {wheel.segments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No segments configured.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {totalWeight !== 100 && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    Segment weights sum to {totalWeight}, not 100. This wheel may have a configuration issue.
                  </Alert>
                )}

                {wheel.segments.map((seg, idx) => (
                  <Box
                    key={seg.id ?? idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      borderLeft: `4px solid ${seg.color}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: seg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1.5px solid rgba(0,0,0,0.12)',
                      }}
                    >
                      <Typography variant="caption" fontWeight={800} fontSize="0.6rem" sx={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {idx + 1}
                      </Typography>
                    </Box>

                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {seg.label}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.25} flexWrap="wrap">
                        <Chip
                          label={PRIZE_TYPE_LABELS[seg.prizeType]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.68rem',
                            height: 20,
                            color: PRIZE_TYPE_COLOR[seg.prizeType],
                            borderColor: PRIZE_TYPE_COLOR[seg.prizeType],
                          }}
                        />
                        {seg.prizeType !== 'nothing' && (
                          <Typography variant="caption" color="text.secondary" alignSelf="center">
                            {seg.prizeAmount.toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box textAlign="right" flexShrink={0}>
                      <Typography variant="body2" fontWeight={700} color={COLORS.PRIMARY_ORANGE}>
                        {seg.weight}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        weight
                      </Typography>
                    </Box>

                    <Tooltip title={seg.color}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor: seg.color,
                          border: '1.5px solid rgba(0,0,0,0.12)',
                          flexShrink: 0,
                          cursor: 'default',
                        }}
                      />
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            )}
          </DetailSection>
        </Stack>

        {/* Right: Wheel visualization + spin */}
        <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb={2}
              >
                Wheel Visualization
              </Typography>

              <Box display="flex" justifyContent="center" mb={2}>
                <WheelPreview
                  segments={wheel.segments}
                  backgroundColor={wheel.backgroundColor}
                  borderColor={wheel.borderColor}
                  size={300}
                  rotation={rotation}
                  spinning={isSpinning}
                  spinDuration={SPIN_DURATION}
                />
              </Box>

              <Box display="flex" justifyContent="center" mb={2}>
                <Button
                  variant="contained"
                  startIcon={<CasinoIcon />}
                  onClick={handleSpin}
                  disabled={isSpinning || wheel.segments.length < 2 || totalWeight === 0}
                  sx={{ minWidth: 140 }}
                >
                  {isSpinning ? 'Spinning…' : 'Spin the Wheel'}
                </Button>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={0.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Total segments</Typography>
                  <Typography variant="caption" fontWeight={700}>{wheel.segments.length}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Weight sum</Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={totalWeight === 100 ? 'success.main' : 'error.main'}
                  >
                    {totalWeight} / 100
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Spin cost</Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {wheel.spinCost === 0 ? 'Free' : `🪙 ${wheel.spinCost}`}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Max spins / user</Typography>
                  <Typography variant="caption" fontWeight={700}>{wheel.maxSpinsPerUser}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Wheel?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{wheel.name}</strong> and all its segment data will be permanently deleted.
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={createdSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setCreatedSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCreatedSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          Wheel created successfully!
        </Alert>
      </Snackbar>

      {/* Winner announcement snackbar */}
      <Snackbar
        open={winnerSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setWinnerSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setWinnerSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          icon={<CasinoIcon />}
          sx={{ alignItems: 'center' }}
        >
          <strong>Result:</strong>{' '}
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: winnerSnackbar.color,
              border: '1.5px solid rgba(255,255,255,0.6)',
              verticalAlign: 'middle',
              mr: 0.5,
              ml: 0.5,
            }}
          />
          {winnerSnackbar.label}{' '}
          <Typography component="span" variant="caption" sx={{ opacity: 0.85 }}>
            ({PRIZE_TYPE_LABELS[winnerSnackbar.prizeType]})
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  )
}
