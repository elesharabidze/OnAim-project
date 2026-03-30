import { useEffect, useRef } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import TuneIcon from '@mui/icons-material/Tune'
import { formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { wheelFormSchema, type WheelFormValues } from '../schemas'
import WheelPreview from './WheelPreview'

const SEGMENT_PALETTE = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#34495E', '#E91E63', '#00BCD4',
  '#8BC34A', '#FF5722',
]

interface ReadOnlyMeta {
  id: string
  createdAt: string
}

interface WheelFormProps {
  defaultValues?: Partial<WheelFormValues>
  onSubmit: (data: WheelFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
  onCancel: () => void
  readOnlyMeta?: ReadOnlyMeta
  onDirtyChange?: (isDirty: boolean) => void
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

const PRIZE_TYPE_OPTIONS = [
  { value: 'coins', label: 'Coins' },
  { value: 'freeSpin', label: 'Free Spin' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'nothing', label: 'Nothing' },
] as const

const DEFAULT_VALUES: WheelFormValues = {
  name: '',
  description: '',
  status: 'draft',
  segments: [
    { label: 'Prize 1', color: '#E74C3C', weight: 50, prizeType: 'coins', prizeAmount: 100, imageUrl: '' },
    { label: 'Prize 2', color: '#3498DB', weight: 50, prizeType: 'coins', prizeAmount: 100, imageUrl: '' },
  ],
  maxSpinsPerUser: 1,
  spinCost: 0,
  backgroundColor: '#FFFFFF',
  borderColor: '#2C3E50',
}

function ColorField({
  value,
  onChange,
  label,
  error,
  helperText,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  error?: boolean
  helperText?: string
}) {
  return (
    <Box>
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'} display="block" mb={0.5}>
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          component="input"
          type="color"
          value={value.match(/^#[0-9A-Fa-f]{6}$/) ? value : '#000000'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: 38,
            height: 38,
            border: '1.5px solid',
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: 1,
            cursor: 'pointer',
            padding: '2px',
            bgcolor: 'transparent',
          }}
        />
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          helperText={helperText}
          placeholder="#RRGGBB"
          inputProps={{ maxLength: 7 }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  )
}

function SortableSegmentWrapper({
  id,
  children,
}: {
  id: string
  children: (dragHandle: React.ReactNode) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const dragHandle = (
    <Tooltip title="Drag to reorder">
      <Box
        component="span"
        {...attributes}
        {...listeners}
        sx={{
          cursor: isDragging ? 'grabbing' : 'grab',
          color: 'text.disabled',
          display: 'flex',
          alignItems: 'center',
          '&:hover': { color: 'text.secondary' },
          touchAction: 'none',
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
    </Tooltip>
  )
  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.85 : 1,
        position: 'relative',
      }}
    >
      {children(dragHandle)}
    </Box>
  )
}

export default function WheelForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
  readOnlyMeta,
  onDirtyChange,
}: WheelFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WheelFormValues>({
    resolver: zodResolver(wheelFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'segments' })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        replace(arrayMove(fields, oldIndex, newIndex))
      }
    }
  }

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const segments = useWatch({ control, name: 'segments' }) ?? DEFAULT_VALUES.segments
  const backgroundColor = useWatch({ control, name: 'backgroundColor' }) ?? DEFAULT_VALUES.backgroundColor
  const borderColor = useWatch({ control, name: 'borderColor' }) ?? DEFAULT_VALUES.borderColor

  const weightSum = segments.reduce((sum, s) => sum + (Number(s.weight) || 0), 0)
  const weightOk = weightSum === 100

  const nextColorRef = useRef(fields.length % SEGMENT_PALETTE.length)

  const addSegment = () => {
    if (fields.length >= 12) return
    const color = SEGMENT_PALETTE[nextColorRef.current % SEGMENT_PALETTE.length]
    nextColorRef.current++
    append({
      label: `Prize ${fields.length + 1}`,
      color,
      weight: 0,
      prizeType: 'coins',
      prizeAmount: 100,
      imageUrl: '',
    })
  }

  const segmentsError =
    (errors.segments as { message?: string } | undefined)?.message ??
    (errors.segments as { root?: { message?: string } } | undefined)?.root?.message

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', lg: '1fr 320px' }}
        gap={3}
        alignItems="start"
      >
        {/* ── Left Column: Form Fields ── */}
        <Stack spacing={3}>
          {/* Read-only meta */}
          {readOnlyMeta && (
            <Card variant="outlined" sx={{ bgcolor: COLORS.SECONDARY_BACKGROUND }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ID</Typography>
                    <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                      {readOnlyMeta.id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                    <Typography variant="body2">{formatDateTime(readOnlyMeta.createdAt)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Basic Configuration */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                <TuneIcon sx={{ color: COLORS.PRIMARY, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Basic Configuration
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                <TextField
                  label="Wheel Name"
                  required
                  fullWidth
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message ?? 'Between 3 and 80 characters'}
                  inputProps={{ maxLength: 80 }}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {STATUS_OPTIONS.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <Controller
                    name="spinCost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Spin Cost"
                        type="number"
                        fullWidth
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        error={!!errors.spinCost}
                        helperText={errors.spinCost?.message ?? 'Coins required per spin (0 = free)'}
                        inputProps={{ min: 0, step: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography fontSize="0.85rem" color="text.secondary">🪙</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="maxSpinsPerUser"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Max Spins per User"
                        type="number"
                        fullWidth
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        error={!!errors.maxSpinsPerUser}
                        helperText={errors.maxSpinsPerUser?.message ?? 'Lifetime spin limit per user'}
                        inputProps={{ min: 1, step: 1 }}
                      />
                    )}
                  />
                </Box>

                <Divider />

                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Wheel Colors
                </Typography>

                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <Controller
                    name="backgroundColor"
                    control={control}
                    render={({ field }) => (
                      <ColorField
                        label="Background Color"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.backgroundColor}
                        helperText={errors.backgroundColor?.message}
                      />
                    )}
                  />

                  <Controller
                    name="borderColor"
                    control={control}
                    render={({ field }) => (
                      <ColorField
                        label="Border / Hub Color"
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.borderColor}
                        helperText={errors.borderColor?.message}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Segments */}
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Segments
                  </Typography>
                  <Chip
                    label={`${fields.length} / 12`}
                    size="small"
                    sx={{ bgcolor: '#f0f0f0', fontSize: '0.72rem' }}
                  />
                </Box>

                <Tooltip title={fields.length >= 12 ? 'Maximum 12 segments allowed' : 'Add segment'}>
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={addSegment}
                      disabled={fields.length >= 12}
                    >
                      Add Segment
                    </Button>
                  </span>
                </Tooltip>
              </Box>

              {/* Weight sum bar */}
              <Box mb={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Total weight
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={weightOk ? 'success.main' : weightSum > 100 ? 'error.main' : 'warning.main'}
                  >
                    {weightSum} / 100{weightOk ? ' ✓' : ''}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(weightSum, 100)}
                  color={weightOk ? 'success' : weightSum > 100 ? 'error' : 'warning'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              {segmentsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {segmentsError}
                </Alert>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  <Stack spacing={2}>
                {fields.map((field, index) => {
                  const segErr = errors.segments?.[index]
                  const prizeType = segments[index]?.prizeType
                  const isNothing = prizeType === 'nothing'
                  const segColor = segments[index]?.color || '#ccc'

                  return (
                    <SortableSegmentWrapper key={field.id} id={field.id}>
                      {(dragHandle) => (
                    <Card
                      variant="outlined"
                      sx={{ borderLeft: `4px solid ${segColor}`, transition: 'border-color 0.2s' }}
                    >
                      <CardContent sx={{ pb: '12px !important' }}>
                        {/* Segment header */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {dragHandle}
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: COLORS.PRIMARY,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px solid rgba(0,0,0,0.1)',
                                flexShrink: 0,
                              }}
                            >
                              <Typography variant="caption" fontWeight={800} fontSize="0.6rem" color={COLORS.DARK_BACKGROUND}>
                                {index + 1}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              Segment {index + 1}
                            </Typography>
                          </Box>

                          <Tooltip title={fields.length <= 2 ? 'Minimum 2 segments required' : 'Remove segment'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 2}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>

                        <Box
                          display="grid"
                          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                          gap={2}
                        >
                          {/* Label */}
                          <TextField
                            label="Label"
                            size="small"
                            required
                            fullWidth
                            {...register(`segments.${index}.label`)}
                            error={!!segErr?.label}
                            helperText={segErr?.label?.message}
                          />

                          {/* Color */}
                          <Controller
                            name={`segments.${index}.color`}
                            control={control}
                            render={({ field: f }) => (
                              <Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    component="input"
                                    type="color"
                                    value={f.value.match(/^#[0-9A-Fa-f]{6}$/) ? f.value : '#000000'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => f.onChange(e.target.value)}
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      border: '1.5px solid',
                                      borderColor: segErr?.color ? 'error.main' : 'divider',
                                      borderRadius: 1,
                                      cursor: 'pointer',
                                      padding: '2px',
                                      bgcolor: 'transparent',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <TextField
                                    label="Color"
                                    size="small"
                                    fullWidth
                                    value={f.value}
                                    onChange={(e) => f.onChange(e.target.value)}
                                    error={!!segErr?.color}
                                    helperText={segErr?.color?.message}
                                    inputProps={{ maxLength: 7 }}
                                    placeholder="#RRGGBB"
                                  />
                                </Box>
                              </Box>
                            )}
                          />

                          {/* Weight */}
                          <Controller
                            name={`segments.${index}.weight`}
                            control={control}
                            render={({ field: f }) => (
                              <TextField
                                label="Weight (1–100)"
                                size="small"
                                type="number"
                                fullWidth
                                {...f}
                                value={f.value}
                                onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 0)}
                                error={!!segErr?.weight}
                                helperText={segErr?.weight?.message ?? 'Probability weight'}
                                inputProps={{ min: 1, max: 100, step: 1 }}
                              />
                            )}
                          />

                          {/* Prize Type */}
                          <Controller
                            name={`segments.${index}.prizeType`}
                            control={control}
                            render={({ field: f }) => (
                              <FormControl size="small" fullWidth error={!!segErr?.prizeType}>
                                <InputLabel>Prize Type</InputLabel>
                                <Select
                                  {...f}
                                  label="Prize Type"
                                  onChange={(e) => {
                                    f.onChange(e.target.value)
                                    if (e.target.value === 'nothing') {
                                      setValue(`segments.${index}.prizeAmount`, 0)
                                    }
                                  }}
                                >
                                  {PRIZE_TYPE_OPTIONS.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                      {o.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {segErr?.prizeType && (
                                  <FormHelperText>{segErr.prizeType.message}</FormHelperText>
                                )}
                              </FormControl>
                            )}
                          />

                          {/* Prize Amount */}
                          <Controller
                            name={`segments.${index}.prizeAmount`}
                            control={control}
                            render={({ field: f }) => (
                              <TextField
                                label="Prize Amount"
                                size="small"
                                type="number"
                                fullWidth
                                {...f}
                                value={f.value}
                                onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                                disabled={isNothing}
                                error={!!segErr?.prizeAmount}
                                helperText={
                                  segErr?.prizeAmount?.message ??
                                  (isNothing ? 'No prize — amount locked to 0' : 'Must be > 0')
                                }
                                inputProps={{ min: 0, step: 1 }}
                              />
                            )}
                          />

                          {/* Image URL */}
                          <TextField
                            label="Image URL (optional)"
                            size="small"
                            fullWidth
                            {...register(`segments.${index}.imageUrl`)}
                            error={!!segErr?.imageUrl}
                            helperText={segErr?.imageUrl?.message}
                            placeholder="https://..."
                            sx={{ gridColumn: { sm: 'span 2' } }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                      )}
                    </SortableSegmentWrapper>
                  )
                })}
                  </Stack>
                </SortableContext>
              </DndContext>

              {fields.length < 12 && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addSegment}
                  sx={{
                    mt: 1,
                    border: '1.5px dashed',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': { borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY, border: '1.5px dashed' },
                    py: 1.5,
                  }}
                >
                  Add Another Segment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ minWidth: 140 }}
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </Box>
        </Stack>

        {/* ── Right Column: Live Wheel Preview ── */}
        <Box
          sx={{
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                Live Preview
              </Typography>

              <Box display="flex" justifyContent="center" mb={2}>
                <WheelPreview
                  segments={segments.map((s) => ({
                    label: s.label,
                    color: s.color,
                    weight: Number(s.weight) || 0,
                  }))}
                  backgroundColor={backgroundColor}
                  borderColor={borderColor}
                  size={280}
                />
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {/* Stats */}
              <Stack spacing={0.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Segments</Typography>
                  <Typography variant="caption" fontWeight={700}>{fields.length}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Total weight</Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={weightOk ? 'success.main' : 'error.main'}
                  >
                    {weightSum} / 100
                  </Typography>
                </Box>
                {!weightOk && (
                  <Alert severity={weightSum > 100 ? 'error' : 'warning'} sx={{ mt: 1, py: 0 }}>
                    <Typography variant="caption">
                      {weightSum > 100
                        ? `Over by ${weightSum - 100}. Reduce some weights.`
                        : `Under by ${100 - weightSum}. Increase some weights.`}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
