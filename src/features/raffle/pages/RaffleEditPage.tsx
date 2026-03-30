import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PATHS } from '@/routes/paths'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import COLORS from '@/styles/colors'
import RaffleForm from '../components/RaffleForm'
import { useRaffle, useUpdateRaffle } from '../hooks'
import type { RaffleFormValues } from '../schemas'
import type { RafflePrize } from '../types'

function toFormPrize(p: RafflePrize) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    amount: p.amount,
    quantity: p.quantity,
    imageUrl: p.imageUrl,
  }
}

function toDateInput(iso: string): string {
  return iso ? (iso.split('T')[0] ?? '') : ''
}

export default function RaffleEditPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: raffle, isLoading, isError } = useRaffle(id)
  const updateMutation = useUpdateRaffle(id)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.raffle.detail(id))
  }

  const handleSubmit = async (data: RaffleFormValues) => {
    setError(null)
    try {
      await updateMutation.mutateAsync(data)
      setIsDirty(false)
      setSuccessOpen(true)
      setTimeout(() => navigate(PATHS.raffle.detail(id)), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update raffle.')
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
        <Button sx={{ mt: 2 }} onClick={() => navigate(PATHS.raffle.root)}>
          Back to List
        </Button>
      </Box>
    )
  }

  if (raffle.status === 'drawn') {
    return (
      <Box maxWidth={600} mx="auto" py={6} textAlign="center">
        <BlockIcon sx={{ fontSize: 56, color: COLORS.PRIMARY_BORDER, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Editing not allowed
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          This raffle has already been drawn and can no longer be edited.
        </Typography>
        <Box display="flex" justifyContent="center" gap={2}>
          <Button variant="outlined" onClick={() => navigate(PATHS.raffle.detail(id))}>
            View Details
          </Button>
          <Button variant="contained" onClick={() => navigate(PATHS.raffle.root)}>
            Back to Raffles
          </Button>
        </Box>
      </Box>
    )
  }

  const defaultValues: RaffleFormValues = {
    name: raffle.name,
    description: raffle.description,
    startDate: toDateInput(raffle.startDate),
    endDate: toDateInput(raffle.endDate),
    drawDate: toDateInput(raffle.drawDate),
    status: raffle.status,
    ticketPrice: raffle.ticketPrice,
    maxTicketsPerUser: raffle.maxTicketsPerUser,
    prizes: raffle.prizes.map(toFormPrize),
    totalTicketLimit: raffle.totalTicketLimit,
  }

  return (
    <Box maxWidth={960} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <EditOutlinedIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Edit Raffle</Typography>
          <Typography variant="body2" color="text.secondary">
            Update configuration — ID and Created At are read-only
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <RaffleForm
        key={raffle.id}
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        isSubmitting={updateMutation.isPending}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnlyMeta={{ id: raffle.id, createdAt: raffle.createdAt }}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Raffle updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
