import { EntityCollection } from "@firecms/types";

// -----------------------------------------------------------------------------
// Colección de Clientes
// -----------------------------------------------------------------------------

export const clientesCollection: EntityCollection = {
    name: "Clientes",
    singularName: "Cliente",
    slug: "clientes",
    path: "clientes",
    icon: "Person",
    description: "Información de los clientes del servicio de alquiler",
    textSearchEnabled: true,
    properties: {
        nombre: {
            name: "Nombre",
            dataType: "string",
            validation: { required: true }
        },
        apellido: {
            name: "Apellido",
            dataType: "string",
            validation: { required: true }
        },
        email: {
            name: "Email",
            dataType: "string",
            email: true,
            validation: {
                required: true,
            }
        },
        telefono: {
            name: "Teléfono",
            dataType: "string"
        },
        direccion: {
            name: "Dirección",
            dataType: "string"
        },
        ciudad: {
            name: "Ciudad",
            dataType: "string"
        },
        pais: {
            name: "País",
            dataType: "string"
        },
        fecha_registro: {
            name: "Fecha de Registro",
            dataType: "date",
            autoValue: "on_create"
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
    path: "implementos",
    icon: "Extension",
    description: "Inventario de todos los implementos y accesorios para la maquinaria.",
    properties: {
        nombre: {
            name: "Nombre del Implemento",
            dataType: "string",
            validation: { required: true }
        },
        stock_total: {
            name: "Stock Total",
            dataType: "number",
            validation: {
                integer: true,
                min: 0
            }
        },
        stock_alquilado: {
            name: "Stock Alquilado",
            dataType: "number",
            validation: {
                integer: true,
                min: 0
            }
        },
        stock_libre: {
            name: "Stock Libre",
            dataType: "number",
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
    carretillas_elevadoras: "CARRETILLAS ELEVADORAS",
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

const alquileresSubcollection: EntityCollection = {
    name: "Alquileres",
    singularName: "Alquiler",
    slug: "alquileres",
    path: "alquileres",
    icon: "CalendarToday",
    description: "Historial completo de alquileres de esta máquina",
    properties: {
        cliente_referencia: {
            name: "Cliente",
            dataType: "reference",
            path: "clientes",
            validation: { required: true },
            previewProperties: ["nombre", "apellido"]
        },
        tipo_alquiler: {
            name: "Tipo de Alquiler",
            dataType: "string",
            enum: tiposAlquiler,
            validation: { required: true }
        },
        precio_por_dia: {
            name: "Precio por Día",
            dataType: "number",
            validation: { required: true }
        },
        fecha_salida: {
            name: "Fecha de Salida",
            dataType: "date",
            validation: { required: true }
        },
        fecha_devolucion_prevista: {
            name: "Fecha Devolución Prevista",
            dataType: "date"
        },
        fecha_devolucion_real: {
            name: "Fecha Devolución Real",
            dataType: "date"
        },
        situacion_obra: {
            name: "Situación / Obra",
            dataType: "string",
            validation: { required: true }
        },
        horas_salida: {
            name: "Horas al Salir",
            dataType: "number"
        },
        horas_devolucion: {
            name: "Horas al Devolver",
            dataType: "number"
        },
        implementos_incluidos: {
            name: "Implementos Incluidos",
            dataType: "string",
            description: "Lista de implementos (ej: PINZAS + ARIDO)"
        },
        activo: {
            name: "Alquiler Activo",
            dataType: "boolean",
            defaultValue: true
        },
        notas: {
            name: "Notas del Alquiler",
            dataType: "string",
            multiline: true
        },
        total_facturado: {
            name: "Total Facturado",
            dataType: "number"
        },
        estado_pago: {
            name: "Estado de Pago",
            dataType: "string",
            enum: {
                pendiente: "Pendiente",
                pagado: "Pagado",
                parcial: "Pago Parcial"
            }
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Mantenimiento
// -----------------------------------------------------------------------------

const mantenimientoSubcollection: EntityCollection = {
    name: "Mantenimiento",
    singularName: "Registro Mantenimiento",
    slug: "mantenimiento",
    path: "mantenimiento",
    icon: "Build",
    description: "Historial completo de mantenimiento de esta máquina",
    properties: {
        fecha: {
            name: "Fecha del Mantenimiento",
            dataType: "date",
            validation: { required: true }
        },
        tipo_mantenimiento: {
            name: "Tipo de Mantenimiento",
            dataType: "string",
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
            dataType: "number",
            description: "Horas que tenía la máquina al momento del mantenimiento"
        },
        descripcion: {
            name: "Descripción del Trabajo",
            dataType: "string",
            multiline: true,
            validation: { required: true }
        },
        tecnico: {
            name: "Técnico Responsable",
            dataType: "string"
        },
        taller_externo: {
            name: "Taller Externo",
            dataType: "string",
            description: "Si se realizó en taller externo"
        },
        costo: {
            name: "Costo del Mantenimiento",
            dataType: "number"
        },
        proxima_revision: {
            name: "Próxima Revisión",
            dataType: "date"
        },
        proxima_revision_horas: {
            name: "Próxima Revisión (Horas)",
            dataType: "number"
        },
        repuestos_utilizados: {
            name: "Repuestos Utilizados",
            dataType: "string",
            multiline: true
        },
        tiempo_parada: {
            name: "Tiempo de Parada (días)",
            dataType: "number",
            description: "Días que estuvo parada la máquina"
        },
        urgente: {
            name: "Mantenimiento Urgente",
            dataType: "boolean",
            defaultValue: false
        },
        completado: {
            name: "Trabajo Completado",
            dataType: "boolean",
            defaultValue: true
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Horas
// -----------------------------------------------------------------------------

const horasSubcollection: EntityCollection = {
    name: "Lecturas Horas",
    singularName: "Lectura Horas",
    slug: "horas",
    path: "horas",
    icon: "Schedule",
    description: "Registro histórico de lecturas de horas de la máquina",
    properties: {
        fecha: {
            name: "Fecha de Lectura",
            dataType: "date",
            validation: { required: true }
        },
        horas_totales: {
            name: "Horas Totales",
            dataType: "number",
            validation: { required: true }
        },
        horas_periodo: {
            name: "Horas del Período",
            dataType: "number",
            description: "Horas trabajadas desde la última lectura"
        },
        motivo_lectura: {
            name: "Motivo de la Lectura",
            dataType: "string",
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
            dataType: "string"
        },
        notas: {
            name: "Notas",
            dataType: "string"
        },
        alquiler_relacionado: {
            name: "ID Alquiler Relacionado",
            dataType: "string",
            description: "Si está relacionado con un alquiler específico"
        }
    }
};

// -----------------------------------------------------------------------------
// Subcollección de Incidencias
// -----------------------------------------------------------------------------

const incidenciasSubcollection: EntityCollection = {
    name: "Incidencias",
    singularName: "Incidencia",
    slug: "incidencias",
    path: "incidencias",
    icon: "Warning",
    description: "Registro de problemas, averías y observaciones importantes",
    properties: {
        fecha: {
            name: "Fecha de la Incidencia",
            dataType: "date",
            validation: { required: true }
        },
        tipo_incidencia: {
            name: "Tipo de Incidencia",
            dataType: "string",
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
            dataType: "string",
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
            dataType: "string",
            multiline: true,
            validation: { required: true }
        },
        reportado_por: {
            name: "Reportado por",
            dataType: "string"
        },
        cliente_relacionado: {
            name: "Cliente Relacionado",
            dataType: "reference",
            path: "clientes"
        },
        alquiler_relacionado: {
            name: "ID Alquiler Relacionado",
            dataType: "string"
        },
        solucion: {
            name: "Solución Aplicada",
            dataType: "string",
            multiline: true
        },
        fecha_solucion: {
            name: "Fecha de Solución",
            dataType: "date"
        },
        costo_reparacion: {
            name: "Costo de Reparación",
            dataType: "number"
        },
        responsable_cliente: {
            name: "Responsabilidad del Cliente",
            dataType: "boolean",
            description: "Si la incidencia es responsabilidad del cliente"
        },
        resuelto: {
            name: "Incidencia Resuelta",
            dataType: "boolean",
            defaultValue: false
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
    path: "maquinaria",
    icon: "Construction",
    description: "Catálogo de maquinaria - La información detallada está en las subcollecciones",
    subcollections: [
        alquileresSubcollection,
        mantenimientoSubcollection,
        horasSubcollection,
        incidenciasSubcollection
    ],
    properties: {
        nombre: {
            name: "Nombre / Identificador",
            description: "Ej: Nº 1 - MANITOU MLT 737",
            dataType: "string",
            validation: { required: true }
        },
        imagen: {
            name: "Imagen de la Máquina",
            dataType: "string",
            storage: {
                storagePath: "images",
                acceptedFiles: ["image/*"],
            }
        },
        categoria: {
            name: "Categoría",
            dataType: "string",
            enum: categoriasMaquinaria,
            validation: { required: true }
        },
        modelo: {
            name: "Modelo Completo",
            dataType: "string",
            description: "Modelo completo de la máquina"
        },
        estado_actual: {
            name: "Estado Actual",
            dataType: "string",
            enum: estadosMaquina,
            validation: { required: true }
        },
        notas: {
            name: "Notas Generales",
            dataType: "string",
            multiline: true
        },
        horas_totales: {
            name: "Horas Totales Actuales",
            dataType: "number",
            description: "Última lectura de horas registrada"
        },
        numero_serie: {
            name: "Número de Serie",
            dataType: "string"
        },
        ano_fabricacion: {
            name: "Año de Fabricación",
            dataType: "number"
        },
        fecha_ultima_lectura: {
            name: "Fecha Última Lectura",
            dataType: "date"
        },
        alquiler_activo_id: {
            name: "ID Alquiler Activo",
            dataType: "string",
            description: "ID del alquiler activo en la subcollección"
        },
        proximo_mantenimiento: {
            name: "Próximo Mantenimiento",
            dataType: "date"
        },
        fecha_adquisicion: {
            name: "Fecha de Adquisición",
            dataType: "date"
        },
        precio_compra: {
            name: "Precio de Compra",
            dataType: "number"
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
    path: "control_diario",
    icon: "Today",
    description: "Snapshots diarios del estado de toda la maquinaria - equivalente a las hojas Excel",
    properties: {
        fecha: {
            name: "Fecha",
            dataType: "date",
            validation: { required: true }
        },
        facturacion_total: {
            name: "Facturación Total Diaria",
            dataType: "number"
        },
        facturacion_por_categoria: {
            name: "Facturación por Categoría",
            dataType: "map",
            properties: {
                manipuladoras_telescopicas: {
                    name: "Manipuladoras Telescópicas",
                    dataType: "number"
                },
                plataformas: {
                    name: "Plataformas",
                    dataType: "number"
                },
                excavadoras: {
                    name: "Excavadoras",
                    dataType: "number"
                },
                otros: {
                    name: "Otros",
                    dataType: "number"
                }
            }
        },
        total_maquinas: {
            name: "Total de Máquinas",
            dataType: "number"
        },
        maquinas_alquiladas: {
            name: "Máquinas Alquiladas",
            dataType: "number"
        },
        maquinas_disponibles: {
            name: "Máquinas Disponibles",
            dataType: "number"
        },
        maquinas_mantenimiento: {
            name: "Máquinas en Mantenimiento",
            dataType: "number"
        },
        subcontratas: {
            name: "Subcontratas",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    proveedor: {
                        name: "Proveedor",
                        dataType: "string"
                    },
                    precio: {
                        name: "Precio",
                        dataType: "number"
                    },
                    descripcion: {
                        name: "Descripción",
                        dataType: "string"
                    }
                }
            }
        },
        previsiones: {
            name: "Previsiones",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    maquina_id: {
                        name: "ID Máquina",
                        dataType: "string"
                    },
                    maquina_nombre: {
                        name: "Nombre Máquina",
                        dataType: "string"
                    },
                    tipo_alquiler: {
                        name: "Tipo",
                        dataType: "string"
                    },
                    fecha_prevista: {
                        name: "Fecha Prevista",
                        dataType: "date"
                    },
                    cliente: {
                        name: "Cliente",
                        dataType: "string"
                    },
                    ubicacion: {
                        name: "Ubicación",
                        dataType: "string"
                    }
                }
            }
        },
        notas_generales: {
            name: "Notas Generales del Día",
            dataType: "string",
            multiline: true
        },
        estado_implementos: {
            name: "Estado de Implementos",
            dataType: "array",
            of: {
                dataType: "map",
                properties: {
                    nombre: {
                        name: "Implemento",
                        dataType: "string"
                    },
                    stock_total: {
                        name: "Stock Total",
                        dataType: "number"
                    },
                    alquilados: {
                        name: "Alquilados",
                        dataType: "number"
                    },
                    libres: {
                        name: "Libres",
                        dataType: "number"
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
    controlDiarioCollection
];
