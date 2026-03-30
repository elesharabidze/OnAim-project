import { useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { PATHS } from '@/routes/paths'
import type { DetailCreatedLocationState } from '@/routes/locationState'
import { useConsumeRouterFlash } from '@/shared/hooks/useConsumeRouterFlash'
import { formatDate, formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { useDeleteLeaderboard, useLeaderboard } from '../hooks'
import type { LeaderboardStatus, PrizeType } from '../types'

const STATUS_STYLE: Record<LeaderboardStatus, { label: string; bgcolor: string; color: string }> = {
  draft: { label: 'Draft', bgcolor: '#f0f0f0', color: '#555' },
  active: { label: 'Active', bgcolor: '#e6f7ec', color: '#389e0d' },
  completed: { label: 'Completed', bgcolor: '#e6f0ff', color: '#1677ff' },
}

const PRIZE_TYPE_LABELS: Record<PrizeType, string> = {
  coins: 'Coins',
  freeSpin: 'Free Spins',
  bonus: 'Bonus',
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
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
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
  )
}

export default function LeaderboardDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: leaderboard, isLoading, isError } = useLeaderboard(id)
  const deleteMutation = useDeleteLeaderboard()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createdSnackbarOpen, setCreatedSnackbarOpen] = useState(false)

  useConsumeRouterFlash(
    (state) =>
      (state as DetailCreatedLocationState | null)?.createdFlash ? true : undefined,
    () => setCreatedSnackbarOpen(true)
  )

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      navigate(PATHS.leaderboard.root, {
        state: { flashMessage: 'Leaderboard deleted.' },
      })
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

  if (isError || !leaderboard) {
    return (
      <Box maxWidth={600} mx="auto" py={4}>
        <Alert severity="error">
          Failed to load leaderboard. It may have been deleted or the server is offline.
        </Alert>
        <Button sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} onClick={() => navigate(PATHS.leaderboard.root)}>
          Back to List
        </Button>
      </Box>
    )
  }

  const statusStyle = STATUS_STYLE[leaderboard.status]

  return (
    <Box maxWidth={900} mx="auto">
      {/* Header */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EmojiEventsIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h5">{leaderboard.title}</Typography>
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Leaderboard details &amp; configuration
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(PATHS.leaderboard.root)}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => navigate(PATHS.leaderboard.edit(id))}
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

      <Stack spacing={3}>
        {/* Basic Info */}
        <DetailSection title="Basic Information">
          <Stack divider={<Divider />} spacing={0}>
            <FieldRow label="ID" value={
              <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.8rem', color: COLORS.SECONDARY_TEXT }}>
                {leaderboard.id}
              </Typography>
            } />
            <FieldRow label="Title" value={
              <Typography variant="body2" fontWeight={600}>{leaderboard.title}</Typography>
            } />
            <FieldRow label="Description" value={
              <Typography variant="body2" color={leaderboard.description ? 'text.primary' : 'text.secondary'}>
                {leaderboard.description || '—'}
              </Typography>
            } />
            <FieldRow label="Status" value={
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 600 }}
              />
            } />
            <FieldRow label="Created At" value={
              <Typography variant="body2">{formatDateTime(leaderboard.createdAt)}</Typography>
            } />
            <FieldRow label="Updated At" value={
              <Typography variant="body2">{formatDateTime(leaderboard.updatedAt)}</Typography>
            } />
          </Stack>
        </DetailSection>

        {/* Configuration */}
        <DetailSection title="Configuration">
          <Stack divider={<Divider />} spacing={0}>
            <FieldRow label="Scoring Type" value={
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {leaderboard.scoringType}
              </Typography>
            } />
            <FieldRow label="Start Date" value={
              <Typography variant="body2">{formatDate(leaderboard.startDate)}</Typography>
            } />
            <FieldRow label="End Date" value={
              <Typography variant="body2">{formatDate(leaderboard.endDate)}</Typography>
            } />
            <FieldRow label="Max Participants" value={
              <Typography variant="body2">{leaderboard.maxParticipants.toLocaleString()}</Typography>
            } />
          </Stack>
        </DetailSection>

        {/* Prizes */}
        <DetailSection title={`Prizes (${leaderboard.prizes.length})`}>
          {leaderboard.prizes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No prizes configured.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Image</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.prizes
                    .slice()
                    .sort((a, b) => a.rank - b.rank)
                    .map((prize) => (
                      <TableRow key={prize.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: RANK_COLORS[prize.rank] ?? COLORS.PRIMARY_BORDER,
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid rgba(0,0,0,0.08)',
                            }}
                          >
                            <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.65rem' }}>
                              {prize.rank}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {prize.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={PRIZE_TYPE_LABELS[prize.type]}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {prize.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {prize.imageUrl ? (
                            <Box
                              component="img"
                              src={prize.imageUrl}
                              alt={prize.name}
                              sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', border: `1px solid ${COLORS.PRIMARY_BORDER}` }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DetailSection>
      </Stack>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Leaderboard?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{leaderboard.title}</strong> and all its data will be permanently deleted. This cannot be undone.
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
          Leaderboard created successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
