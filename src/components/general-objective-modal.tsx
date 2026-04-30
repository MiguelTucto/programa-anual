'use client'

import { useState } from 'react'
import { useSSTStore } from '@/lib/store'
import type { GeneralObjective } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface GeneralObjectiveModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    programId: string
    mode: 'create' | 'edit'
    objective?: GeneralObjective
}

function GeneralObjectiveForm({
    programId,
    mode,
    objective,
    onOpenChange,
}: {
    programId: string
    mode: 'create' | 'edit'
    objective?: GeneralObjective
    onOpenChange: (open: boolean) => void
}) {
    const { addGeneralObjective, updateGeneralObjective } = useSSTStore()

    const [titulo, setTitulo] = useState(
        () => (mode === 'edit' && objective ? objective.titulo : '')
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!titulo.trim()) return

        if (mode === 'create') {
            addGeneralObjective(programId, titulo.trim())
        } else if (objective) {
            updateGeneralObjective(programId, objective.id, titulo.trim())
        }

        onOpenChange(false)
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {mode === 'create' ? 'Nuevo Objetivo General' : 'Editar Objetivo General'}
                </DialogTitle>
                <DialogDescription>
                    {mode === 'create'
                        ? 'Define un objetivo general para el programa anual de SST.'
                        : 'Modifica el título del objetivo general.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="titulo">Título del Objetivo</Label>
                    <Input
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Reducir accidentes laborales"
                        required
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        {mode === 'create' ? 'Crear Objetivo' : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </form>
        </>
    )
}

export function GeneralObjectiveModal({
    open,
    onOpenChange,
    programId,
    mode,
    objective,
}: GeneralObjectiveModalProps) {
    const formKey = open ? `${mode}-${objective?.id ?? 'new'}` : 'closed'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <GeneralObjectiveForm
                    key={formKey}
                    programId={programId}
                    mode={mode}
                    objective={objective}
                    onOpenChange={onOpenChange}
                />
            </DialogContent>
        </Dialog>
    )
}
