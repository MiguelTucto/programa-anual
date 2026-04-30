'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserCircle2 } from 'lucide-react'

export function Header() {
    const defaultUserName = 'Usuario Invitado'

    return (
        <header className="h-[72px] border-b border-border/80 bg-card/95 backdrop-blur px-6 py-3 flex items-center justify-end">
            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-1.5">
                <Avatar className="size-7 border border-border">
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                        UI
                    </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col leading-none">
                    <span className="text-xs text-muted-foreground">Sesion activa</span>
                    <span className="text-sm font-medium">{defaultUserName}</span>
                </div>
                <UserCircle2 className="w-4 h-4 text-muted-foreground sm:hidden" />
            </div>
        </header>
    )
}
