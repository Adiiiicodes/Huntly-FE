'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaChartBar } from 'react-icons/fa';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Dashboard', href: '/dashboard', icon: FaChartBar },
  ];

  return (
    <div className="hidden lg:block border-r bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl text-primary">
            <span className="text-blue-600 dark:text-blue-400">HuntLy</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 py-4 font-medium space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
