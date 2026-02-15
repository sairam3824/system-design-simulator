"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { LogoutButton } from "./logout-button";
import { HelpBotButton } from "@/components/help-bot/help-bot-button";

export function DashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 gap-4">
          {/* Hamburger - mobile only */}
          <button
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          <span className="text-sm font-medium text-muted-foreground">
            {userName}
          </span>
          <div className="h-4 w-px bg-border/50" />
          <LogoutButton />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>

      {/* Help Bot */}
      <HelpBotButton />
    </div>
  );
}
