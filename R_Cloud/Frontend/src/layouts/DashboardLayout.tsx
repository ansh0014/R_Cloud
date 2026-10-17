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
    <div className="min-h-screen bg-[#071F14] text-[#F7F9F7] flex flex-col font-manrope">
      {/* --- Top Navbar --- */}
      <header className="sticky top-0 z-40 bg-[#0F3B27]/90 backdrop-blur-md border-b border-[#CFF1D2]/15 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#CFF1D2]/70 hover:text-[#92FF5F]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-lg bg-[#92FF5F] flex items-center justify-center text-[#0F3B27] shadow-[0_0_15px_rgba(146,255,95,0.4)]">
              <Sparkles className="size-4.5 animate-pulse" />
            </div>
            <span className="font-manrope font-bold text-base tracking-tight text-[#F7F9F7] hidden sm:inline">R Agent Cloud</span>
          </Link>

          <span className="h-4 w-px bg-[#CFF1D2]/20 mx-1 hidden sm:inline" />

          {/* Role Status Tag */}
          <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-md ${
            isAdmin 
              ? 'bg-[#FF7036] text-white shadow-[0_0_10px_rgba(255,112,54,0.3)]' 
              : 'bg-[#92FF5F] text-[#0F3B27] shadow-[0_0_10px_rgba(146,255,95,0.25)]'
          }`}>
            {isAdmin ? 'Platform Admin' : 'Developer Console'}
          </span>
        </div>

        {/* --- Top Actions --- */}
        <div className="flex items-center gap-4">
          {/* Real-time WebSocket connection status indicator */}
          <div
            className="flex items-center gap-2 bg-[#0A2619] border border-[#CFF1D2]/20 px-3 py-1.5 rounded-lg text-xs"
            title={isConnected ? 'Live WebSocket connection active' : 'WebSocket disconnected — reconnecting…'}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#92FF5F] opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-[#92FF5F]' : 'bg-[#FF7036]'
              }`} />
            </span>
            <span className="text-[#CFF1D2] font-mono text-xs font-semibold hidden sm:inline">
              {isConnected ? 'LIVE FEED' : 'RECONNECTING…'}
            </span>
            <RefreshCw className={`size-3 text-[#BFF2F0] ml-1 ${isConnected ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 bg-[#0A2619] border border-[#CFF1D2]/20 hover:border-[#92FF5F]/50 px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="size-7 rounded-full object-cover ring-1 ring-[#92FF5F]/50"
                />
              ) : (
                <div className="size-7 rounded-full bg-[#92FF5F] text-[#0F3B27] flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs text-[#F7F9F7] font-medium hidden md:inline">{user?.name}</span>
              <ChevronDown className="size-3.5 text-[#CFF1D2] hidden md:inline" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-[#0F3B27] border border-[#CFF1D2]/25 rounded-xl shadow-2xl z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-[#CFF1D2]/15">
                    {user?.picture && (
                      <img src={user.picture} alt={user.name} className="size-8 rounded-full mb-2 ring-1 ring-[#92FF5F]" />
                    )}
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#CFF1D2]/70 truncate mt-0.5 font-mono">{user?.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-[#FF7036] hover:bg-[#071F14] flex items-center gap-2 transition-colors font-medium"
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
        <aside className="w-64 bg-[#0A2619] border-r border-[#CFF1D2]/15 hidden lg:flex flex-col justify-between py-6">
          <div className="px-4 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-bold text-[#CFF1D2]/60 uppercase tracking-widest font-mono mb-3">Workspace</p>
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
                          ? 'bg-[#92FF5F] text-[#0F3B27] font-bold shadow-[0_2px_12px_rgba(146,255,95,0.25)]'
                          : 'text-[#CFF1D2]/75 hover:text-[#F7F9F7] hover:bg-[#0F3B27]'
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
            <div className="bg-[#0F3B27] border border-[#CFF1D2]/20 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#92FF5F] uppercase font-mono tracking-wider">Cloud Engine Docs</span>
              <p className="text-[11px] text-[#CFF1D2]/80 leading-normal">Explore microVM architecture, custom agents API & real-time telemetry.</p>
              <a href="#" className="text-xs text-[#BFF2F0] hover:text-[#92FF5F] font-semibold underline mt-1">Read Docs &rarr;</a>
            </div>
          </div>
        </aside>

        {/* --- Content Shell --- */}
        <main className="flex-1 overflow-y-auto bg-[#071F14]">
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
          <aside className="fixed inset-y-0 left-0 w-72 z-50 bg-[#0A2619] border-r border-[#CFF1D2]/20 lg:hidden flex flex-col justify-between py-6 px-4 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#CFF1D2]/15 pb-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <div className="size-8 rounded-lg bg-[#92FF5F] flex items-center justify-center text-[#0F3B27]">
                    <Sparkles className="size-4.5" />
                  </div>
                  <span className="font-manrope text-base text-white tracking-tight font-bold">R Agent Cloud</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#CFF1D2] hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div>
                <p className="px-3 text-[10px] font-bold text-[#CFF1D2]/60 uppercase tracking-widest font-mono mb-3">Workspace</p>
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
                            ? 'bg-[#92FF5F] text-[#0F3B27] font-bold'
                            : 'text-[#CFF1D2]/75 hover:text-white hover:bg-[#0F3B27]'
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

            <div className="border-t border-[#CFF1D2]/15 pt-4 flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF7036]/15 hover:bg-[#FF7036]/25 text-[#FF7036] border border-[#FF7036]/30 rounded-lg text-sm font-semibold transition-all"
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
