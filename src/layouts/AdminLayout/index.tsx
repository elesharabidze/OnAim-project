import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Breadcrumbs,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import MenuIcon from '@mui/icons-material/Menu'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { PATHS } from '@/routes/paths'
import COLORS from '@/styles/colors'
import { useColorMode } from '@/lib/useColorMode'

const DRAWER_WIDTH = 256

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Leaderboards',
    path: PATHS.leaderboard.root,
    icon: <EmojiEventsIcon fontSize="small" />,
  },
  {
    label: 'Raffles',
    path: PATHS.raffle.root,
    icon: <ConfirmationNumberIcon fontSize="small" />,
  },
  {
    label: 'Wheels',
    path: PATHS.wheel.root,
    icon: <AutorenewIcon fontSize="small" />,
  },
]

function useBreadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: COLORS.DARK_BACKGROUND,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            bgcolor: COLORS.PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SportsEsportsIcon sx={{ fontSize: 20, color: COLORS.DARK_BACKGROUND }} />
        </Box>
        <Box>
          <Typography
            variant="body1"
            fontWeight={700}
            sx={{ color: '#ffffff', lineHeight: 1.2 }}
          >
            Gaming Admin
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.SECONDARY_TEXT }}>
            Management Panel
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Nav label */}
      <Typography
        variant="caption"
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1,
          color: COLORS.SECONDARY_TEXT,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.65rem',
        }}
      >
        Features
      </Typography>

      {/* Nav items */}
      <List sx={{ px: 1.5, pb: 0 }}>
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.path} title="" placement="right">
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onClose}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                px: 1.5,
                py: 1,
                color: '#ffffff',
                transition: 'all 0.15s ease',
                '& .MuiListItemIcon-root': {
                  color: '#ffffff',
                  minWidth: 36,
                  transition: 'color 0.15s ease',
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                  color: '#ffffff',
                  '& .MuiListItemIcon-root': { color: '#ffffff' },
                },
                '&.active': {
                  bgcolor: 'rgba(255,199,44,0.12)',
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': { color: COLORS.PRIMARY },
                  '&:hover': { bgcolor: 'rgba(255,199,44,0.18)' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: { fontSize: '0.875rem', fontWeight: 'inherit', color: '#ffffff' },
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: COLORS.SECONDARY_TEXT }}>
          v1.0.0
        </Typography>
      </Box>
    </Box>
  )
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const breadcrumbs = useBreadcrumbs()
  const { mode, toggle } = useColorMode()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: `1px solid`,
          borderColor: 'divider',
          zIndex: (t) => t.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
          {/* Mobile menu toggle */}
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Breadcrumbs
            sx={{ flex: 1 }}
            separator={
              <NavigateNextIcon fontSize="small" sx={{ color: 'divider' }} />
            }
            aria-label="breadcrumb"
          >
            {breadcrumbs.length === 0 ? (
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: 'text.secondary' }}
              >
                Home
              </Typography>
            ) : (
              breadcrumbs.map((crumb) =>
                crumb.isLast ? (
                  <Typography
                    key={crumb.path}
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: 'text.secondary' }}
                  >
                    {crumb.label}
                  </Typography>
                ) : (
                  <Typography
                    key={crumb.path}
                    component={NavLink}
                    to={crumb.path}
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    {crumb.label}
                  </Typography>
                )
              )
            )}
          </Breadcrumbs>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggle}
              size="small"
              sx={{ color: 'text.secondary', ml: 'auto' }}
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon fontSize="small" />
              ) : (
                <DarkModeOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar nav */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: COLORS.DARK_BACKGROUND,
              border: 'none',
            },
          }}
        >
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: COLORS.DARK_BACKGROUND,
              border: 'none',
            },
          }}
          open
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
