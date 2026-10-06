"use client";

import Link from "next/link";
import { Bell, Search, Plus } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search employees, departments, reports..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-surface-2 border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* Primary action */}
        {action && action.href ? (
          <Link href={action.href}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Plus size={15} />
            {action.label}
          </Link>
        ) : action ? (
          <button onClick={action.onClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Plus size={15} />
            {action.label}
          </button>
        ) : null}
      </div>
    </header>
  );
}
