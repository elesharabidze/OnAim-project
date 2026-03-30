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
import WheelForm from '../components/WheelForm'
import { useUpdateWheel, useWheel } from '../hooks'
import type { WheelFormValues } from '../schemas'
import type { WheelSegment } from '../types'

function toFormSegment(s: WheelSegment) {
  return {
    id: s.id,
    label: s.label,
    color: s.color,
    weight: s.weight,
    prizeType: s.prizeType,
    prizeAmount: s.prizeAmount,
    imageUrl: s.imageUrl,
  }
}

export default function WheelEditPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: wheel, isLoading, isError } = useWheel(id)
  const updateMutation = useUpdateWheel(id)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useUnsavedChangesWarning(isDirty)

  const handleCancel = () => {
    navigate(PATHS.wheel.detail(id))
  }

  const handleSubmit = async (data: WheelFormValues) => {
    setError(null)
    try {
      await updateMutation.mutateAsync(data)
      setIsDirty(false)
      setSuccessOpen(true)
      setTimeout(() => navigate(PATHS.wheel.detail(id)), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wheel.')
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
        <Button sx={{ mt: 2 }} onClick={() => navigate(PATHS.wheel.root)}>
          Back to List
        </Button>
      </Box>
    )
  }

  const defaultValues: WheelFormValues = {
    name: wheel.name,
    description: wheel.description,
    status: wheel.status,
    segments: wheel.segments.map(toFormSegment),
    maxSpinsPerUser: wheel.maxSpinsPerUser,
    spinCost: wheel.spinCost,
    backgroundColor: wheel.backgroundColor,
    borderColor: wheel.borderColor,
  }

  return (
    <Box maxWidth={1100} mx="auto">
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <EditOutlinedIcon sx={{ color: COLORS.PRIMARY, fontSize: 26 }} />
        <Box>
          <Typography variant="h5">Edit Wheel</Typography>
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

      <WheelForm
        key={wheel.id}
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        isSubmitting={updateMutation.isPending}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnlyMeta={{ id: wheel.id, createdAt: wheel.createdAt }}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Wheel updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
