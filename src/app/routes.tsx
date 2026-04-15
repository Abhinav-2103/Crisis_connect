import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { MapScreen } from './components/map/MapScreen';
import { NeedsScreen } from './components/needs/NeedsScreen';
import { VolunteersScreen } from './components/volunteers/VolunteersScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { ChatScreen } from './components/chat/ChatScreen';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen';
import { AuthPage } from './components/auth/AuthPage';
import { MyNeedsScreen } from './components/user/MyNeedsScreen';
import { MyStatsScreen } from './components/volunteer/MyStatsScreen';
import { RootLayout } from './components/RootLayout';
import { NGOsScreen } from './components/ngos/NGOsScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <MapScreen />,
          },
          {
            path: 'needs',
            element: <NeedsScreen />,
          },
          {
            path: 'my-needs',
            element: <MyNeedsScreen />,
          },
          {
            path: 'volunteers',
            element: <VolunteersScreen />,
          },
          {
            path: 'dashboard',
            element: <DashboardScreen />,
          },
          {
            path: 'my-stats',
            element: <MyStatsScreen />,
          },
          {
            path: 'chat',
            element: <ChatScreen />,
          },
          {
            path: 'leaderboard',
            element: <LeaderboardScreen />,
          },
          {
            path: 'ngos',
            element: <NGOsScreen />,
          },
        ],
      },
    ],
  },
]);