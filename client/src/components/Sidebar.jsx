import { Home, BookOpen, Sparkles, Settings, User, MessageCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn';

const navigationItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'My Courses',
    href: '/dashboard/courses',
    icon: BookOpen
  },
  {
    name: 'Course Demo',
    href: '/dashboard/demo',
    icon: Sparkles
  },
  {
    name: 'AI Study Buddy',
    href: '/dashboard/study-buddy',
    icon: MessageCircle
  },
  {
    name: 'AI Tools',
    href: '/dashboard/tools',
    icon: Sparkles
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="h-full bg-gray-50/50 border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">AdaptLearn AI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-200/50 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Snippet */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Demo User
            </p>
            <p className="text-xs text-gray-500 truncate">
              demo@adaptlearn.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;