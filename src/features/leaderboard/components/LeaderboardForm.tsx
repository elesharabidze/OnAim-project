import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { leaderboardFormSchema, type LeaderboardFormValues } from '../schemas'

interface ReadOnlyMeta {
  id: string
  createdAt: string
}

interface LeaderboardFormProps {
  defaultValues?: Partial<LeaderboardFormValues>
  onSubmit: (data: LeaderboardFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
  onCancel: () => void
  readOnlyMeta?: ReadOnlyMeta
  onDirtyChange?: (isDirty: boolean) => void
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
] as const

const SCORING_OPTIONS = [
  { value: 'points', label: 'Points' },
  { value: 'wins', label: 'Wins' },
  { value: 'wagered', label: 'Wagered' },
] as const

const PRIZE_TYPE_OPTIONS = [
  { value: 'coins', label: 'Coins' },
  { value: 'freeSpin', label: 'Free Spins' },
  { value: 'bonus', label: 'Bonus' },
] as const

const RANK_COLORS: Record<number, string> = {
  0: '#FFD700',
  1: '#C0C0C0',
  2: '#CD7F32',
}

const DEFAULT_VALUES: LeaderboardFormValues = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  scoringType: 'points',
  maxParticipants: 10,
  prizes: [],
}

export default function LeaderboardForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
  readOnlyMeta,
  onDirtyChange,
}: LeaderboardFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'prizes' })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Read-only metadata (Edit mode only) */}
        {readOnlyMeta && (
          <Card variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <InfoOutlinedIcon fontSize="small" sx={{ color: COLORS.SECONDARY_TEXT }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                  Read-only fields
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="ID"
                  value={readOnlyMeta.id}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ '& .MuiInputBase-input': { color: COLORS.SECONDARY_TEXT, fontSize: '0.8rem' } }}
                />
                <TextField
                  label="Created At"
                  value={formatDateTime(readOnlyMeta.createdAt)}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ '& .MuiInputBase-input': { color: COLORS.SECONDARY_TEXT } }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Basic Details */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
              Basic Details
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                {...register('title')}
                label="Title"
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title?.message ?? '3–100 characters'}
                placeholder="e.g. Weekly High Rollers"
              />
              <TextField
                {...register('description')}
                label="Description"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe this leaderboard..."
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
              Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status *</InputLabel>
                    <Select {...field} label="Status *">
                      {STATUS_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                name="scoringType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.scoringType}>
                    <InputLabel>Scoring Type *</InputLabel>
                    <Select {...field} label="Scoring Type *">
                      {SCORING_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.scoringType && (
                      <FormHelperText>{errors.scoringType.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <TextField
                {...register('startDate')}
                label="Start Date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />

              <TextField
                {...register('endDate')}
                label="End Date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.endDate}
                helperText={errors.endDate?.message ?? 'Must be after start date'}
              />

              <Controller
                name="maxParticipants"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || '')}
                    label="Max Participants"
                    type="number"
                    fullWidth
                    required
                    slotProps={{ htmlInput: { min: 2 } }}
                    error={!!errors.maxParticipants}
                    helperText={errors.maxParticipants?.message ?? 'Minimum 2'}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <EmojiEventsIcon fontSize="small" sx={{ color: COLORS.PRIMARY }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Prizes
                </Typography>
                {fields.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    ({fields.length})
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => append({ name: '', type: 'coins', amount: 0, imageUrl: '' })}
                variant="outlined"
              >
                Add Prize
              </Button>
            </Box>

            {errors.prizes && !Array.isArray(errors.prizes) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.prizes.message as string}
              </Alert>
            )}

            {fields.length === 0 ? (
              <Box
                sx={{
                  border: `2px dashed ${COLORS.PRIMARY_BORDER}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 36, color: COLORS.PRIMARY_BORDER, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No prizes added yet. At least 1 prize is required.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => append({ name: '', type: 'coins', amount: 0, imageUrl: '' })}
                  sx={{ mt: 1.5 }}
                >
                  Add First Prize
                </Button>
              </Box>
            ) : (
              <Stack spacing={0}>
                {fields.map((field, index) => (
                  <Box key={field.id}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      {/* Rank badge */}
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          bgcolor: RANK_COLORS[index] ?? COLORS.PRIMARY_BORDER,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.6,
                          border: '2px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ fontSize: '0.7rem', color: index < 3 ? '#000' : '#666' }}
                        >
                          {index + 1}
                        </Typography>
                      </Box>

                      {/* Prize fields */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 2fr' },
                          gap: 1.5,
                        }}
                      >
                        <TextField
                          {...register(`prizes.${index}.name`)}
                          label="Prize Name"
                          fullWidth
                          required
                          error={!!errors.prizes?.[index]?.name}
                          helperText={errors.prizes?.[index]?.name?.message}
                        />

                        <Controller
                          name={`prizes.${index}.type`}
                          control={control}
                          render={({ field: f }) => (
                            <FormControl fullWidth error={!!errors.prizes?.[index]?.type}>
                              <InputLabel>Type</InputLabel>
                              <Select {...f} label="Type">
                                {PRIZE_TYPE_OPTIONS.map((o) => (
                                  <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />

                        <Controller
                          name={`prizes.${index}.amount`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                              label="Amount"
                              type="number"
                              fullWidth
                              slotProps={{ htmlInput: { min: 0, step: 1 } }}
                              error={!!errors.prizes?.[index]?.amount}
                              helperText={errors.prizes?.[index]?.amount?.message}
                            />
                          )}
                        />

                        <TextField
                          {...register(`prizes.${index}.imageUrl`)}
                          label="Image URL"
                          fullWidth
                          placeholder="https://..."
                          error={!!errors.prizes?.[index]?.imageUrl}
                          helperText={errors.prizes?.[index]?.imageUrl?.message}
                        />
                      </Box>

                      <Tooltip title="Remove prize">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => remove(index)}
                          sx={{ mt: 0.6, flexShrink: 0 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="flex-end" pb={1}>
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
