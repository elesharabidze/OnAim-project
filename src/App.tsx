import { Suspense, lazy } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary, FeatureBoundary, PageLoader } from '@/shared/components'
import AdminLayout from '@/layouts/AdminLayout'
import { PATHS } from '@/routes/paths'
import queryClient from '@/lib/queryClient'
import { AppThemeProvider } from '@/lib/ThemeContext'

const LeaderboardListPage = lazy(
  () => import('@/features/leaderboard/pages/LeaderboardListPage')
)
const LeaderboardCreatePage = lazy(
  () => import('@/features/leaderboard/pages/LeaderboardCreatePage')
)
const LeaderboardEditPage = lazy(
  () => import('@/features/leaderboard/pages/LeaderboardEditPage')
)
const LeaderboardDetailPage = lazy(
  () => import('@/features/leaderboard/pages/LeaderboardDetailPage')
)

const RaffleListPage = lazy(
  () => import('@/features/raffle/pages/RaffleListPage')
)
const RaffleCreatePage = lazy(
  () => import('@/features/raffle/pages/RaffleCreatePage')
)
const RaffleEditPage = lazy(
  () => import('@/features/raffle/pages/RaffleEditPage')
)
const RaffleDetailPage = lazy(
  () => import('@/features/raffle/pages/RaffleDetailPage')
)

const WheelListPage = lazy(
  () => import('@/features/wheel/pages/WheelListPage')
)
const WheelCreatePage = lazy(
  () => import('@/features/wheel/pages/WheelCreatePage')
)
const WheelEditPage = lazy(
  () => import('@/features/wheel/pages/WheelEditPage')
)
const WheelDetailPage = lazy(
  () => import('@/features/wheel/pages/WheelDetailPage')
)

import NotFoundPage from '@/shared/components/NotFoundPage'

const SuspenseWrapper = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
)

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<SuspenseWrapper />}>
      <Route
        path={PATHS.root}
        element={<Navigate to={PATHS.leaderboard.root} replace />}
      />

      <Route element={<AdminLayout />}>
        <Route element={<FeatureBoundary />}>
          <Route path={PATHS.leaderboard.root} element={<LeaderboardListPage />} />
          <Route path={PATHS.leaderboard.create} element={<LeaderboardCreatePage />} />
          <Route path={PATHS.leaderboard.detail(':id')} element={<LeaderboardDetailPage />} />
          <Route path={PATHS.leaderboard.edit(':id')} element={<LeaderboardEditPage />} />
        </Route>

        <Route element={<FeatureBoundary />}>
          <Route path={PATHS.raffle.root} element={<RaffleListPage />} />
          <Route path={PATHS.raffle.create} element={<RaffleCreatePage />} />
          <Route path={PATHS.raffle.detail(':id')} element={<RaffleDetailPage />} />
          <Route path={PATHS.raffle.edit(':id')} element={<RaffleEditPage />} />
        </Route>

        <Route element={<FeatureBoundary />}>
          <Route path={PATHS.wheel.root} element={<WheelListPage />} />
          <Route path={PATHS.wheel.create} element={<WheelCreatePage />} />
          <Route path={PATHS.wheel.detail(':id')} element={<WheelDetailPage />} />
          <Route path={PATHS.wheel.edit(':id')} element={<WheelEditPage />} />
        </Route>
      </Route>

      <Route path={PATHS.notFound} element={<NotFoundPage />} />
    </Route>
  )
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </AppThemeProvider>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}
