'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageCircle, Send } from 'lucide-react'
import type { Comentario } from '@/lib/types'

interface CommentsSectionProps {
    comentarios: Comentario[]
    onAddComment: (autor: string, contenido: string) => void
}

export function CommentsSection({ comentarios, onAddComment }: CommentsSectionProps) {
    const [autor, setAutor] = useState('')
    const [contenido, setContenido] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!autor.trim() || !contenido.trim()) return

        onAddComment(autor, contenido)
        setAutor('')
        setContenido('')
    }

    return (
        <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Comentarios ({comentarios.length})</h3>
            </div>

            {comentarios.length > 0 && (
                <div className="max-h-48 space-y-3 overflow-y-auto">
                    {comentarios.map((comment) => (
                        <Card key={comment.id} className="bg-secondary/50 p-3">
                            <div className="flex items-start justify-between">
                                <span className="font-medium text-sm text-foreground">{comment.autor}</span>
                                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString('es-PE')}
                </span>
                            </div>
                            <p className="mt-1 text-sm text-foreground/90">{comment.contenido}</p>
                        </Card>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Input
                    placeholder="Tu nombre"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="text-sm"
                />
                <div className="flex gap-2">
                    <Input
                        placeholder="Escribe un comentario..."
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        className="text-sm"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={!autor.trim() || !contenido.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}
