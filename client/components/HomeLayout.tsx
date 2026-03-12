import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Flag, Compass, Bookmark, Settings, LogOut } from 'lucide-react';
import Logo from './Logo';

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: Compass, label: 'Find Courses', href: '/' },
    { icon: Flag, label: 'Book Tee Times', href: '/book' },
    { icon: Bookmark, label: 'My Bookings', href: '/bookings' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground transform transition-all duration-300 ease-in-out z-40 md:relative md:translate-x-0 md:transform-none border-r border-sidebar-border/20 flex flex-col overflow-y-auto ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-lg'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-sidebar-border/10 flex-shrink-0">
          <Logo />
          <div className="mt-4 h-px bg-gradient-to-r from-sidebar-accent/30 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center gap-4 px-5 py-3.5 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/15 transition-all duration-200 font-medium text-sm tracking-wide"
            >
              <item.icon size={20} className="group-hover:text-sidebar-accent transition-colors" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border/10 px-4 py-6 flex-shrink-0">
          <button className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/15 rounded-xl transition-all duration-200">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 md:hidden z-50 p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {children}
      </main>
    </div>
  );
}
