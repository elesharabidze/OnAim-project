import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * One-shot handling of `location.state` (e.g. create success or delete redirect).
 * Clears state with replace navigation so refresh/back behave correctly.
 */
export function useConsumeRouterFlash<T>(
  pick: (state: unknown) => T | undefined,
  onFlash: (value: T) => void
): void {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const value = pick(location.state)
    if (value === undefined) return
    onFlash(value)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, pick, onFlash])
}
