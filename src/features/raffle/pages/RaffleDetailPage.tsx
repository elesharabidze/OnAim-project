import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PATHS } from '@/routes/paths'
import type { DetailCreatedLocationState } from '@/routes/locationState'
import { useConsumeRouterFlash } from '@/shared/hooks/useConsumeRouterFlash'
import { formatDate, formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { useDeleteRaffle, useRaffle } from '../hooks'
import type { PrizeType, RaffleStatus } from '../types'

const STATUS_STYLE: Record<RaffleStatus, { label: string; bgcolor: string; color: string }> = {
  draft: { label: 'Draft', bgcolor: '#f0f0f0', color: '#555' },
  active: { label: 'Active', bgcolor: '#e6f7ec', color: '#389e0d' },
  drawn: { label: 'Drawn', bgcolor: '#f0e6ff', color: '#722ed1' },
  cancelled: { label: 'Cancelled', bgcolor: '#fff1f0', color: '#cf1322' },
}

const PRIZE_TYPE_LABELS: Record<PrizeType, string> = {
  coins: 'Coins',
  freeSpin: 'Free Spins',
  bonus: 'Bonus',
}

const PRIZE_TYPE_COLOR: Record<PrizeType, string> = {
  coins: '#b7791f',
  freeSpin: '#1677ff',
  bonus: '#389e0d',
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
        sx={{ minWidth: 180, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
  )
}

export default function RaffleDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: raffle, isLoading, isError } = useRaffle(id)
  const deleteMutation = useDeleteRaffle()
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
      navigate(PATHS.raffle.root, { state: { flashMessage: 'Raffle deleted.' } })
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

  if (isError || !raffle) {
    return (
      <Box maxWidth={600} mx="auto" py={4}>
        <Alert severity="error">
          Failed to load raffle. It may have been deleted or the server is offline.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(PATHS.raffle.root)}
        >
          Back to List
        </Button>
      </Box>
    )
  }

  const statusStyle = STATUS_STYLE[raffle.status]
  const isDrawn = raffle.status === 'drawn'

  return (
    <Box maxWidth={960} mx="auto">
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
          <CardGiftcardIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h5">{raffle.name}</Typography>
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{ bgcolor: statusStyle.bgcolor, color: statusStyle.color, fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Raffle details &amp; configuration
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(PATHS.raffle.root)}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            disabled={isDrawn}
            onClick={() => navigate(PATHS.raffle.edit(id))}
          >
            {isDrawn ? 'Cannot Edit' : 'Edit'}
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

      {isDrawn && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This raffle has been drawn. All fields are read-only and editing is disabled.
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Basic Information */}
        <DetailSection title="Basic Information">
          <Stack divider={<Divider />} spacing={0}>
            <FieldRow
              label="ID"
              value={
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ fontSize: '0.8rem', color: COLORS.SECONDARY_TEXT }}
                >
                  {raffle.id}
                </Typography>
              }
            />
            <FieldRow
              label="Name"
              value={<Typography variant="body2" fontWeight={600}>{raffle.name}</Typography>}
            />
            <FieldRow
              label="Description"
              value={
                <Typography
                  variant="body2"
                  color={raffle.description ? 'text.primary' : 'text.secondary'}
                >
                  {raffle.description || '—'}
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
              value={<Typography variant="body2">{formatDateTime(raffle.createdAt)}</Typography>}
            />
            <FieldRow
              label="Updated At"
              value={<Typography variant="body2">{formatDateTime(raffle.updatedAt)}</Typography>}
            />
          </Stack>
        </DetailSection>

        {/* Schedule */}
        <DetailSection title="Schedule">
          <Stack divider={<Divider />} spacing={0}>
            <FieldRow
              label="Start Date"
              value={<Typography variant="body2">{formatDate(raffle.startDate)}</Typography>}
            />
            <FieldRow
              label="End Date"
              value={<Typography variant="body2">{formatDate(raffle.endDate)}</Typography>}
            />
            <FieldRow
              label="Draw Date"
              value={
                <Typography variant="body2" fontWeight={600}>
                  {formatDate(raffle.drawDate)}
                </Typography>
              }
            />
          </Stack>
        </DetailSection>

        {/* Ticket Configuration */}
        <DetailSection title="Ticket Configuration">
          <Stack divider={<Divider />} spacing={0}>
            <FieldRow
              label="Ticket Price"
              value={
                <Box display="flex" alignItems="center" gap={0.75}>
                  <ConfirmationNumberIcon
                    fontSize="small"
                    sx={{ color: COLORS.SECONDARY_TEXT, fontSize: 16 }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    ${raffle.ticketPrice.toLocaleString()}
                  </Typography>
                </Box>
              }
            />
            <FieldRow
              label="Max Tickets per User"
              value={
                <Typography variant="body2">
                  {raffle.maxTicketsPerUser.toLocaleString()}
                </Typography>
              }
            />
            <FieldRow
              label="Total Ticket Limit"
              value={
                <Typography variant="body2">
                  {raffle.totalTicketLimit === null
                    ? 'Unlimited'
                    : raffle.totalTicketLimit.toLocaleString()}
                </Typography>
              }
            />
          </Stack>
        </DetailSection>

        {/* Prize Gallery */}
        <DetailSection title={`Prizes (${raffle.prizes.length})`}>
          {raffle.prizes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No prizes configured.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              {raffle.prizes.map((prize, index) => (
                <Box key={prize.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 3 },
                    }}
                  >
                    {prize.imageUrl ? (
                      <CardMedia
                        component="img"
                        height={140}
                        image={prize.imageUrl}
                        alt={prize.name}
                        sx={{ objectFit: 'cover', bgcolor: COLORS.SECONDARY_BACKGROUND }}
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 140,
                          bgcolor: COLORS.SECONDARY_BACKGROUND,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CardGiftcardIcon
                          sx={{ fontSize: 48, color: COLORS.PRIMARY_BORDER }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap={1}
                        mb={1}
                      >
                        <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                          {prize.name}
                        </Typography>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: COLORS.PRIMARY,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1.5px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{ fontSize: '0.6rem', color: COLORS.DARK_BACKGROUND }}
                          >
                            {index + 1}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={PRIZE_TYPE_LABELS[prize.type]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            color: PRIZE_TYPE_COLOR[prize.type],
                            borderColor: PRIZE_TYPE_COLOR[prize.type],
                          }}
                        />
                        <Chip
                          label={`×${prize.quantity}`}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            bgcolor: '#f5f5f5',
                            color: COLORS.SECONDARY_TEXT,
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ mt: 1 }}
                      >
                        {prize.amount.toLocaleString()} {prize.type === 'freeSpin' ? 'spins' : prize.type === 'coins' ? 'coins' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </DetailSection>
      </Stack>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Raffle?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            <strong>{raffle.name}</strong> and all its data will be permanently deleted. This
            cannot be undone.
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
          Raffle created successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
