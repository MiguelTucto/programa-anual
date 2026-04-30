'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Shield,
} from 'lucide-react'

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

const navigationItems = [
    { icon: LayoutDashboard, label: 'Programa Anual', active: true },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    return (
        <aside
            className={cn(
                'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-[72px] flex items-center px-4 border-b border-sidebar-border/80">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-sidebar-foreground text-lg">Laus</span>
                            <span className="text-[11px] text-muted-foreground">Programa Anual SST</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <div className={cn('mb-4', collapsed && 'hidden')}>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                        Módulos
                    </span>
                </div>

                {navigationItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={<item.icon className="w-5 h-5" />}
                        label={item.label}
                        active={item.active}
                        collapsed={collapsed}
                    />
                ))}
            </nav>

            {!collapsed && (
                <div className="px-3 pb-3">
                    <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                        Las acciones de gestión y configuración se encuentran en la barra superior para un flujo más claro.
                    </div>
                </div>
            )}

            {/* Collapse Button */}
            <div className="p-3 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn('w-full', collapsed && 'px-0')}
                    onClick={onToggle}
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            <span>Colapsar</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    )
}

function NavItem({
                     icon,
                     label,
                     active = false,
                     collapsed = false,
                 }: {
    icon: React.ReactNode
    label: string
    active?: boolean
    collapsed?: boolean
}) {
    return (
        <button
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                collapsed && 'justify-center px-0'
            )}
        >
            {icon}
            {!collapsed && <span className="font-medium">{label}</span>}
        </button>
    )
}
