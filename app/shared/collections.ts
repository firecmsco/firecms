import { EntityCollection } from "@firecms/types";

// -----------------------------------------------------------------------------
// Colección de Clientes
// -----------------------------------------------------------------------------

export const clientesCollection: EntityCollection = {
    name: "Clientes",
    singularName: "Cliente",
    slug: "clientes",
    dbPath: "clientes",
    icon: "Person",
    description: "Información de los clientes del servicio de alquiler",
    textSearchEnabled: true,
    properties: {
        nombre: {
            name: "Nombre",
            type: "string",
            validation: { required: true }
        },
        apellido: {
            name: "Apellido",
            type: "string",
            validation: { required: true }
        },
        email: {
            name: "Email",
            type: "string",
            email: true,
            validation: {
                required: true
            }
        },
        telefono: {
            name: "Teléfono",
            type: "string"
        },
        direccion: {
            name: "Dirección",
            type: "string"
        },
        ciudad: {
            name: "Ciudad",
            type: "string"
        },
        pais: {
            name: "País",
            type: "string"
        },
        fecha_registro: {
            name: "Fecha de Registro",
            type: "date",
            autoValue: "on_create"
        }
    },
    relations: {
        alquileres: {
            type: "many",
            target: () => alquileresSubcollection,
            widget: "table",
            collection: {
                name: "Historial de Alquileres",
                singularName: "Alquiler",
                icon: "History",
                previewProperties: ["maquina_referencia", "fecha_salida", "fecha_devolucion_real", "total_facturado", "estado_pago"],
                initialSort: ["fecha_salida", "desc"],
                description: "Todos los alquileres realizados por este cliente",
                permissions: {
                    read: true,
                    create: false,
                    edit: false,
                    delete: false
                }
            }
        },
        incidencias: {
            type: "many",
            target: () => incidenciasSubcollection,
            widget: "table",
            collection: {
                name: "Incidencias",
                singularName: "Incidencia",
                icon: "Warning",
                previewProperties: ["tipo_incidencia", "gravedad", "fecha", "resuelto"]
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Colección de Implementos
// -----------------------------------------------------------------------------

export const implementosCollection: EntityCollection = {
    name: "Implementos",
    singularName: "Implemento",
    slug: "implementos",
    dbPath: "implementos",
    icon: "Extension",
    description: "Inventario de todos los implementos y accesorios para la maquinaria.",
    properties: {
        nombre: {
            name: "Nombre del Implemento",
            type: "string",
            validation: { required: true }
        },
        stock_total: {
            name: "Stock Total",
            type: "number",
            validation: {
                integer: true,
                min: 0
            }
        },
        stock_alquilado: {
            name: "Stock Alquilado",
            type: "number",
            validation: {
                integer: true,
                min: 0
            }
        },
        stock_libre: {
            name: "Stock Libre",
            type: "number",
            validation: {
                integer: true,
                min: 0
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const categoriasMaquinaria = {
    manipuladoras_telescopicas: "MANIPULADORAS TELESCÓPICAS",
    excavadoras: "EXCAVADORAS DE CADENAS Y RUEDAS",
    minicargadora_ruedas: "MINICARGADORA DE RUEDAS",
    dumpers_obra: "DUMPERS DE OBRA",
    grupos_electrogenos: "GRUPOS ELECTROGENOS",
    cortadoras: "CORTADORAS",
    martillos_picadores: "MARTILLOS PICADORES",
    maquinaria_jardineria: "MAQUINARIA DE JARDINERIA",
    compresor_aire: "COMPRESOR DE AIRE",
    plataformas_articuladas: "PLATAFORMAS ARTICULADAS",
    plataformas_articuladas_electricas: "PLATAFORMAS ARTICULADAS ELECTRICAS",
    plataformas_telescopicas: "PLATAFORMAS TELESCOPICAS",
    plataformas_tijera: "PLATAFORMAS TIJERA",
    plataformas_tijera_electricas: "PLATAFORMAS TIJERA ELECTRICAS",
    plataformas_unipersonales_electricas: "PLATAFORMAS UNIPERSONALES ELECTRICAS",
    plataformas_articulada_cadena: "PLATAFORMAS ARTICULADA CADENA",
    rodillos: "RODILLOS",
    carretillas_elevadoras: "CARRETILLAS ELEVADORAS"
};

const estadosMaquina = {
    stock: "Stock",
    alquilado: "Alquilado",
    mantenimiento: "Mantenimiento",
    parada: "Parada",
    libre: "Libre"
};

const tiposAlquiler = {
    mensual: "MENSUAL",
    anual: "ANUAL",
    diario: "DIARIO"
};

// -----------------------------------------------------------------------------
// Subcollección de Alquileres
// -----------------------------------------------------------------------------

export const alquileresSubcollection: EntityCollection = {
    name: "Alquileres",
    singularName: "Alquiler",
    slug: "alquileres",
    dbPath: "alquileres",
    icon: "CalendarToday",
    description: "Historial completo de alquileres de esta máquina",
    properties: {
        maquina_referencia: {
            name: "Máquina",
            type: "reference",
            path: "maquinaria",
            validation: { required: true },
            previewProperties: ["nombre", "estado_actual"]
        },
        cliente_referencia: {
            name: "Cliente",
            type: "reference",
            path: "clientes",
            validation: { required: true },
            previewProperties: ["nombre", "apellido"]
        },
        tipo_alquiler: {
            name: "Tipo de Alquiler",
            type: "string",
            enum: tiposAlquiler,
            validation: { required: true }
        },
        precio_por_dia: {
            name: "Precio por Día",
            type: "number",
            validation: { required: true }
        },
        fecha_salida: {
            name: "Fecha de Salida",
            type: "date",
            validation: { required: true }
        },
        fecha_devolucion_prevista: {
            name: "Fecha Devolución Prevista",
            type: "date"
        },
        fecha_devolucion_real: {
            name: "Fecha Devolución Real",
            type: "date"
        },
        situacion_obra: {
            name: "Situación / Obra",
            type: "string",
            validation: { required: true }
        },
        horas_salida: {
            name: "Horas al Salir",
            type: "number"
        },
        horas_devolucion: {
            name: "Horas al Devolver",
            type: "number"
        },
        implementos_incluidos: {
            name: "Implementos Incluidos",
            type: "string",
            description: "Lista de implementos (ej: PINZAS + ARIDO)"
        },
        activo: {
            name: "Alquiler Activo",
            type: "boolean",
            defaultValue: true
        },
        notas: {
            name: "Notas del Alquiler",
            type: "string",
            multiline: true
        },
        total_facturado: {
            name: "Total Facturado",
            type: "number"
        },
        estado_pago: {
            name: "Estado de Pago",
            type: "string",
            enum: {
                pendiente: "Pendiente",
                pagado: "Pagado",
                parcial: "Pago Parcial"
            }
        }
    },
    relations: {
        cliente: {
            type: "one",
            target: () => clientesCollection,
            sourceFields: ["cliente_referencia"],
            targetFields: ["id"],
            widget: "select",
            collection: {
                name: "Cliente",
            }
        },
        maquina: {
            type: "one",
            target: () => maquinariaCollection,
            sourceFields: ["maquina_referencia"],
            targetFields: ["id"],
            widget: "select",
            collection: {
                name: "Máquina",
            }
        },
        horas: {
            type: "many",
            target: () => horasSubcollection,
            widget: "table",
            collection: {
                name: "Lecturas Horas",
                singularName: "Lectura Horas",
                icon: "Schedule",
                previewProperties: ["fecha", "horas_totales", "horas_periodo"]
            }
        },
        incidencias: {
            type: "many",
            target: () => incidenciasSubcollection,
            widget: "table",
            collection: {
                name: "Incidencias del Alquiler",
                singularName: "Incidencia",
                icon: "Warning",
                previewProperties: ["tipo_incidencia", "gravedad", "fecha", "resuelto"]
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Mantenimiento
// -----------------------------------------------------------------------------

export const mantenimientoSubcollection: EntityCollection = {
    name: "Mantenimiento",
    singularName: "Registro Mantenimiento",
    slug: "mantenimiento",
    dbPath: "mantenimiento",
    icon: "Build",
    description: "Historial completo de mantenimiento de esta máquina",
    properties: {
        fecha: {
            name: "Fecha del Mantenimiento",
            type: "date",
            validation: { required: true }
        },
        tipo_mantenimiento: {
            name: "Tipo de Mantenimiento",
            type: "string",
            enum: {
                preventivo: "Preventivo",
                correctivo: "Correctivo",
                cambio_aceite: "Cambio de Aceite",
                cambio_filtros: "Cambio de Filtros",
                revision_general: "Revisión General",
                reparacion: "Reparación"
            },
            validation: { required: true }
        },
        horas_maquina: {
            name: "Horas de la Máquina",
            type: "number",
            description: "Horas que tenía la máquina al momento del mantenimiento"
        },
        descripcion: {
            name: "Descripción del Trabajo",
            type: "string",
            multiline: true,
            validation: { required: true }
        },
        tecnico: {
            name: "Técnico Responsable",
            type: "string"
        },
        taller_externo: {
            name: "Taller Externo",
            type: "string",
            description: "Si se realizó en taller externo"
        },
        costo: {
            name: "Costo del Mantenimiento",
            type: "number"
        },
        proxima_revision: {
            name: "Próxima Revisión",
            type: "date"
        },
        proxima_revision_horas: {
            name: "Próxima Revisión (Horas)",
            type: "number"
        },
        repuestos_utilizados: {
            name: "Repuestos Utilizados",
            type: "string",
            multiline: true
        },
        tiempo_parada: {
            name: "Tiempo de Parada (días)",
            type: "number",
            description: "Días que estuvo parada la máquina"
        },
        urgente: {
            name: "Mantenimiento Urgente",
            type: "boolean",
            defaultValue: false
        },
        completado: {
            name: "Trabajo Completado",
            type: "boolean",
            defaultValue: true
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Horas
// -----------------------------------------------------------------------------

export const horasSubcollection: EntityCollection<any> = {
    name: "Lecturas Horas",
    singularName: "Lectura Horas",
    slug: "horas",
    dbPath: "horas",
    icon: "Schedule",
    description: "Registro histórico de lecturas de horas de la máquina",
    properties: {
        fecha: {
            name: "Fecha de Lectura",
            type: "date",
            validation: { required: true }
        },
        horas_totales: {
            name: "Horas Totales",
            type: "number",
            validation: { required: true }
        },
        horas_periodo: {
            name: "Horas del Período",
            type: "number",
            description: "Horas trabajadas desde la última lectura"
        },
        motivo_lectura: {
            name: "Motivo de la Lectura",
            type: "string",
            enum: {
                salida_alquiler: "Salida de Alquiler",
                devolucion_alquiler: "Devolución de Alquiler",
                mantenimiento: "Mantenimiento",
                control_rutinario: "Control Rutinario",
                fin_mes: "Fin de Mes"
            }
        },
        operador: {
            name: "Operador/Responsable",
            type: "string"
        },
        notas: {
            name: "Notas",
            type: "string"
        },
        alquiler_relacionado: {
            name: "ID Alquiler Relacionado",
            type: "reference",
            path: "alquileres",
            description: "Si está relacionado con un alquiler específico"
        }
    },
    relations: {
        alquiler: {
            type: "one",
            target: () => alquileresSubcollection,
            sourceFields: ["alquiler_relacionado"],
            targetFields: ["id"],
            widget: "select",
            collection: {
                name: "Alquiler Relacionado",
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Incidencias
// -----------------------------------------------------------------------------

export const incidenciasSubcollection: EntityCollection = {
    name: "Incidencias",
    singularName: "Incidencia",
    slug: "incidencias",
    dbPath: "incidencias",
    icon: "Warning",
    description: "Registro de problemas, averías y observaciones importantes",
    properties: {
        fecha: {
            name: "Fecha de la Incidencia",
            type: "date",
            validation: { required: true }
        },
        tipo_incidencia: {
            name: "Tipo de Incidencia",
            type: "string",
            enum: {
                averia: "Avería",
                accidente: "Accidente",
                uso_indebido: "Uso Indebido",
                observacion: "Observación",
                fallo_mecanico: "Fallo Mecánico",
                fallo_hidraulico: "Fallo Hidráulico",
                fallo_electrico: "Fallo Eléctrico"
            },
            validation: { required: true }
        },
        gravedad: {
            name: "Gravedad",
            type: "string",
            enum: {
                baja: "Baja",
                media: "Media",
                alta: "Alta",
                critica: "Crítica"
            },
            validation: { required: true }
        },
        descripcion: {
            name: "Descripción de la Incidencia",
            type: "string",
            multiline: true,
            validation: { required: true }
        },
        reportado_por: {
            name: "Reportado por",
            type: "string"
        },
        cliente_relacionado: {
            name: "Cliente Relacionado",
            type: "reference",
            path: "clientes"
        },
        alquiler_relacionado: {
            name: "ID Alquiler Relacionado",
            type: "reference",
            path: "alquileres"
        },
        solucion: {
            name: "Solución Aplicada",
            type: "string",
            multiline: true
        },
        fecha_solucion: {
            name: "Fecha de Solución",
            type: "date"
        },
        costo_reparacion: {
            name: "Costo de Reparación",
            type: "number"
        },
        responsable_cliente: {
            name: "Responsabilidad del Cliente",
            type: "boolean",
            description: "Si la incidencia es responsabilidad del cliente"
        },
        resuelto: {
            name: "Incidencia Resuelta",
            type: "boolean",
            defaultValue: false
        }
    },
    relations: {
        cliente: {
            type: "one",
            target: () => clientesCollection,
            sourceFields: ["cliente_relacionado"],
            targetFields: ["id"],
            widget: "select",
            collection: {
                name: "Cliente Relacionado",
            }
        },
        alquiler: {
            type: "one",
            target: () => alquileresSubcollection,
            sourceFields: ["alquiler_relacionado"],
            targetFields: ["id"],
            widget: "select",
            collection: {
                name: "Alquiler Relacionado",
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Colección Principal de Maquinaria
// -----------------------------------------------------------------------------

export const maquinariaCollection: EntityCollection = {
    name: "Maquinaria",
    singularName: "Máquina",
    slug: "maquinaria",
    dbPath: "maquinaria",
    icon: "Construction",
    properties: {
        nombre: {
            name: "Nombre / Identificador",
            description: "Ej: Nº 1 - MANITOU MLT 737",
            type: "string",
            validation: { required: true }
        },
        imagen: {
            name: "Imagen de la Máquina",
            type: "string",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"]
            }
        },
        categoria: {
            name: "Categoría",
            type: "string",
            enum: categoriasMaquinaria,
            validation: { required: true }
        },
        modelo: {
            name: "Modelo Completo",
            type: "string",
            description: "Modelo completo de la máquina"
        },
        estado_actual: {
            name: "Estado Actual",
            type: "string",
            enum: estadosMaquina,
            validation: { required: true }
        },
        notas: {
            name: "Notas Generales",
            type: "string",
            multiline: true
        },
        horas_totales: {
            name: "Horas Totales Actuales",
            type: "number",
            description: "Última lectura de horas registrada"
        },
        numero_serie: {
            name: "Número de Serie",
            type: "string"
        },
        ano_fabricacion: {
            name: "Año de Fabricación",
            type: "number"
        },
        fecha_ultima_lectura: {
            name: "Fecha Última Lectura",
            type: "date"
        },
        alquiler_activo_id: {
            name: "ID Alquiler Activo",
            type: "string",
            description: "ID del alquiler activo en la subcollección"
        },
        proximo_mantenimiento: {
            name: "Próximo Mantenimiento",
            type: "date"
        },
        fecha_adquisicion: {
            name: "Fecha de Adquisición",
            type: "date"
        },
        precio_compra: {
            name: "Precio de Compra",
            type: "number"
        }
    },
    relations: {
        alquileres: {
            type: "many",
            target: () => alquileresSubcollection,
            widget: "table",
            collection: {
                name: "Alquileres de la Máquina",
                singularName: "Alquiler",
                icon: "CalendarToday",
                previewProperties: ["cliente_referencia", "fecha_salida", "fecha_devolucion_real", "estado_pago"],
                initialSort: ["fecha_salida", "desc"]
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Colección de Control Diario (Snapshots)
// -----------------------------------------------------------------------------

export const controlDiarioCollection: EntityCollection = {
    name: "Control Diario",
    singularName: "Registro Diario",
    slug: "control_diario",
    dbPath: "control_diario",
    icon: "Today",
    description: "Snapshots diarios del estado de toda la maquinaria - equivalente a las hojas Excel",
    properties: {
        fecha: {
            name: "Fecha",
            type: "date",
            validation: { required: true }
        },
        facturacion_total: {
            name: "Facturación Total Diaria",
            type: "number"
        },
        facturacion_por_categoria: {
            name: "Facturación por Categoría",
            type: "map",
            properties: {
                manipuladoras_telescopicas: {
                    name: "Manipuladoras Telescópicas",
                    type: "number"
                },
                plataformas: {
                    name: "Plataformas",
                    type: "number"
                },
                excavadoras: {
                    name: "Excavadoras",
                    type: "number"
                },
                otros: {
                    name: "Otros",
                    type: "number"
                }
            }
        },
        total_maquinas: {
            name: "Total de Máquinas",
            type: "number"
        },
        maquinas_alquiladas: {
            name: "Máquinas Alquiladas",
            type: "number"
        },
        maquinas_disponibles: {
            name: "Máquinas Disponibles",
            type: "number"
        },
        maquinas_mantenimiento: {
            name: "Máquinas en Mantenimiento",
            type: "number"
        },
        subcontratas: {
            name: "Subcontratas",
            type: "array",
            of: {
                type: "map",
                properties: {
                    proveedor: {
                        name: "Proveedor",
                        type: "string"
                    },
                    precio: {
                        name: "Precio",
                        type: "number"
                    },
                    descripcion: {
                        name: "Descripción",
                        type: "string"
                    }
                }
            }
        },
        previsiones: {
            name: "Previsiones",
            type: "array",
            of: {
                type: "map",
                properties: {
                    maquina_id: {
                        name: "ID Máquina",
                        type: "string"
                    },
                    maquina_nombre: {
                        name: "Nombre Máquina",
                        type: "string"
                    },
                    tipo_alquiler: {
                        name: "Tipo",
                        type: "string"
                    },
                    fecha_prevista: {
                        name: "Fecha Prevista",
                        type: "date"
                    },
                    cliente: {
                        name: "Cliente",
                        type: "string"
                    },
                    ubicacion: {
                        name: "Ubicación",
                        type: "string"
                    }
                }
            }
        },
        notas_generales: {
            name: "Notas Generales del Día",
            type: "string",
            multiline: true
        },
        estado_implementos: {
            name: "Estado de Implementos",
            type: "array",
            of: {
                type: "map",
                properties: {
                    nombre: {
                        name: "Implemento",
                        type: "string"
                    },
                    stock_total: {
                        name: "Stock Total",
                        type: "number"
                    },
                    alquilados: {
                        name: "Alquilados",
                        type: "number"
                    },
                    libres: {
                        name: "Libres",
                        type: "number"
                    }
                }
            }
        }
    }
};

// Export all collections for easy import
export const collections = [
    clientesCollection,
    implementosCollection,
    maquinariaCollection,
    controlDiarioCollection,
    alquileresSubcollection,
    mantenimientoSubcollection,
    horasSubcollection,
    incidenciasSubcollection
];
