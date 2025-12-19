import { Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

const PlaceholderHome = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-xs font-medium text-gray-500">AdaptLearn AI</div>
        <h1 className="mt-2 text-2xl font-semibold">Foundation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Auth is scaffolded. Next: workspace shell, sidebar navigation, and course primitives.
        </p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
