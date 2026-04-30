'use client'

import { useState } from 'react'
import type { ExecutionInfo } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ExecutionEvidenceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onConfirm: (info: ExecutionInfo) => void
}

function ExecutionEvidenceFields({
    title,
    onConfirm,
    onOpenChange,
}: {
    title: string
    onConfirm: (info: ExecutionInfo) => void
    onOpenChange: (open: boolean) => void
}) {
    const [fechaCambio, setFechaCambio] = useState(() => new Date().toISOString().slice(0, 10))
    const [responsable, setResponsable] = useState('')
    const [comentario, setComentario] = useState('')
    const [evidenciaUrl, setEvidenciaUrl] = useState('')
    const [evidenciaArchivoNombre, setEvidenciaArchivoNombre] = useState('')

    const canConfirm =
        !!fechaCambio &&
        !!responsable.trim() &&
        !!comentario.trim() &&
        (!!evidenciaUrl.trim() || !!evidenciaArchivoNombre)

    return (
        <>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    Registra evidencia de ejecución para completar el cambio de estado.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
                <div className="space-y-2">
                    <Label>Fecha de cambio</Label>
                    <Input type="date" value={fechaCambio} onChange={(e) => setFechaCambio(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Responsable</Label>
                    <Input
                        value={responsable}
                        onChange={(e) => setResponsable(e.target.value)}
                        placeholder="Nombre del responsable"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Comentario de ejecución</Label>
                    <Textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows={3}
                        placeholder="Describe la ejecución realizada"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Evidencia por URL</Label>
                    <Input
                        value={evidenciaUrl}
                        onChange={(e) => setEvidenciaUrl(e.target.value)}
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>O adjuntar archivo</Label>
                    <Input
                        type="file"
                        onChange={(e) => setEvidenciaArchivoNombre(e.target.files?.[0]?.name || '')}
                    />
                    {evidenciaArchivoNombre && (
                        <p className="text-xs text-muted-foreground">{evidenciaArchivoNombre}</p>
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button
                    disabled={!canConfirm}
                    onClick={() => {
                        onConfirm({
                            fechaCambio,
                            responsable: responsable.trim(),
                            comentario: comentario.trim(),
                            evidenciaUrl: evidenciaUrl.trim() || undefined,
                            evidenciaArchivoNombre: evidenciaArchivoNombre || undefined,
                        })
                        onOpenChange(false)
                    }}
                >
                    Confirmar ejecución
                </Button>
            </DialogFooter>
        </>
    )
}

export function ExecutionEvidenceDialog({
    open,
    onOpenChange,
    title,
    onConfirm,
}: ExecutionEvidenceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                {open ? (
                    <ExecutionEvidenceFields title={title} onConfirm={onConfirm} onOpenChange={onOpenChange} />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
