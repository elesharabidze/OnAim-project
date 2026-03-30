import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Typography } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import { PATHS } from '@/routes/paths'
import { useUnsavedChangesWarning } from '@/shared/hooks/useUnsavedChangesWarning'
import COLORS from '@/styles/colors'
import WheelForm from '../components/WheelForm'
import { useCreateWheel } from '../hooks'
import type { WheelFormValues } from '../schemas'

export default function WheelCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateWheel()
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.wheel.root)
  }

  const handleSubmit = async (data: WheelFormValues) => {
    setError(null)
    try {
      const created = await createMutation.mutateAsync(data)
      navigate(PATHS.wheel.detail(String(created.id)), { state: { createdFlash: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wheel.')
    }
  }

  return (
    <Box maxWidth={1100} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <CasinoIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Create Wheel</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure a new spin-to-win wheel with weighted prize segments
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <WheelForm
        submitLabel="Create Wheel"
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onDirtyChange={setIsDirty}
        onCancel={handleCancel}
      />
    </Box>
  )
}
