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
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { PATHS } from '@/routes/paths'
import type { ListFlashLocationState } from '@/routes/locationState'
import { useConsumeRouterFlash } from '@/shared/hooks/useConsumeRouterFlash'
import { exportToCsv, formatDate } from '@/shared/utils'
import COLORS from '@/styles/colors'
import {
  useBulkUpdateLeaderboardStatus,
  useDeleteLeaderboard,
  useLeaderboards,
} from '../hooks'
import type { Leaderboard, LeaderboardStatus } from '../types'

type SortField = 'title' | 'status' | 'scoringType' | 'startDate' | 'endDate' | 'maxParticipants' | 'createdAt'

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

const STATUS_CHIP: Record<
  LeaderboardStatus,
  { label: string; color: 'default' | 'success' | 'primary' | 'warning' | 'error' | 'info'; bgcolor: string; color2: string }
> = {
  draft: { label: 'Draft', color: 'default', bgcolor: '#f0f0f0', color2: '#666' },
  active: { label: 'Active', color: 'success', bgcolor: '#e6f7ec', color2: '#389e0d' },
  completed: { label: 'Completed', color: 'info', bgcolor: '#e6f0ff', color2: '#1677ff' },
}

export default function LeaderboardListPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<LeaderboardStatus | ''>('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  useConsumeRouterFlash(
    (state) => (state as ListFlashLocationState | null)?.flashMessage,
    (message) => setSnackbar({ open: true, message, severity: 'success' })
  )

  const { data, isLoading, isError } = useLeaderboards({
    page: page + 1,
    limit: rowsPerPage,
    status: statusFilter || undefined,
    sortBy: sortField,
    sortOrder,
  })

  const deleteMutation = useDeleteLeaderboard()
  const bulkStatusMutation = useBulkUpdateLeaderboardStatus()

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
      setSnackbar({ open: true, message: 'Leaderboard deleted.', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete leaderboard.', severity: 'error' })
    }
  }

  const handleBulkStatus = async (status: 'active' | 'draft') => {
    if (selected.size === 0) return
    try {
      await bulkStatusMutation.mutateAsync({ ids: Array.from(selected), status })
      setSelected(new Set())
      setSnackbar({
        open: true,
        message: `${selected.size} leaderboard(s) set to ${status}.`,
        severity: 'success',
      })
    } catch {
      setSnackbar({ open: true, message: 'Bulk update failed.', severity: 'error' })
    }
  }

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = selected.size > 0 && !allOnPageSelected

  const handleExportCsv = () => {
    exportToCsv(
      'leaderboards',
      ['ID', 'Title', 'Status', 'Scoring Type', 'Start Date', 'End Date', 'Max Participants', 'Prizes'],
      rows.map((r) => [
        r.id,
        r.title,
        r.status,
        r.scoringType,
        formatDate(r.startDate),
        formatDate(r.endDate),
        r.maxParticipants,
        r.prizes.length,
      ])
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <EmojiEventsIcon sx={{ color: COLORS.PRIMARY, fontSize: 28 }} />
            <Typography variant="h5">Leaderboards</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Configure and manage competitive leaderboards
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
            onClick={() => navigate(PATHS.leaderboard.create)}
          >
            New Leaderboard
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <Box px={2} py={1.5} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by status"
              onChange={(e) => {
                setStatusFilter(e.target.value as LeaderboardStatus | '')
                setPage(0)
                setSelected(new Set())
              }}
            >
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          {total > 0 && (
            <Typography variant="body2" color="text.secondary" ml="auto">
              {total} leaderboard{total !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Card>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <Card
          sx={{
            mb: 2,
            bgcolor: COLORS.PRIMARY,
            borderColor: COLORS.PRIMARY,
          }}
        >
          <Box px={2} py={1.5} display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body2" fontWeight={700} sx={{ color: COLORS.DARK_BACKGROUND }}>
              {selected.size} selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: '#389e0d', color: '#fff', '&:hover': { bgcolor: '#237804' } }}
                onClick={() => handleBulkStatus('active')}
                disabled={bulkStatusMutation.isPending}
              >
                Activate
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: COLORS.DARK_BACKGROUND, color: '#fff', '&:hover': { bgcolor: '#3a3436' } }}
                onClick={() => handleBulkStatus('draft')}
                disabled={bulkStatusMutation.isPending}
              >
                Set Draft
              </Button>
            </Stack>
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
            <Alert severity="error">Failed to load leaderboards. Make sure the API server is running.</Alert>
          </Box>
        ) : rows.length === 0 ? (
          <Box p={6} textAlign="center">
            <EmojiEventsIcon sx={{ fontSize: 48, color: COLORS.PRIMARY_BORDER, mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary" mb={0.5}>
              No leaderboards found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
              {statusFilter
                ? `No leaderboards with status "${statusFilter}".`
                : 'Get started by creating your first leaderboard.'}
            </Typography>
            {!statusFilter && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(PATHS.leaderboard.create)}
              >
                Create Leaderboard
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
                    <SortCell field="title" label="Title" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <SortCell field="status" label="Status" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <SortCell field="scoringType" label="Scoring" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <SortCell field="startDate" label="Start Date" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <SortCell field="endDate" label="End Date" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <SortCell field="maxParticipants" label="Max Players" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                    <TableCell>Prizes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: Leaderboard) => {
                    const statusStyle = STATUS_CHIP[row.status]
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        selected={selected.has(row.id)}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(PATHS.leaderboard.detail(row.id))}
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
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                            {row.title}
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
                              color: statusStyle.color2,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {row.scoringType}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{formatDate(row.startDate)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{formatDate(row.endDate)}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{row.maxParticipants.toLocaleString()}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{row.prizes.length} prize{row.prizes.length !== 1 ? 's' : ''}</Typography>
                        </TableCell>

                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box display="flex" justifyContent="flex-end" gap={0.5}>
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(PATHS.leaderboard.detail(row.id))}
                              >
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(PATHS.leaderboard.edit(row.id))}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
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
                          </Box>
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
        <DialogTitle>Delete Leaderboard?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This action cannot be undone. The leaderboard and all its prize data will be permanently removed.
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
