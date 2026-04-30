'use client'

import { useState } from 'react'
import { useSSTStore } from '@/lib/store'
import type { SpecificObjective } from '@/lib/types'
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
import { Textarea } from '@/components/ui/textarea'

interface SpecificObjectiveModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    programId: string
    generalObjectiveId: string
    mode: 'create' | 'edit'
    specificObjective?: SpecificObjective
}

function SpecificObjectiveForm({
    programId,
    generalObjectiveId,
    mode,
    specificObjective,
    onOpenChange,
}: {
    programId: string
    generalObjectiveId: string
    mode: 'create' | 'edit'
    specificObjective?: SpecificObjective
    onOpenChange: (open: boolean) => void
}) {
    const { addSpecificObjective, updateSpecificObjective } = useSSTStore()

    const [titulo, setTitulo] = useState(
        () => (mode === 'edit' && specificObjective ? specificObjective.titulo : '')
    )
    const [meta, setMeta] = useState(
        () => (mode === 'edit' && specificObjective ? specificObjective.meta : '')
    )
    const [indicador, setIndicador] = useState(
        () => (mode === 'edit' && specificObjective ? specificObjective.indicador : '')
    )
    const [presupuesto, setPresupuesto] = useState(
        () => (mode === 'edit' && specificObjective ? String(specificObjective.presupuesto) : '')
    )
    const [recursos, setRecursos] = useState(
        () => (mode === 'edit' && specificObjective ? specificObjective.recursos : '')
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!titulo.trim() || !meta.trim() || !indicador.trim()) return

        const objectiveData = {
            titulo: titulo.trim(),
            meta: meta.trim(),
            indicador: indicador.trim(),
            presupuesto: parseFloat(presupuesto) || 0,
            recursos: recursos.trim(),
        }

        if (mode === 'create') {
            addSpecificObjective(programId, generalObjectiveId, objectiveData)
        } else if (specificObjective) {
            updateSpecificObjective(
                programId,
                generalObjectiveId,
                specificObjective.id,
                objectiveData
            )
        }

        onOpenChange(false)
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {mode === 'create' ? 'Nuevo Objetivo Específico' : 'Editar Objetivo Específico'}
                </DialogTitle>
                <DialogDescription>
                    {mode === 'create'
                        ? 'Define un objetivo específico con su meta, indicador y presupuesto.'
                        : 'Modifica los detalles del objetivo específico.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej: Implementar programa de capacitaciones"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="meta">Meta</Label>
                    <Input
                        id="meta"
                        value={meta}
                        onChange={(e) => setMeta(e.target.value)}
                        placeholder="Ej: Capacitar al 100% del personal"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="indicador">Indicador</Label>
                    <Input
                        id="indicador"
                        value={indicador}
                        onChange={(e) => setIndicador(e.target.value)}
                        placeholder="Ej: % de personal capacitado"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="presupuesto">Presupuesto (S/.)</Label>
                        <Input
                            id="presupuesto"
                            type="number"
                            value={presupuesto}
                            onChange={(e) => setPresupuesto(e.target.value)}
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recursos">Recursos</Label>
                        <Textarea
                            id="recursos"
                            value={recursos}
                            onChange={(e) => setRecursos(e.target.value)}
                            placeholder="Ej: Materiales, personal"
                            rows={1}
                        />
                    </div>
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

export function SpecificObjectiveModal({
    open,
    onOpenChange,
    programId,
    generalObjectiveId,
    mode,
    specificObjective,
}: SpecificObjectiveModalProps) {
    const formKey = open ? `${mode}-${specificObjective?.id ?? 'new'}` : 'closed'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <SpecificObjectiveForm
                    key={formKey}
                    programId={programId}
                    generalObjectiveId={generalObjectiveId}
                    mode={mode}
                    specificObjective={specificObjective}
                    onOpenChange={onOpenChange}
                />
            </DialogContent>
        </Dialog>
    )
}
