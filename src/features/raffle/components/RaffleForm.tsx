import { useEffect } from 'react'
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
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { formatDateTime } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { raffleFormSchema, type RaffleFormValues } from '../schemas'

interface ReadOnlyMeta {
  id: string
  createdAt: string
}

interface RaffleFormProps {
  defaultValues?: Partial<RaffleFormValues>
  onSubmit: (data: RaffleFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
  onCancel: () => void
  readOnlyMeta?: ReadOnlyMeta
  onDirtyChange?: (isDirty: boolean) => void
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'drawn', label: 'Drawn' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const PRIZE_TYPE_OPTIONS = [
  { value: 'coins', label: 'Coins' },
  { value: 'freeSpin', label: 'Free Spins' },
  { value: 'bonus', label: 'Bonus' },
] as const

const DEFAULT_VALUES: RaffleFormValues = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  drawDate: '',
  status: 'draft',
  ticketPrice: 1,
  maxTicketsPerUser: 10,
  prizes: [],
  totalTicketLimit: null,
}

function SortablePrizeRow({
  id,
  children,
}: {
  id: string
  index: number
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
          alignSelf: 'flex-start',
          mt: 1.2,
          '&:hover': { color: 'text.secondary' },
          touchAction: 'none',
          flexShrink: 0,
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

export default function RaffleForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  onCancel,
  readOnlyMeta,
  onDirtyChange,
}: RaffleFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'prizes' })

  const totalTicketLimit = useWatch({ control, name: 'totalTicketLimit' })
  const isUnlimited = totalTicketLimit === null

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

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Read-only metadata (Edit mode only) */}
        {readOnlyMeta && (
          <Card variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <InfoOutlinedIcon fontSize="small" sx={{ color: COLORS.SECONDARY_TEXT }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
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
                {...register('name')}
                label="Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message ?? '3–80 characters'}
                placeholder="e.g. Spring Grand Raffle"
              />
              <TextField
                {...register('description')}
                label="Description"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe this raffle..."
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Schedule & Status */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
              Schedule &amp; Status
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
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

              <TextField
                {...register('drawDate')}
                label="Draw Date"
                type="date"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.drawDate}
                helperText={errors.drawDate?.message ?? 'Must be after end date'}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Ticket Configuration */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
              Ticket Configuration
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <Controller
                name="ticketPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    label="Ticket Price"
                    type="number"
                    fullWidth
                    required
                    slotProps={{
                      htmlInput: { min: 0.01, step: 0.01 },
                      input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                    }}
                    error={!!errors.ticketPrice}
                    helperText={errors.ticketPrice?.message ?? 'Must be a positive number'}
                  />
                )}
              />

              <Controller
                name="maxTicketsPerUser"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    label="Max Tickets per User"
                    type="number"
                    fullWidth
                    required
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    error={!!errors.maxTicketsPerUser}
                    helperText={errors.maxTicketsPerUser?.message ?? 'Minimum 1'}
                  />
                )}
              />

              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isUnlimited}
                      onChange={(e) => {
                        setValue(
                          'totalTicketLimit',
                          e.target.checked ? null : 500,
                          { shouldDirty: true }
                        )
                      }}
                    />
                  }
                  label="Unlimited total tickets"
                />
              </Box>

              {!isUnlimited && (
                <Controller
                  name="totalTicketLimit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || null)}
                      label="Total Ticket Limit"
                      type="number"
                      fullWidth
                      slotProps={{ htmlInput: { min: 1, step: 1 } }}
                      error={!!errors.totalTicketLimit}
                      helperText={errors.totalTicketLimit?.message ?? 'Maximum tickets available'}
                    />
                  )}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CardGiftcardIcon fontSize="small" sx={{ color: COLORS.PRIMARY }} />
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
                onClick={() =>
                  append({ name: '', type: 'coins', amount: 0, quantity: 1, imageUrl: '' })
                }
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
                <CardGiftcardIcon sx={{ fontSize: 36, color: COLORS.PRIMARY_BORDER, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No prizes added yet. At least 1 prize is required.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() =>
                    append({ name: '', type: 'coins', amount: 0, quantity: 1, imageUrl: '' })
                  }
                  sx={{ mt: 1.5 }}
                >
                  Add First Prize
                </Button>
              </Box>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={0}>
                {fields.map((field, index) => (
                  <SortablePrizeRow key={field.id} id={field.id} index={index}>
                    {(dragHandle) => (
                    <Box>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      {/* Drag handle */}
                      {dragHandle}

                      {/* Prize number badge */}
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: COLORS.PRIMARY,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.7,
                          border: '2px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ fontSize: '0.7rem', color: COLORS.DARK_BACKGROUND }}
                        >
                          {index + 1}
                        </Typography>
                      </Box>

                      {/* Prize fields */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr 2fr' },
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

                        <Controller
                          name={`prizes.${index}.quantity`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              {...f}
                              onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 0)}
                              label="Qty"
                              type="number"
                              fullWidth
                              slotProps={{ htmlInput: { min: 1, step: 1 } }}
                              error={!!errors.prizes?.[index]?.quantity}
                              helperText={errors.prizes?.[index]?.quantity?.message}
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
                          sx={{ mt: 0.7, flexShrink: 0 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    </Box>
                    )}
                  </SortablePrizeRow>
                ))}
                  </Stack>
                </SortableContext>
              </DndContext>
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
