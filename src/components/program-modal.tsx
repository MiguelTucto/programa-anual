'use client'

import { useState } from 'react'
import { useSSTStore } from '@/lib/store'
import type { AnnualProgram } from '@/lib/types'
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

interface ProgramModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: 'create' | 'edit'
    program?: AnnualProgram
}

function ProgramForm({
    mode,
    program,
    onOpenChange,
}: {
    mode: 'create' | 'edit'
    program?: AnnualProgram
    onOpenChange: (open: boolean) => void
}) {
    const { addProgram, updateProgram, yearExists } = useSSTStore()

    const [anio, setAnio] = useState(
        () => (mode === 'edit' && program ? String(program.anio) : String(new Date().getFullYear()))
    )
    const [presupuesto, setPresupuesto] = useState(
        () => (mode === 'edit' && program ? String(program.presupuestoTotal) : '')
    )
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const anioNum = parseInt(anio) || 0
        const presupuestoNum = parseFloat(presupuesto) || 0

        if (mode === 'create') {
            if (yearExists(anioNum)) {
                setError(`Ya existe un programa para el año ${anioNum}`)
                return
            }
            const success = addProgram(anioNum, presupuestoNum)
            if (!success) {
                setError(`Ya existe un programa para el año ${anioNum}`)
                return
            }
        } else if (program) {
            updateProgram(program.id, { presupuestoTotal: presupuestoNum })
        }

        onOpenChange(false)
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {mode === 'create' ? 'Nuevo Programa Anual' : 'Editar Programa'}
                </DialogTitle>
                <DialogDescription>
                    {mode === 'create'
                        ? 'Crea un nuevo programa anual de SST especificando el año y presupuesto.'
                        : 'Modifica el presupuesto del programa seleccionado.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="anio">Año</Label>
                    <Input
                        id="anio"
                        type="number"
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        disabled={mode === 'edit'}
                        min={2020}
                        max={2100}
                        required
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="presupuesto">Presupuesto Total (S/.)</Label>
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
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        {mode === 'create' ? 'Crear Programa' : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </form>
        </>
    )
}

export function ProgramModal({ open, onOpenChange, mode, program }: ProgramModalProps) {
    const formKey = open ? `${mode}-${program?.id ?? 'new'}` : 'closed'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <ProgramForm key={formKey} mode={mode} program={program} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    )
}
