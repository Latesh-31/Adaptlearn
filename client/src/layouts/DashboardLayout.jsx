import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="h-screen flex bg-white">
      {/* Fixed Sidebar */}
      <div className="w-[250px] flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Placeholder for breadcrumbs and user profile */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <div className="text-sm text-gray-500">
            {/* Breadcrumbs will go here */}
            <span>Dashboard</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* User Profile Dropdown will go here */}
            <div className="text-sm font-medium text-gray-700">User Menu</div>
          </div>
        </header>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;