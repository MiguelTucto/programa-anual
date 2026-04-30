'use client'

import type { AnnualProgram, Activity } from '@/lib/types'
import { getActivityProgress } from '@/lib/progress'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Network, MessageSquare } from 'lucide-react'

type FlatActivity = {
    activity: Activity
    generalObjectiveId: string
    specificObjectiveId: string
    generalTitle: string
    specificTitle: string
}

interface ProgramActivitiesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    program: AnnualProgram
    onViewSubprograms: (activity: Activity, generalObjectiveId: string, specificObjectiveId: string) => void
}

export function ProgramActivitiesDialog({
    open,
    onOpenChange,
    program,
    onViewSubprograms,
}: ProgramActivitiesDialogProps) {
    const activities: FlatActivity[] = program.objetivosGenerales.flatMap((general) =>
        general.objetivosEspecificos.flatMap((specific) =>
            specific.actividades.map((activity) => ({
                activity,
                generalObjectiveId: general.id,
                specificObjectiveId: specific.id,
                generalTitle: general.titulo,
                specificTitle: specific.titulo,
            }))
        )
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Listado de actividades del Programa Anual</DialogTitle>
                    <DialogDescription>
                        Vista consolidada para revisar y navegar rápidamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto rounded-lg border border-border/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead>Actividad</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead>Objetivo General</TableHead>
                                <TableHead>Objetivo Específico</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-36">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map(({ activity, generalObjectiveId, specificObjectiveId, generalTitle, specificTitle }) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="max-w-[280px]">
                                        <div className="line-clamp-2">{activity.descripcion}</div>
                                    </TableCell>
                                    <TableCell>{activity.responsable}</TableCell>
                                    <TableCell className="max-w-[220px]">
                                        <div className="line-clamp-2">{generalTitle}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[220px]">
                                        <div className="line-clamp-2">{specificTitle}</div>
                                    </TableCell>
                                    <TableCell>{getActivityProgress(activity)}%</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{activity.estado}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    onOpenChange(false)
                                                    onViewSubprograms(activity, generalObjectiveId, specificObjectiveId)
                                                }}
                                            >
                                                <Network className="mr-1 h-4 w-4" />
                                                Subprog.
                                            </Button>
                                            <Button size="icon" variant="ghost" title="Tiene comentarios">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
