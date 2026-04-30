import { create } from 'zustand'
import type {
    AnnualProgram,
    GeneralObjective,
    SpecificObjective,
    Activity,
    ProgramStatus,
    Subprograma,
    Comentario,
    DynamicFieldValue,
    ExecutionInfo,
    SubprogramMonthState,
    SubprogramMonthStatus,
    SubprogramOverallStatus,
} from './types'

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

function defaultMesEstados(meses: number[]): Record<string, SubprogramMonthState> {
    const sorted = [...new Set(meses)].sort((a, b) => a - b)
    return Object.fromEntries(
        sorted.map((m) => [String(m), { estado: 'P' as SubprogramMonthStatus } satisfies SubprogramMonthState])
    )
}

function mergeMesEstadosForMeses(
    meses: number[],
    prev: Record<string, SubprogramMonthState> | undefined
): Record<string, SubprogramMonthState> {
    const sorted = [...new Set(meses)].sort((a, b) => a - b)
    const next: Record<string, SubprogramMonthState> = {}
    for (const m of sorted) {
        const key = String(m)
        next[key] = prev?.[key] ?? { estado: 'P' }
    }
    return next
}

function subprogramOverallFromMesEstados(
    meses: number[],
    mesEstados: Record<string, SubprogramMonthState>
): SubprogramOverallStatus {
    if (meses.length === 0) return 'En proceso'
    const allExecuted = meses.every((m) => mesEstados[String(m)]?.estado === 'E')
    return allExecuted ? 'Realizada' : 'En proceso'
}

interface SSTStore {
    programs: AnnualProgram[]
    selectedProgramId: string | null

    // Program actions
    addProgram: (anio: number, presupuestoTotal: number) => boolean
    updateProgram: (id: string, updates: Partial<Pick<AnnualProgram, 'presupuestoTotal'>>) => void
    deleteProgram: (id: string) => void
    updateProgramStatus: (id: string, estado: ProgramStatus) => void
    selectProgram: (id: string | null) => void
    yearExists: (anio: number, excludeId?: string) => boolean

    // General Objective actions
    addGeneralObjective: (programId: string, titulo: string) => void
    updateGeneralObjective: (programId: string, objectiveId: string, titulo: string) => void
    deleteGeneralObjective: (programId: string, objectiveId: string) => void

    // Specific Objective actions
    addSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objective: Omit<SpecificObjective, 'id' | 'actividades'>
    ) => void
    updateSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objectiveId: string,
        updates: Omit<SpecificObjective, 'id' | 'actividades'>
    ) => void
    deleteSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objectiveId: string
    ) => void

    // Activity actions
    addActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activity: Omit<Activity, 'id' | 'dynamicFields' | 'subprogramas' | 'comentarios'> &
            Partial<Pick<Activity, 'dynamicFields' | 'subprogramas' | 'comentarios' | 'ejecucionInfo'>>
    ) => void
    updateActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        updates: Omit<Activity, 'id' | 'dynamicFields' | 'subprogramas' | 'comentarios'> &
            Partial<Pick<Activity, 'dynamicFields' | 'subprogramas' | 'comentarios' | 'ejecucionInfo'>>
    ) => void
    deleteActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string
    ) => void

    // Dynamic Fields actions
    addDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldName: string
    ) => void
    deleteDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldId: string
    ) => void
    updateDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldId: string,
        fieldName: string
    ) => void

    // Subprogram actions
    addSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldValues: DynamicFieldValue[],
        meses: number[]
    ) => void
    updateSubprogramaMesEstado: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        mes: number,
        estado: SubprogramMonthStatus,
        ejecucionInfo?: ExecutionInfo
    ) => void
    updateSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        updates: Partial<Pick<Subprograma, 'fieldValues' | 'meses' | 'mesEstados' | 'estado'>>
    ) => void
    deleteSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string
    ) => void

    // Comment actions
    addCommentToActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        autor: string,
        contenido: string
    ) => void
    addCommentToSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        autor: string,
        contenido: string
    ) => void
}

// Sample data
const initialPrograms: AnnualProgram[] = [
    {
        id: generateId(),
        anio: 2024,
        estado: 'en_proceso',
        presupuestoTotal: 150000,
        objetivosGenerales: [
            {
                id: generateId(),
                titulo: 'Reducir accidentes laborales',
                objetivosEspecificos: [
                    {
                        id: generateId(),
                        titulo: 'Implementar programa de capacitaciones',
                        meta: 'Capacitar al 100% del personal',
                        indicador: '% de personal capacitado',
                        presupuesto: 25000,
                        recursos: 'Materiales didácticos, instructores',
                        actividades: [
                            {
                                id: generateId(),
                                descripcion: 'Capacitación en uso de EPP',
                                responsable: 'Juan Pérez',
                                medioVerificacion: 'Lista de asistencia',
                                ejecucionAnual: [1, 2, 3],
                                fechaVerificacion: '2024-03-31',
                                estado: 'Realizada',
                                dynamicFields: [],
                                subprogramas: [],
                                comentarios: [],
                            },
                            {
                                id: generateId(),
                                descripcion: 'Taller de primeros auxilios',
                                responsable: 'María García',
                                medioVerificacion: 'Certificados emitidos',
                                ejecucionAnual: [4, 5, 6],
                                fechaVerificacion: '2024-06-30',
                                estado: 'En proceso',
                                dynamicFields: [],
                                subprogramas: [],
                                comentarios: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: generateId(),
                titulo: 'Mejorar condiciones de trabajo',
                objetivosEspecificos: [
                    {
                        id: generateId(),
                        titulo: 'Evaluación ergonómica de puestos',
                        meta: 'Evaluar el 100% de puestos de trabajo',
                        indicador: 'Número de puestos evaluados',
                        presupuesto: 15000,
                        recursos: 'Especialistas, equipos de medición',
                        actividades: [
                            {
                                id: generateId(),
                                descripcion: 'Inspección de puestos administrativos',
                                responsable: 'Carlos López',
                                medioVerificacion: 'Informe de inspección',
                                ejecucionAnual: [7, 8],
                                fechaVerificacion: '2024-08-31',
                                estado: 'En proceso',
                                dynamicFields: [],
                                subprogramas: [],
                                comentarios: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: generateId(),
        anio: 2025,
        estado: 'pendiente',
        presupuestoTotal: 180000,
        objetivosGenerales: [],
    },
]

export const useSSTStore = create<SSTStore>((set, get) => ({
    programs: initialPrograms,
    selectedProgramId: initialPrograms[0]?.id || null,

    yearExists: (anio: number, excludeId?: string) => {
        const { programs } = get()
        return programs.some((p) => p.anio === anio && p.id !== excludeId)
    },

    addProgram: (anio: number, presupuestoTotal: number) => {
        if (get().yearExists(anio)) {
            return false
        }
        const newProgram: AnnualProgram = {
            id: generateId(),
            anio,
            estado: 'pendiente',
            presupuestoTotal,
            objetivosGenerales: [],
        }
        set((state) => ({
            programs: [...state.programs, newProgram],
            selectedProgramId: newProgram.id,
        }))
        return true
    },

    updateProgram: (id: string, updates: Partial<Pick<AnnualProgram, 'presupuestoTotal'>>) => {
        set((state) => ({
            programs: state.programs.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
    },

    deleteProgram: (id: string) => {
        set((state) => {
            const newPrograms = state.programs.filter((p) => p.id !== id)
            return {
                programs: newPrograms,
                selectedProgramId:
                    state.selectedProgramId === id
                        ? newPrograms[0]?.id || null
                        : state.selectedProgramId,
            }
        })
    },

    updateProgramStatus: (id: string, estado: ProgramStatus) => {
        set((state) => ({
            programs: state.programs.map((p) => (p.id === id ? { ...p, estado } : p)),
        }))
    },

    selectProgram: (id: string | null) => {
        set({ selectedProgramId: id })
    },

    addGeneralObjective: (programId: string, titulo: string) => {
        const newObjective: GeneralObjective = {
            id: generateId(),
            titulo,
            objetivosEspecificos: [],
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? { ...p, objetivosGenerales: [...p.objetivosGenerales, newObjective] }
                    : p
            ),
        }))
    },

    updateGeneralObjective: (programId: string, objectiveId: string, titulo: string) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((o) =>
                            o.id === objectiveId ? { ...o, titulo } : o
                        ),
                    }
                    : p
            ),
        }))
    },

    deleteGeneralObjective: (programId: string, objectiveId: string) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.filter((o) => o.id !== objectiveId),
                    }
                    : p
            ),
        }))
    },

    addSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objective: Omit<SpecificObjective, 'id' | 'actividades'>
    ) => {
        const newObjective: SpecificObjective = {
            ...objective,
            id: generateId(),
            actividades: [],
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? { ...go, objetivosEspecificos: [...go.objetivosEspecificos, newObjective] }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    updateSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objectiveId: string,
        updates: Omit<SpecificObjective, 'id' | 'actividades'>
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === objectiveId ? { ...so, ...updates } : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    deleteSpecificObjective: (
        programId: string,
        generalObjectiveId: string,
        objectiveId: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.filter(
                                        (so) => so.id !== objectiveId
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    addActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activity: Omit<Activity, 'id' | 'dynamicFields' | 'subprogramas' | 'comentarios'> &
            Partial<Pick<Activity, 'dynamicFields' | 'subprogramas' | 'comentarios' | 'ejecucionInfo'>>
    ) => {
        const newActivity: Activity = {
            id: generateId(),
            descripcion: activity.descripcion,
            responsable: activity.responsable,
            medioVerificacion: activity.medioVerificacion,
            ejecucionAnual: activity.ejecucionAnual,
            fechaVerificacion: activity.fechaVerificacion,
            estado: activity.estado,
            dynamicFields: activity.dynamicFields ?? [],
            subprogramas: activity.subprogramas ?? [],
            comentarios: activity.comentarios ?? [],
            ejecucionInfo: activity.ejecucionInfo,
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? { ...so, actividades: [...so.actividades, newActivity] }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    updateActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        updates: Omit<Activity, 'id' | 'dynamicFields' | 'subprogramas' | 'comentarios'> &
            Partial<Pick<Activity, 'dynamicFields' | 'subprogramas' | 'comentarios' | 'ejecucionInfo'>>
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId ? { ...a, ...updates } : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    deleteActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.filter((a) => a.id !== activityId),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    addDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldName: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? (() => {
                                                            const newFieldId = generateId()
                                                            return {
                                                                ...a,
                                                                dynamicFields: [
                                                                    ...a.dynamicFields,
                                                                    {
                                                                        id: newFieldId,
                                                                        nombre: fieldName,
                                                                        orden: a.dynamicFields.length,
                                                                    },
                                                                ],
                                                                subprogramas: a.subprogramas.map((sp) => ({
                                                                    ...sp,
                                                                    fieldValues: [
                                                                        ...sp.fieldValues,
                                                                        { fieldId: newFieldId, valor: '' },
                                                                    ],
                                                                })),
                                                            }
                                                        })()
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    deleteDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldId: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            dynamicFields: a.dynamicFields.filter(
                                                                (f) => f.id !== fieldId
                                                            ),
                                                            subprogramas: a.subprogramas.map((sp) => ({
                                                                ...sp,
                                                                fieldValues: sp.fieldValues.filter((fv) => fv.fieldId !== fieldId),
                                                            })),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    updateDynamicField: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldId: string,
        fieldName: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            dynamicFields: a.dynamicFields.map((field) =>
                                                                field.id === fieldId
                                                                    ? { ...field, nombre: fieldName }
                                                                    : field
                                                            ),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    addSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        fieldValues: DynamicFieldValue[],
        meses: number[]
    ) => {
        const mesEstados = defaultMesEstados(meses)
        const newSubprograma: Subprograma = {
            id: generateId(),
            fieldValues,
            meses: [...new Set(meses)].sort((a, b) => a - b),
            mesEstados,
            estado: subprogramOverallFromMesEstados(
                [...new Set(meses)].sort((a, b) => a - b),
                mesEstados
            ),
            comentarios: [],
            createdAt: new Date().toISOString(),
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? { ...a, subprogramas: [...a.subprogramas, newSubprograma] }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    updateSubprogramaMesEstado: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        mes: number,
        estado: SubprogramMonthStatus,
        ejecucionInfo?: ExecutionInfo
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            subprogramas: a.subprogramas.map((sp) => {
                                                                if (sp.id !== subprogramaId) return sp
                                                                const key = String(mes)
                                                                const prevMonth = sp.mesEstados[key] ?? { estado: 'P' }
                                                                const nextMesEstados: Record<string, SubprogramMonthState> = {
                                                                    ...sp.mesEstados,
                                                                    [key]: {
                                                                        estado,
                                                                        ejecucionInfo:
                                                                            estado === 'E'
                                                                                ? ejecucionInfo ?? prevMonth.ejecucionInfo
                                                                                : undefined,
                                                                    },
                                                                }
                                                                const mesesOrdenados = [...new Set(sp.meses)].sort(
                                                                    (x, y) => x - y
                                                                )
                                                                return {
                                                                    ...sp,
                                                                    mesEstados: nextMesEstados,
                                                                    estado: subprogramOverallFromMesEstados(
                                                                        mesesOrdenados,
                                                                        nextMesEstados
                                                                    ),
                                                                }
                                                            }),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    updateSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        updates: Partial<Pick<Subprograma, 'fieldValues' | 'meses' | 'mesEstados' | 'estado'>>
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            subprogramas: a.subprogramas.map((sp) => {
                                                                if (sp.id !== subprogramaId) return sp
                                                                const nextMeses = updates.meses ?? sp.meses
                                                                const mergedMesEstados = mergeMesEstadosForMeses(
                                                                    nextMeses,
                                                                    updates.mesEstados ?? sp.mesEstados
                                                                )
                                                                const mesesSorted = [...new Set(nextMeses)].sort(
                                                                    (x, y) => x - y
                                                                )
                                                                return {
                                                                    ...sp,
                                                                    ...updates,
                                                                    meses: mesesSorted,
                                                                    mesEstados: mergedMesEstados,
                                                                    estado: subprogramOverallFromMesEstados(
                                                                        mesesSorted,
                                                                        mergedMesEstados
                                                                    ),
                                                                }
                                                            }),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    deleteSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string
    ) => {
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            subprogramas: a.subprogramas.filter(
                                                                (sp) => sp.id !== subprogramaId
                                                            ),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    addCommentToActivity: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        autor: string,
        contenido: string
    ) => {
        const newComment: Comentario = {
            id: generateId(),
            autor,
            contenido,
            createdAt: new Date().toISOString(),
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? { ...a, comentarios: [...a.comentarios, newComment] }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },

    addCommentToSubprograma: (
        programId: string,
        generalObjectiveId: string,
        specificObjectiveId: string,
        activityId: string,
        subprogramaId: string,
        autor: string,
        contenido: string
    ) => {
        const newComment: Comentario = {
            id: generateId(),
            autor,
            contenido,
            createdAt: new Date().toISOString(),
        }
        set((state) => ({
            programs: state.programs.map((p) =>
                p.id === programId
                    ? {
                        ...p,
                        objetivosGenerales: p.objetivosGenerales.map((go) =>
                            go.id === generalObjectiveId
                                ? {
                                    ...go,
                                    objetivosEspecificos: go.objetivosEspecificos.map((so) =>
                                        so.id === specificObjectiveId
                                            ? {
                                                ...so,
                                                actividades: so.actividades.map((a) =>
                                                    a.id === activityId
                                                        ? {
                                                            ...a,
                                                            subprogramas: a.subprogramas.map((sp) =>
                                                                sp.id === subprogramaId
                                                                    ? { ...sp, comentarios: [...sp.comentarios, newComment] }
                                                                    : sp
                                                            ),
                                                        }
                                                        : a
                                                ),
                                            }
                                            : so
                                    ),
                                }
                                : go
                        ),
                    }
                    : p
            ),
        }))
    },
}))
