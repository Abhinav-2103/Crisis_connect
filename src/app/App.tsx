import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DatabaseInitializer } from './components/DatabaseInitializer';

export default function App() {
  return (
    <DatabaseInitializer>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </DatabaseInitializer>
  );
}