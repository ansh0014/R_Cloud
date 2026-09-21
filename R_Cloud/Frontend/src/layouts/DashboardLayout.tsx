import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LayoutDashboard,
  PlayCircle,
  Activity,
  Compass,
  FileText,
  Coins,
  LogOut,
  Sparkles,
  Sliders,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
  UploadCloud
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const userNavItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deploy Agent', path: '/dashboard/deploy', icon: UploadCloud },
    { label: 'Deployments', path: '/dashboard/deployments', icon: PlayCircle },
    { label: 'Agent Metrics', path: '/dashboard/agents', icon: Activity },
    { label: 'Traces', path: '/dashboard/traces', icon: Compass },
    { label: 'Runtime Logs', path: '/dashboard/logs', icon: FileText },
    { label: 'Token Usage', path: '/dashboard/tokens', icon: Coins }
  ];

  const adminNavItems = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'System Controls', path: '/admin/controls', icon: Sliders }
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col font-manrope">
      {/* --- Top Navbar --- */}
      <header className="sticky top-0 z-40 bg-[#0d0b17]/85 backdrop-blur-md border-b border-[#2b2344]/40 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-lg bg-[#7b39fc] flex items-center justify-center text-white shadow-[0_0_15px_rgba(123,57,252,0.4)]">
              <Sparkles className="size-4.5 animate-pulse" />
            </div>
            <span className="font-manrope text-base tracking-tight hidden sm:inline">R Agent Cloud</span>
          </Link>

          <span className="h-4 w-px bg-[#2b2344]/60 mx-1 hidden sm:inline" />

          {/* Role Status Tag */}
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            isAdmin 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {isAdmin ? 'Platform Admin' : 'Developer Console'}
          </span>
        </div>

        {/* --- Top Actions --- */}
        <div className="flex items-center gap-4">
          {/* Real-time WebSocket connection status indicator */}
          <div
            className="flex items-center gap-2 bg-[#131126] border border-[#2b2344] px-3 py-1.5 rounded-lg text-xs"
            title={isConnected ? 'Live WebSocket connection active' : 'WebSocket disconnected — reconnecting…'}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              {isConnected ? 'Live' : 'Reconnecting…'}
            </span>
            <RefreshCw className={`size-3 text-slate-400 ml-1 ${isConnected ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-[#131126] px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div className="size-7 rounded-full bg-gradient-to-tr from-[#7b39fc] to-[#a484d7] flex items-center justify-center text-white font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs text-slate-300 font-medium hidden md:inline">{user?.name}</span>
              <ChevronDown className="size-3.5 text-slate-400 hidden md:inline" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-[#0d0b17] border border-[#2b2344] rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-[#2b2344]/60">
                    {user?.picture && (
                      <img src={user.picture} alt={user.name} className="size-8 rounded-full mb-2" />
                    )}
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-[#1c1830] flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* --- Desktop Sidebar --- */}
        <aside className="w-64 bg-[#0d0b17] border-r border-[#2b2344]/40 hidden lg:flex flex-col justify-between py-6">
          <div className="px-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Navigation</p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-[0_2px_10px_rgba(123,57,252,0.2)]'
                          : 'text-slate-400 hover:text-white hover:bg-[#131126]'
                      }`}
                    >
                      <Icon className="size-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="px-4">
            <div className="bg-[#131126] border border-[#2b2344]/60 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#7b39fc] uppercase tracking-wider">Need assistance?</span>
              <p className="text-[11px] text-slate-400 leading-normal">Explore our platform documentations to customize deployments & agents API.</p>
              <a href="#" className="text-xs text-slate-200 hover:text-white font-medium underline mt-1">Read Docs</a>
            </div>
          </div>
        </aside>

        {/* --- Content Shell --- */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* --- Mobile Sidebar Overlay --- */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 z-50 bg-[#0d0b17] border-r border-[#2b2344] lg:hidden flex flex-col justify-between py-6 px-4 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2b2344]/60 pb-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <div className="size-8 rounded-lg bg-[#7b39fc] flex items-center justify-center text-white">
                    <Sparkles className="size-4.5" />
                  </div>
                  <span className="font-manrope text-base text-white tracking-tight">R Agent Cloud</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div>
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Navigation</p>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-slate-400 hover:text-white hover:bg-[#131126]'
                        }`}
                      >
                        <Icon className="size-4.5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="border-t border-[#2b2344]/60 pt-4 flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
