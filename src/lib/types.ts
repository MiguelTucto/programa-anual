export type ProgramStatus = 'pendiente' | 'en_proceso' | 'realizado'
export type ActivityStatus = 'En proceso' | 'Realizada'
/** Estado operativo por cada mes en el que participa el subprograma */
export type SubprogramMonthStatus = 'P' | 'E' | 'R' | 'F' | 'C' // P=Programado, E=Ejecutado, R=Postergado, F=Reprogramación Planeada, C=Reprogramación Ejecutada
/** Estado global del subprograma (solo dos valores) */
export type SubprogramOverallStatus = 'En proceso' | 'Realizada'

export interface ExecutionInfo {
    fechaCambio: string
    responsable: string
    comentario: string
    evidenciaUrl?: string
    evidenciaArchivoNombre?: string
}

export interface DynamicField {
    id: string
    nombre: string // ej: "SEDE", "DOCUMENTO", "RESPONSABLE"
    orden: number
}

export interface DynamicFieldValue {
    fieldId: string
    valor: string
}

export interface Comentario {
    id: string
    autor: string
    contenido: string
    createdAt: string
}

export interface SubprogramMonthState {
    estado: SubprogramMonthStatus
    ejecucionInfo?: ExecutionInfo
}

export interface Subprograma {
    id: string
    fieldValues: DynamicFieldValue[]
    /** Resumen: Realizada solo si todos los meses están Ejecutados (E) */
    estado: SubprogramOverallStatus
    meses: number[] // meses 1-12 en los que participa
    /** Estado detallado por mes (claves = número de mes 1-12) */
    mesEstados: Record<string, SubprogramMonthState>
    comentarios: Comentario[]
    createdAt: string
}

export interface Activity {
    id: string
    descripcion: string
    responsable: string
    medioVerificacion: string
    ejecucionAnual: number[] // months 1-12
    fechaVerificacion: string
    estado: ActivityStatus
    dynamicFields: DynamicField[] // Campos dinámicos definidos por usuario
    subprogramas: Subprograma[] // Subprogramas de la actividad
    comentarios: Comentario[] // Comentarios de la actividad
    ejecucionInfo?: ExecutionInfo
}

export interface SpecificObjective {
    id: string
    titulo: string
    meta: string
    indicador: string
    presupuesto: number
    recursos: string
    actividades: Activity[]
}

export interface GeneralObjective {
    id: string
    titulo: string
    objetivosEspecificos: SpecificObjective[]
}

export interface AnnualProgram {
    id: string
    anio: number
    estado: ProgramStatus
    presupuestoTotal: number
    objetivosGenerales: GeneralObjective[]
}

export const MONTHS = [
    { value: 1, label: 'E', fullName: 'Enero' },
    { value: 2, label: 'F', fullName: 'Febrero' },
    { value: 3, label: 'M', fullName: 'Marzo' },
    { value: 4, label: 'A', fullName: 'Abril' },
    { value: 5, label: 'M', fullName: 'Mayo' },
    { value: 6, label: 'J', fullName: 'Junio' },
    { value: 7, label: 'J', fullName: 'Julio' },
    { value: 8, label: 'A', fullName: 'Agosto' },
    { value: 9, label: 'S', fullName: 'Septiembre' },
    { value: 10, label: 'O', fullName: 'Octubre' },
    { value: 11, label: 'N', fullName: 'Noviembre' },
    { value: 12, label: 'D', fullName: 'Diciembre' },
] as const

export const STATUS_LABELS: Record<ProgramStatus, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    realizado: 'Realizado',
}

export const STATUS_COLORS: Record<ProgramStatus, string> = {
    pendiente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    en_proceso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    realizado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}
