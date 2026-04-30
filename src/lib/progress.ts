import type { Activity, Subprograma, SpecificObjective, GeneralObjective, AnnualProgram } from './types'

const executedMonthsInSubprogram = (sp: Subprograma): number =>
    sp.meses.filter((m) => sp.mesEstados[String(m)]?.estado === 'E').length

const totalMonthsInSubprogram = (sp: Subprograma): number => sp.meses.length

/**
 * Avance de un subprograma: meses ejecutados (E) / meses en los que participa
 */
export const getSubprogramaProgress = (subprograma: Subprograma): number => {
    const total = totalMonthsInSubprogram(subprograma)
    if (total === 0) return 0
    return Math.round((executedMonthsInSubprogram(subprograma) / total) * 100)
}

/**
 * Avance de actividad: suma de meses-ejecutados / suma de meses programados en todos los subprogramas
 */
export const getActivityProgress = (activity: Activity): number => {
    if (activity.subprogramas.length === 0) return 0

    const totalMeses = activity.subprogramas.reduce((sum, sp) => sum + totalMonthsInSubprogram(sp), 0)
    if (totalMeses === 0) return 0
    const ejecutados = activity.subprogramas.reduce((sum, sp) => sum + executedMonthsInSubprogram(sp), 0)

    return Math.round((ejecutados / totalMeses) * 100)
}

/**
 * Puede marcarse Realizada si cada mes de cada subprograma está Ejecutado (E)
 */
export const canActivityBeCompleted = (activity: Activity): boolean => {
    if (activity.subprogramas.length === 0) return true
    return activity.subprogramas.every((sp) => {
        if (sp.meses.length === 0) return false
        return sp.meses.every((m) => sp.mesEstados[String(m)]?.estado === 'E')
    })
}

/**
 * Calcula el porcentaje de cumplimiento de un objetivo específico
 * Promedio de todas sus actividades
 */
export const getSpecificObjectiveProgress = (specificObjective: SpecificObjective): number => {
    if (specificObjective.actividades.length === 0) return 0

    const totalProgress = specificObjective.actividades.reduce(
        (sum, activity) => sum + getActivityProgress(activity),
        0
    )

    return Math.round(totalProgress / specificObjective.actividades.length)
}

/**
 * Calcula el porcentaje de cumplimiento de un objetivo general
 * Promedio de todos sus objetivos específicos
 */
export const getGeneralObjectiveProgress = (generalObjective: GeneralObjective): number => {
    if (generalObjective.objetivosEspecificos.length === 0) return 0

    const totalProgress = generalObjective.objetivosEspecificos.reduce(
        (sum, specificObj) => sum + getSpecificObjectiveProgress(specificObj),
        0
    )

    return Math.round(totalProgress / generalObjective.objetivosEspecificos.length)
}

/**
 * Calcula el porcentaje de cumplimiento general del programa
 * Promedio de todos los objetivos generales
 */
export const getProgramProgress = (program: AnnualProgram): number => {
    if (program.objetivosGenerales.length === 0) return 0

    const totalProgress = program.objetivosGenerales.reduce(
        (sum, generalObj) => sum + getGeneralObjectiveProgress(generalObj),
        0
    )

    return Math.round(totalProgress / program.objetivosGenerales.length)
}

/**
 * Obtiene el estado de una actividad basado en el progreso de sus subprogramas
 * - Si el progreso es 0%, el estado es "pendiente"
 * - Si el progreso es 100%, el estado es "realizado"
 * - Otro caso, el estado es "en_proceso"
 */
export const getActivityStatusFromProgress = (activity: Activity): 'pendiente' | 'en_proceso' | 'realizado' => {
    if (activity.estado === 'Realizada') return 'realizado'
    const progress = getActivityProgress(activity)
    if (progress === 0) return 'pendiente'
    return 'en_proceso'
}

/**
 * Calcula el resumen de estado de un programa
 * Retorna: { total: number, completed: number, inProgress: number, pending: number }
 */
export const getProgramStatusSummary = (program: AnnualProgram) => {
    let total = 0
    let completed = 0
    let inProgress = 0
    let pending = 0

    program.objetivosGenerales.forEach((generalObj) => {
        generalObj.objetivosEspecificos.forEach((specificObj) => {
            specificObj.actividades.forEach((activity) => {
                total++
                const status = getActivityStatusFromProgress(activity)
                if (status === 'realizado') completed++
                else if (status === 'en_proceso') inProgress++
                else pending++
            })
        })
    })

    return { total, completed, inProgress, pending }
}

export const canProgramBeCompleted = (program: AnnualProgram): boolean => {
    const activities = program.objetivosGenerales.flatMap((generalObj) =>
        generalObj.objetivosEspecificos.flatMap((specificObj) => specificObj.actividades)
    )

    if (activities.length === 0) return false
    return activities.every((activity) => canActivityBeCompleted(activity))
}
