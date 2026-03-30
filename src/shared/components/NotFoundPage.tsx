import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@/routes/paths'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h1" fontWeight={700} color="text.disabled">
        404
      </Typography>
      <Typography variant="h5">Page not found</Typography>
      <Typography variant="body1" color="text.secondary">
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(PATHS.leaderboard.root)}
      >
        Back to Dashboard
      </Button>
    </Box>
  )
}
