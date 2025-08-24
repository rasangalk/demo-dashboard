'use client';

import Link from 'next/link';
import { FC, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

const Sidebar: FC<SidebarProps> = ({ className }) => {
  return (
    <div className={`w-64 bg-card h-screen p-4 border-r ${className}`}>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Question Bank</h1>
        <p className='text-muted-foreground'>Admin Dashboard</p>
      </div>

      <nav className='space-y-1'>
        <SidebarLink href='/' label='Dashboard' />
        <SidebarLink href='/subjects' label='Subjects' />
        <SidebarLink href='/modules' label='Modules' />
        <SidebarLink href='/submodules' label='Sub-Modules' />
        <SidebarLink href='/questions' label='Questions' />
        <SidebarLink href='/attempt-questions' label='Attempt Questions' />
      </nav>
      <LogoutButton />
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  label: string;
}

const SidebarLink: FC<SidebarLinkProps> = ({ href, label }) => {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${
          isActive
            ? 'bg-accent text-accent-foreground font-bold border-l-4 border-primary pl-3'
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
    >
      {label}
    </Link>
  );
};

export default Sidebar;

const LogoutButton: FC = () => {
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (_) {
      // silent
    }
  }, []);
  return (
    <button
      onClick={handleLogout}
      className='mt-8 w-full text-sm font-medium px-4 py-2 rounded-md border hover:bg-accent transition-colors'
    >
      Logout
    </button>
  );
};
