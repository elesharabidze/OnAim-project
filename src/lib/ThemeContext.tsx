import { useMemo, useState } from 'react'
import { ThemeProvider, CssBaseline, type PaletteMode } from '@mui/material'
import { buildTheme } from './theme'
import { ColorModeContext } from './colorModeContext'

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('colorMode')
    return (saved === 'dark' || saved === 'light') ? saved : 'light'
  })

  const value = useMemo(
    () => ({
      mode,
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light'
          localStorage.setItem('colorMode', next)
          return next
        }),
    }),
    [mode]
  )

  const theme = useMemo(() => buildTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
