'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { CommentsSection } from './comments-section'
import type { Comentario } from '@/lib/types'

interface CommentsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    comentarios: Comentario[]
    onAddComment: (autor: string, contenido: string) => void
    title: string
}

export function CommentsDialog({
                                   open,
                                   onOpenChange,
                                   comentarios,
                                   onAddComment,
                                   title,
                               }: CommentsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Gestiona los comentarios de esta actividad.</DialogDescription>
                </DialogHeader>
                <CommentsSection comentarios={comentarios} onAddComment={onAddComment} />
            </DialogContent>
        </Dialog>
    )
}
