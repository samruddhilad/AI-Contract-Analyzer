import React from 'react';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  MessageSquareText,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Home,
} from 'lucide-react';
import { useContract } from '../context/ContractContext';
import type { ViewType } from '../types/contract';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}) => {
  const { currentView, navigateTo, activeContract, contractHistory } = useContract();

  const navItems: {
    id: ViewType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    requiresContract?: boolean;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={19} />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'upload',
      label: 'Upload Contract',
      icon: <Upload size={19} />,
    },
    {
      id: 'analysis',
      label: 'Analysis Results',
      icon: <BarChart3 size={19} />,
      badge: activeContract ? 'Active' : undefined,
    },
    {
      id: 'ask_ai',
      label: 'Ask AI',
      icon: <MessageSquareText size={19} />,
      badge: activeContract ? 'Ready' : undefined,
    },
    {
      id: 'my_contracts',
      label: 'My Contracts',
      icon: <FileSpreadsheet size={19} />,
      badge: contractHistory.length > 0 ? contractHistory.length : undefined,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={19} />,
    },
  ];

  const handleNavClick = (view: ViewType) => {
    navigateTo(view);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
            display: window.innerWidth < 1024 ? 'block' : 'none',
          }}
        />
      )}

      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--color-bg-sidebar)',
          color: 'var(--color-sidebar-text)',
          borderRight: '1px solid var(--color-sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          zIndex: 50,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          position: window.innerWidth < 1024 ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          bottom: 0,
          transform:
            window.innerWidth < 1024 && !isOpen
              ? 'translateX(-100%)'
              : 'translateX(0)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid var(--color-sidebar-border)',
          }}
        >
          <div
            onClick={() => handleNavClick('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <ShieldAlert size={20} />
            </div>

            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  LexiGuard
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  SLM Contract AI
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="btn-ghost"
              style={{
                color: '#94a3b8',
                padding: '6px',
                borderRadius: '6px',
                display: window.innerWidth < 1024 ? 'none' : 'flex',
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '16px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: collapsed ? '12px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive
                    ? 'var(--color-sidebar-item-active)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-sidebar-text-active)'
                    : 'var(--color-sidebar-text)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  borderLeft:
                    isActive && !collapsed
                      ? '3px solid var(--color-primary)'
                      : '3px solid transparent',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor:
                        item.badge === 'Active' || item.badge === 'Ready'
                          ? 'rgba(16, 185, 129, 0.16)'
                          : 'rgba(255, 255, 255, 0.1)',
                      color:
                        item.badge === 'Active' || item.badge === 'Ready'
                          ? 'var(--color-risk-low)'
                          : '#cbd5e1',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Model Footer Badge */}
        <div
          style={{
            padding: collapsed ? '12px 8px' : '16px',
            borderTop: '1px solid var(--color-sidebar-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {collapsed ? (
            <div
              style={{ display: 'flex', justifyContent: 'center' }}
              title="Powered by Qwen2.5-1.5B-Instruct SLM"
            >
              <Cpu size={20} color="var(--color-primary)" />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
              }}
            >
              <Cpu size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>
                  Qwen2.5-1.5B-Instruct
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  On-Premise SLM Pipeline
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <button
              onClick={onToggleCollapse}
              className="btn-ghost"
              style={{
                color: '#94a3b8',
                padding: '6px',
                width: '100%',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'center',
              }}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
