import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { PATHS } from '@/routes/paths'
import type { ListFlashLocationState } from '@/routes/locationState'
import { useConsumeRouterFlash } from '@/shared/hooks/useConsumeRouterFlash'
import { exportToCsv, formatDate } from '@/shared/utils'
import COLORS from '@/styles/colors'
import { useDeleteRaffle, useRaffles } from '../hooks'
import type { Raffle, RaffleStatus } from '../types'

type SortField = 'name' | 'status' | 'startDate' | 'endDate' | 'drawDate' | 'ticketPrice' | 'createdAt'

const STATUS_CHIP: Record<
  RaffleStatus,
  { label: string; bgcolor: string; color: string }
> = {
  draft: { label: 'Draft', bgcolor: '#f0f0f0', color: '#666' },
  active: { label: 'Active', bgcolor: '#e6f7ec', color: '#389e0d' },
  drawn: { label: 'Drawn', bgcolor: '#f0e6ff', color: '#722ed1' },
  cancelled: { label: 'Cancelled', bgcolor: '#fff1f0', color: '#cf1322' },
}

function SortCell({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
}: {
  field: SortField
  label: string
  sortField: SortField
  sortOrder: 'asc' | 'desc'
  onSort: (f: SortField) => void
}) {
  return (
    <TableCell>
      <TableSortLabel
        active={sortField === field}
        direction={sortField === field ? sortOrder : 'asc'}
        onClick={() => onSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )
}

export default function RaffleListPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<RaffleStatus | ''>('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  useConsumeRouterFlash(
    (state) => (state as ListFlashLocationState | null)?.flashMessage,
    (message) => setSnackbar({ open: true, message, severity: 'success' })
  )

  const { data, isLoading, isError } = useRaffles({
    page: page + 1,
    limit: rowsPerPage,
    status: statusFilter || undefined,
    startDateFrom: startDateFrom || undefined,
    startDateTo: startDateTo || undefined,
    sortBy: sortField,
    sortOrder,
  })

  const deleteMutation = useDeleteRaffle()

  const rows = data?.data ?? []
  const total = data?.total ?? 0

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setPage(0)
  }

  const resetFilters = () => {
    setStatusFilter('')
    setStartDateFrom('')
    setStartDateTo('')
    setPage(0)
    setSelected(new Set())
  }

  const hasFilters = statusFilter !== '' || startDateFrom !== '' || startDateTo !== ''

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set())
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(deleteId)
        return next
      })
      setSnackbar({ open: true, message: 'Raffle deleted.', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete raffle.', severity: 'error' })
    }
  }

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = selected.size > 0 && !allOnPageSelected

  const handleExportCsv = () => {
    exportToCsv(
      'raffles',
      ['ID', 'Name', 'Status', 'Start Date', 'End Date', 'Draw Date', 'Ticket Price', 'Max Tickets/User', 'Prizes', 'Ticket Limit'],
      rows.map((r) => [
        r.id,
        r.name,
        r.status,
        formatDate(r.startDate),
        formatDate(r.endDate),
        formatDate(r.drawDate),
        r.ticketPrice,
        r.maxTicketsPerUser,
        r.prizes.length,
        r.totalTicketLimit ?? 'Unlimited',
      ])
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <CardGiftcardIcon sx={{ color: COLORS.PRIMARY, fontSize: 28 }} />
            <Typography variant="h5">Raffles</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Configure and manage ticket-based prize raffles
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
            disabled={rows.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(PATHS.raffle.create)}
          >
            New Raffle
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Box px={2} py={1.5} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterListIcon fontSize="small" sx={{ color: COLORS.SECONDARY_TEXT }} />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by status"
              onChange={(e) => {
                setStatusFilter(e.target.value as RaffleStatus | '')
                setPage(0)
                setSelected(new Set())
              }}
            >
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="drawn">Drawn</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Start date from"
            type="date"
            value={startDateFrom}
            onChange={(e) => {
              setStartDateFrom(e.target.value)
              setPage(0)
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 170 }}
          />

          <TextField
            size="small"
            label="Start date to"
            type="date"
            value={startDateTo}
            onChange={(e) => {
              setStartDateTo(e.target.value)
              setPage(0)
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 170 }}
          />

          {hasFilters && (
            <Button size="small" onClick={resetFilters} sx={{ color: COLORS.SECONDARY_TEXT }}>
              Clear filters
            </Button>
          )}

          {total > 0 && (
            <Typography variant="body2" color="text.secondary" ml="auto">
              {total} raffle{total !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Selection action bar */}
      {selected.size > 0 && (
        <Card sx={{ mb: 2, bgcolor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY }}>
          <Box px={2} py={1.5} display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.DARK_BACKGROUND }}>
              {selected.size} selected
            </Typography>
            <Button
              size="small"
              sx={{ ml: 'auto', color: COLORS.DARK_BACKGROUND }}
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </Button>
          </Box>
        </Card>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box p={4}>
            <Alert severity="error">
              Failed to load raffles. Make sure the API server is running.
            </Alert>
          </Box>
        ) : rows.length === 0 ? (
          <Box p={6} textAlign="center">
            <CardGiftcardIcon sx={{ fontSize: 48, color: COLORS.PRIMARY_BORDER, mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary" mb={0.5}>
              No raffles found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
              {hasFilters
                ? 'No raffles match the current filters.'
                : 'Get started by creating your first raffle.'}
            </Typography>
            {!hasFilters && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(PATHS.raffle.create)}
              >
                Create Raffle
              </Button>
            )}
            {hasFilters && (
              <Button variant="outlined" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={someSelected}
                        checked={allOnPageSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        size="small"
                      />
                    </TableCell>
                    <SortCell
                      field="name"
                      label="Name"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortCell
                      field="status"
                      label="Status"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortCell
                      field="startDate"
                      label="Start Date"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortCell
                      field="endDate"
                      label="End Date"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortCell
                      field="drawDate"
                      label="Draw Date"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortCell
                      field="ticketPrice"
                      label="Ticket Price"
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <TableCell>Prizes</TableCell>
                    <TableCell>Ticket Limit</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: Raffle) => {
                    const statusStyle = STATUS_CHIP[row.status]
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        selected={selected.has(row.id)}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(PATHS.raffle.detail(row.id))}
                      >
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            size="small"
                            checked={selected.has(row.id)}
                            onChange={(e) => handleSelectOne(row.id, e.target.checked)}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {row.name}
                          </Typography>
                          {row.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: 'block', maxWidth: 200 }}
                            >
                              {row.description}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={statusStyle.label}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bgcolor,
                              color: statusStyle.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{formatDate(row.startDate)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{formatDate(row.endDate)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{formatDate(row.drawDate)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ${row.ticketPrice.toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {row.prizes.length} prize{row.prizes.length !== 1 ? 's' : ''}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {row.totalTicketLimit === null
                              ? '∞ Unlimited'
                              : row.totalTicketLimit.toLocaleString()}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(PATHS.raffle.detail(row.id))}
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={row.status === 'drawn' ? 'Cannot edit a drawn raffle' : 'Edit'}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={row.status === 'drawn'}
                                  onClick={() => navigate(PATHS.raffle.edit(row.id))}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteId(row.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => {
                setPage(p)
                setSelected(new Set())
              }}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
                setSelected(new Set())
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Raffle?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This action cannot be undone. The raffle and all its prize data will be permanently
            removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
