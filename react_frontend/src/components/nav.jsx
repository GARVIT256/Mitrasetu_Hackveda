import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Home as HomeIcon, BookOpen, Users, User, PlusSquare, Video, Shield, ShoppingBag, Trophy, MessageCircleMore, Ellipsis, ChevronLeft, ChevronRight } from 'lucide-react';




export function Nav() {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Journey', path: '/journey' },
    { name: 'Resources', path: '/resources' },
    { name: 'Profile', path: '/profile' }
  ];

  const { logout } = useAuth0();
const origin = window.location.origin;

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: `${origin}/`
      }
    });
  };

  // On /home, hide the top bar and only render sidebar
  if (location.pathname === '/home') {
    return (
      <nav className="fixed top-0 left-0 z-50 w-full">
        <SidebarHome pathname={location.pathname} />
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-white border-b border-gray-200 shadow-lg">
      <div className="flex items-center gap-4">
        <img src="/colored-logo.png" alt="MitraSetu" className="w-auto h-8" />
        {/* Icon nav (horizontal) */}
        <div className="items-center hidden gap-2 md:flex">
          <HorizontalItem active={location.pathname === '/home'} to="/home" color="bg-[#2B3442]" Icon={HomeIcon} label="Home" />
          <HorizontalItem asAnchor href="/home#post-tip" color="bg-[#7C3AED]" Icon={PlusSquare} label="Post" />
          <HorizontalItem active={location.pathname === '/live'} to="/live" color="bg-[#16A34A]" Icon={Video} label="Live" />
          <HorizontalItem active={location.pathname === '/journey'} to="/journey" color="bg-[#FB923C]" Icon={BookOpen} label="Chat" />
          <HorizontalItem active={location.pathname === '/resources'} to="/resources" color="bg-[#F59E0B]" Icon={Shield} label="Circle" />
          <HorizontalItem active={location.pathname === '/profile'} to="/profile" color="bg-[#3B82F6]" Icon={User} label="Profile" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-md hover:bg-indigo-700"
         onClick={handleLogout}
        >Sign Out</button>
      </div>
    </nav>
  );
}

export default Nav;

function SidebarHome({ pathname }) {
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem('ms_sidebar_collapsed')
    if (stored != null) setCollapsed(stored === '1')
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('ms_sidebar_collapsed', next ? '1' : '0')
      return next
    })
  }

  return (
    <div className={`fixed left-0 top-0 h-full ${collapsed ? 'w-16' : 'w-64'} ${collapsed ? 'px-2' : 'px-4'} py-6 bg-white text-gray-900 hidden md:block transition-all duration-300 ease-in-out relative ${collapsed ? 'border-r border-transparent' : 'border-r border-gray-200'}`}>
      <div className="flex items-center justify-center mb-6">
        <img src="/colored-logo.png" alt="MitraSetu" className={`transition-all object-contain ${collapsed ? 'h-8' : 'h-10'} w-auto`} />
      </div>

      <div className="space-y-2">
        <SidebarItem active={pathname === '/home'} collapsed={collapsed} color="bg-[#2B3442]" Icon={HomeIcon} label="Home" to="/home" />
        <SidebarItem asAnchor href="/home#post-tip" collapsed={collapsed} color="bg-[#7C3AED]" Icon={PlusSquare} label="Post Health Tip" />
        <SidebarItem active={pathname === '/live'} collapsed={collapsed} color="bg-[#16A34A]" Icon={Video} label="Live with Mitra" to="/live" />
        <SidebarItem active={pathname === '/journey'} collapsed={collapsed} color="bg-[#FB923C]" Icon={BookOpen} label="Chat with Mitra" to="/journey" />
        <SidebarItem active={pathname === '/resources'} collapsed={collapsed} color="bg-[#F59E0B]" Icon={Shield} label="Mitra Circle" to="/resources" />
        {/* <SidebarItem active={pathname === '/shop'} collapsed={collapsed} color="bg-[#EF4444]" Icon={ShoppingBag} label="Shop" to="/shop" /> */}
        <SidebarItem active={pathname === '/profile'} collapsed={collapsed} color="bg-[#3B82F6]" Icon={User} label="Profile" to="/profile" />
        {/* <SidebarItem asAnchor href="#more" collapsed={collapsed} color="bg-[#A855F7]" Icon={Ellipsis} label="More" /> */}
      </div>

      {/* Floating collapse toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        title={collapsed ? 'Expand' : 'Collapse'}
        className={`absolute flex items-center justify-center w-9 h-9 transition-all bg-white/95 border rounded-full shadow-lg top-1/2 -translate-y-1/2 hover:bg-white z-[60] ${collapsed ? '-right-5' : '-right-4'} border-gray-200 backdrop-blur-sm hover:scale-105`}
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-slate-700" /> : <ChevronLeft className="w-4 h-4 text-slate-700" />}
      </button>
    </div>
  )
}

function SidebarItem({ asAnchor=false, href, to, active=false, collapsed, color='bg-gray-200', Icon, label }) {
  const common = `flex items-center ${collapsed ? 'justify-center px-1 py-2' : 'gap-3 px-4 py-3'} rounded-xl ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`
  const iconWrap = `flex items-center justify-center w-10 h-10 rounded-lg text-white ${color} flex-none`
  const content = (
    <div className={`${common} relative group`} aria-label={label}>
      <div className={iconWrap}><Icon size={18} /></div>
      {!collapsed && <span className="font-semibold">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 shadow-lg z-20">
          {label}
        </span>
      )}
    </div>
  )
  if (asAnchor) {
    return <a href={href}>{content}</a>
  }
  return <Link to={to}>{content}</Link>
}

function HorizontalItem({ asAnchor=false, href, to, active=false, color='bg-gray-200', Icon, label }) {
  const base = `flex items-center gap-2 px-3 py-2 rounded-xl ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`
  const iconWrap = `flex items-center justify-center w-8 h-8 rounded-lg text-white ${color}`
  const content = (
    <div className={base}>
      <div className={iconWrap}><Icon size={16} /></div>
      <span className="hidden text-sm font-semibold lg:inline">{label}</span>
    </div>
  )
  if (asAnchor) return <a href={href}>{content}</a>
  return <Link to={to}>{content}</Link>
}
