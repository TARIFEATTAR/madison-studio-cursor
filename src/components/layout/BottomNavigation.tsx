import { Home, FolderOpen, Calendar, Settings, Plus, Edit3, Repeat, Image as ImageIcon, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  route: string;
}

interface FABActionProps {
  icon: React.ElementType;
  label: string;
  route: string;
  onClick: () => void;
}

const FABAction = ({ icon: Icon, label, route, onClick }: FABActionProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate(route);
        onClick();
      }}
      className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg pl-3 pr-4 py-2 min-w-[120px] hover:shadow-xl transition-shadow">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-brass to-brand-stone flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-brand-ink">{label}</span>
      </div>
    </button>
  );
};

export const BottomNavigation = () => {
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', route: '/' },
    { icon: FolderOpen, label: 'Library', route: '/library' },
    { icon: Calendar, label: 'Schedule', route: '/schedule' },
    { icon: Settings, label: 'Settings', route: '/settings' },
  ];

  const fabActions = [
    { icon: Edit3, label: 'Create', route: '/create' },
    { icon: Repeat, label: 'Multiply', route: '/multiply' },
    { icon: ImageIcon, label: 'Image Studio', route: '/image-editor' },
    // { icon: Mail, label: 'Email', route: '/email-builder' }, // Temporarily hidden for launch
  ];

  const isActive = (route: string) => location.pathname === route;

  return (
    <>
      {/* Backdrop overlay when FAB is open */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[998] md:hidden animate-fade-in"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-brand-ink border-t border-brand-stone z-[999] md:hidden safe-area-bottom"
        aria-label="Primary Navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          
          {/* First two nav items */}
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.route}
              to={item.route}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[56px] rounded-lg transition-all nav-item',
                isActive(item.route)
                  ? 'text-brand-brass bg-brand-brass/10'
                  : 'text-brand-stone hover:text-brand-vellum'
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-lato">{item.label}</span>
            </Link>
          ))}

          {/* Floating Action Button (Center) */}
          <div className="relative -mt-8">
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={cn(
                'w-14 h-14 rounded-full bg-brand-brass',
                'shadow-lg shadow-brand-brass/40 flex items-center justify-center',
                'transition-transform active:scale-95',
                fabOpen && 'rotate-45'
              )}
              aria-label="Quick Actions Menu"
              aria-expanded={fabOpen}
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* FAB Action Menu */}
            {fabOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col gap-3 pb-2">
                {fabActions.map((action, index) => (
                  <div 
                    key={action.route}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FABAction
                      icon={action.icon}
                      label={action.label}
                      route={action.route}
                      onClick={() => setFabOpen(false)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last two nav items */}
          {navItems.slice(2, 4).map((item) => (
            <Link
              key={item.route}
              to={item.route}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[56px] rounded-lg transition-all nav-item',
                isActive(item.route)
                  ? 'text-brand-brass bg-brand-brass/10'
                  : 'text-brand-stone hover:text-brand-vellum'
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-lato">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};
