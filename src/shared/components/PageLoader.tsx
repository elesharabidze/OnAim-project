import { Box, CircularProgress } from '@mui/material'

export function PageLoader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={48} thickness={4} color="primary" />
    </Box>
  )
}
