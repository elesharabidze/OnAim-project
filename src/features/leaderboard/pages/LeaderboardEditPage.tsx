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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { PATHS } from '@/routes/paths'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import COLORS from '@/styles/colors'
import LeaderboardForm from '../components/LeaderboardForm'
import { useLeaderboard, useUpdateLeaderboard } from '../hooks'
import type { LeaderboardFormValues } from '../schemas'
import type { LeaderboardPrize } from '../types'

function toFormPrize(p: LeaderboardPrize) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    amount: p.amount,
    imageUrl: p.imageUrl,
  }
}

function toDateInput(iso: string): string {
  return iso ? (iso.split('T')[0] ?? '') : ''
}

export default function LeaderboardEditPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: leaderboard, isLoading, isError } = useLeaderboard(id)
  const updateMutation = useUpdateLeaderboard(id)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.leaderboard.detail(id))
  }

  const handleSubmit = async (data: LeaderboardFormValues) => {
    setError(null)
    try {
      await updateMutation.mutateAsync(data)
      setIsDirty(false)
      setSuccessOpen(true)
      setTimeout(() => navigate(PATHS.leaderboard.detail(id)), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leaderboard.')
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
        <Button sx={{ mt: 2 }} onClick={() => navigate(PATHS.leaderboard.root)}>
          Back to List
        </Button>
      </Box>
    )
  }

  const defaultValues: LeaderboardFormValues = {
    title: leaderboard.title,
    description: leaderboard.description,
    startDate: toDateInput(leaderboard.startDate),
    endDate: toDateInput(leaderboard.endDate),
    status: leaderboard.status,
    scoringType: leaderboard.scoringType,
    maxParticipants: leaderboard.maxParticipants,
    prizes: leaderboard.prizes.map(toFormPrize),
  }

  return (
    <Box maxWidth={900} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <EditOutlinedIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Edit Leaderboard</Typography>
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

      <LeaderboardForm
        key={leaderboard.id}
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        isSubmitting={updateMutation.isPending}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnlyMeta={{ id: leaderboard.id, createdAt: leaderboard.createdAt }}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Leaderboard updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
