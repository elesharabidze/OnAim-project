import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

export function FeatureBoundary() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
