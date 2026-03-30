import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Box, Button, Typography } from '@mui/material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            gap: 2,
            p: 4,
          }}
        >
          <Typography variant="h6" color="error">
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Typography>
          <Button variant="outlined" onClick={this.handleReset}>
            Try again
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
