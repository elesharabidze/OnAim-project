import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Typography } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { PATHS } from '@/routes/paths'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import COLORS from '@/styles/colors'
import LeaderboardForm from '../components/LeaderboardForm'
import { useCreateLeaderboard } from '../hooks'
import type { LeaderboardFormValues } from '../schemas'

export default function LeaderboardCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateLeaderboard()
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.leaderboard.root)
  }

  const handleSubmit = async (data: LeaderboardFormValues) => {
    setError(null)
    try {
      const created = await createMutation.mutateAsync(data)
      navigate(PATHS.leaderboard.detail(String(created.id)), {
        state: { createdFlash: true },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leaderboard.')
    }
  }

  return (
    <Box maxWidth={900} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <EmojiEventsIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Create Leaderboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Set up a new competitive leaderboard with prizes
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <LeaderboardForm
        submitLabel="Create Leaderboard"
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onDirtyChange={setIsDirty}
        onCancel={handleCancel}
      />
    </Box>
  )
}
