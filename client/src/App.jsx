import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardHome from './pages/DashboardHome';
import DashboardCourses from './pages/DashboardCourses';
import CourseDemo from './pages/CourseDemo';

// Placeholder components for future implementation
const AITools = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-gray-900 mb-4">AI Tools</h1>
    <p className="text-gray-600">AI-powered learning tools coming soon...</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h1>
    <p className="text-gray-600">Account settings and preferences...</p>
  </div>
);

const PlaceholderHome = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-xs font-medium text-gray-500">AdaptLearn AI</div>
        <h1 className="mt-2 text-2xl font-semibold">Foundation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Auth is scaffolded. Protected workspace shell is now complete.
        </p>
        <div className="mt-6">
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PlaceholderHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="courses" element={<DashboardCourses />} />
        <Route path="demo" element={<CourseDemo />} />
        <Route path="tools" element={<AITools />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}