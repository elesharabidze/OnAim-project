import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Typography } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { PATHS } from '@/routes/paths'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import COLORS from '@/styles/colors'
import RaffleForm from '../components/RaffleForm'
import { useCreateRaffle } from '../hooks'
import type { RaffleFormValues } from '../schemas'

export default function RaffleCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateRaffle()
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.raffle.root)
  }

  const handleSubmit = async (data: RaffleFormValues) => {
    setError(null)
    try {
      const created = await createMutation.mutateAsync(data)
      navigate(PATHS.raffle.detail(String(created.id)), { state: { createdFlash: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create raffle.')
    }
  }

  return (
    <Box maxWidth={960} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <CardGiftcardIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Create Raffle</Typography>
          <Typography variant="body2" color="text.secondary">
            Set up a new ticket-based prize raffle
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <RaffleForm
        submitLabel="Create Raffle"
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onDirtyChange={setIsDirty}
        onCancel={handleCancel}
      />
    </Box>
  )
}
