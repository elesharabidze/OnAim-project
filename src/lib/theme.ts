import { createTheme, type PaletteMode } from '@mui/material/styles'
import COLORS from '@/styles/colors'

export function buildTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLORS.PRIMARY,
        light: COLORS.PRIMARY_LIGHT,
        contrastText: COLORS.DARK_BACKGROUND,
      },
      secondary: {
        main: COLORS.PRIMARY_BLUE,
        contrastText: '#ffffff',
      },
      text: {
        primary: isDark ? '#e2e8f0' : COLORS.PRIMARY_TEXT,
        secondary: isDark ? '#94a3b8' : COLORS.SECONDARY_TEXT,
      },
      background: {
        default: isDark ? COLORS.DARK_BACKGROUND : COLORS.SECONDARY_BACKGROUND,
        paper: isDark ? COLORS.DARK_PAPER : '#ffffff',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : COLORS.PRIMARY_BORDER,
      error: { main: '#ff4d4f' },
      success: { main: '#52c41a' },
      warning: { main: '#faad14' },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            backgroundColor: COLORS.PRIMARY,
            color: COLORS.DARK_BACKGROUND,
            '&:hover': { backgroundColor: COLORS.PRIMARY_LIGHT },
            '&:disabled': { backgroundColor: COLORS.PRIMARY_SUPER_LIGHT },
          },
          containedSecondary: {
            backgroundColor: COLORS.PRIMARY_BLUE,
            color: '#ffffff',
          },
          outlinedPrimary: {
            borderColor: COLORS.PRIMARY,
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255,199,44,0.1)'
                : COLORS.PRIMARY_SUPER_LIGHT,
              borderColor: COLORS.PRIMARY_LIGHT,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700,
              backgroundColor: isDark ? COLORS.DARK_SURFACE : COLORS.SECONDARY_BACKGROUND,
              borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : COLORS.PRIMARY_BORDER}`,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255,199,44,0.06) !important'
                : `${COLORS.PRIMARY_SUPER_LIGHT} !important`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : COLORS.PRIMARY_BORDER,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0px 1px 3px rgba(0,0,0,0.4)'
              : '0px 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : COLORS.PRIMARY_BORDER}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiSelect: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : COLORS.PRIMARY_BORDER,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : COLORS.PRIMARY_BORDER,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? COLORS.DARK_PAPER : '#ffffff',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : COLORS.PRIMARY_BORDER}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? COLORS.DARK_SURFACE : COLORS.DARK_BACKGROUND,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}

const theme = buildTheme('light')
export default theme
