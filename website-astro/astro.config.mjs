// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";
import starlight from "@astrojs/starlight";
import mdx from '@astrojs/mdx';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
    site: "https://firecms.co",
    integrations: [
        react({
            experimentalReactChildren: true
        }),
        starlight({
            title: "FireCMS Docs",
            locales: { root: { label: "English", lang: "en" }, es: { label: "Español", lang: "es" }, de: { label: "Deutsch", lang: "de" }, fr: { label: "Français", lang: "fr" }, it: { label: "Italiano", lang: "it" }, pt: { label: "Português", lang: "pt" } },
            customCss: [
                "./src/styles/global.css",
                "./src/styles/starlight.css"
            ],
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/firecmsco/firecms"
                }
            ],
            expressiveCode: {
                themes: ["github-dark"],
                styleOverrides: {
                    borderRadius: "0.5rem",
                    codeFontFamily: "var(--font-mono)",
                    codeFontSize: "0.875rem",
                    codeBackground: "var(--color-surface-900)",
                },
                frames: {
                    showCopyToClipboardButton: true,
                },
                defaultProps: {
                    frame: "none",
                },
            },
            sidebar: [
                {
                    label: "Getting Started", translations: { es: "Primeros pasos", de: "Erste Schritte", fr: "Premiers pas" , it: "Inizia", pt: "Primeiros passos" },
                    slug: "docs/index"
                },
                {
                    label: "☁️ FireCMS Cloud", translations: { es: "☁️ FireCMS Cloud", de: "☁️ FireCMS Cloud", fr: "☁️ FireCMS Cloud", pt: "☁️ FireCMS Cloud" },
                    collapsed: false,
                    items: [
                        {
                            label: "Introduction", translations: { es: "Introducción", de: "Einführung", fr: "Introduction" , it: "Introduzione", pt: "Introdução" },
                            slug: "docs/cloud/index"
                        },
                        {
                            label: "Quickstart", translations: { es: "Inicio rápido", de: "Schnellstart", fr: "Démarrage rapide" , it: "Avvio rapido", pt: "Início rápido" },
                            slug: "docs/cloud/quickstart"
                        },
                        {
                            label: "App Configuration", translations: { es: "Configuración de la aplicación", de: "App-Konfiguration", fr: "Configuration de l'application" , it: "Configurazione dell'app", pt: "Configuração do app" },
                            slug: "docs/cloud/app_config"
                        },
                        {
                            label: "Deployment", translations: { es: "Despliegue", de: "Deployment", fr: "Déploiement" , it: "Deployment", pt: "Deployment" },
                            slug: "docs/cloud/deployment"
                        },
                        {
                            label: "App Check", translations: { es: "App Check", de: "App Check", fr: "App Check" , it: "App Check", pt: "App Check" },
                            slug: "docs/cloud/app_check"
                        },
                        {
                            label: "Creating Service Account", translations: { es: "Creación de cuenta de servicio", de: "Dienstkonto erstellen", fr: "Création du compte de service" , it: "Creazione account di servizio", pt: "Criação de conta de serviço" },
                            slug: "docs/cloud/creating_service_account"
                        },
                        {
                            label: "Migrating from v2", translations: { es: "Migración desde v2", de: "Migration von v2", fr: "Migration depuis v2" , it: "Migrazione da v2", pt: "Migração do v2" },
                            slug: "docs/cloud/migrating_from_v2"
                        },
                        {
                            label: "Migrating from v3.0 to v3.1", translations: { es: "Migración de v3.0 a v3.1", de: "Migration von v3.0 auf v3.1", fr: "Migration de v3.0 à v3.1" , it: "Migrazione da v3.0 a v3.1", pt: "Migração do v3.0 para v3.1" },
                            slug: "docs/cloud/migrating_from_v3_to_v3_1"
                        },
                        {
                            label: "Eject Collections", translations: { es: "Expulsar colecciones", de: "Kollektionen auslagern", fr: "Éjecter les collections" , it: "Espelli collezioni", pt: "Ejetar coleções" },
                            slug: "docs/cloud/eject_collections"
                        },
                    ],
                },
                {
                    label: "Self-hosted", translations: { es: "Self-hosted", de: "Self-Hosted", fr: "Auto-hébergé" , it: "Self-hosted", pt: "Self-hosted" },
                    collapsed: false,
                    items: [
                        {
                            label: "Overview", translations: { es: "Visión general", de: "Übersicht", fr: "Vue d'ensemble" , it: "Panoramica", pt: "Visão geral" },
                            slug: "docs/self"
                        },
                        {
                            label: "Next.js Integration", translations: { es: "Integración con Next.js", de: "Next.js-Integration", fr: "Intégration avec Next.js" , it: "Integrazione Next.js", pt: "Integração Next.js" },
                            slug: "docs/pro/nextjs",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Firestore Rules", translations: { es: "Reglas de Firestore", de: "Firestore-Regeln", fr: "Règles Firestore" , it: "Regole Firestore", pt: "Regras do Firestore" },
                            slug: "docs/pro/firestore_rules",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Sample PRO Project", translations: { es: "Proyecto de prueba PRO", de: "Beispiel PRO-Projekt", fr: "Exemple de projet PRO" , it: "Progetto PRO di esempio", pt: "Projeto PRO de exemplo" },
                            slug: "docs/pro/sample_pro",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Main Components", translations: { es: "Componentes principales", de: "Hauptkomponenten", fr: "Composants principaux" , it: "Componenti principali", pt: "Componentes principais" },
                            slug: "docs/self/main_components"
                        },
                        {
                            label: "Authentication", translations: { es: "Autenticación", de: "Authentifizierung", fr: "Authentification" , it: "Autenticazione", pt: "Autenticação" },
                            slug: "docs/self/auth_self_hosted"
                        },
                        {
                            label: "Styling FireCMS", translations: { es: "Estilizar FireCMS", de: "FireCMS gestalten", fr: "Styliser FireCMS" , it: "Stile di FireCMS", pt: "Estilizando o FireCMS" },
                            slug: "docs/self/styling_firecms"
                        },
                        {
                            label: "Internationalisation (i18n)", translations: { es: "Internacionalización (i18n)", de: "Internationalisierung (i18n)", fr: "Internationalisation (i18n)", pt: "Internacionalização (i18n)" },
                            slug: "docs/self/i18n"
                        },
                        {
                            label: "Deployment",
                            slug: "docs/self/deployment"
                        },
                        {
                            label: "App Check",
                            slug: "docs/pro/app_check"
                        },

                        {
                            label: "MongoDB", translations: { es: "MongoDB", de: "MongoDB", fr: "MongoDB" , it: "MongoDB", pt: "MongoDB" },
                            slug: "docs/self/mongodb"
                        },
                        {
                            label: "Licensing", translations: { es: "Licencias", de: "Lizenzierung", fr: "Licences" , it: "Licenze", pt: "Licenciamento" },
                            slug: "docs/pro/licensing",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "User Management", translations: { es: "Gestión de usuarios", de: "Benutzerverwaltung", fr: "Gestion des utilisateurs" , it: "Gestione utenti", pt: "Gestão de usuários" },
                            slug: "docs/pro/user_management",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Collection Editor", translations: { es: "Editor de colecciones", de: "Kollektions-Editor", fr: "Éditeur de collections" , it: "Editor collezioni", pt: "Editor de coleções" },
                            slug: "docs/pro/collection_editor",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Data Export", translations: { es: "Exportar datos", de: "Datenexport", fr: "Exporter les données" , it: "Esporta dati", pt: "Exportar dados" },
                            slug: "docs/pro/data_export",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Data Import", translations: { es: "Importar datos", de: "Datenimport", fr: "Importer les données" , it: "Importa dati", pt: "Importar dados" },
                            slug: "docs/pro/data_import",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Entity History", translations: { es: "Historial de entidades", de: "Entitätsverlauf", fr: "Historique des entités" , it: "Cronologia entità", pt: "Histórico de entidades" },
                            slug: "docs/pro/entity_history",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Custom Storage", translations: { es: "Almacenamiento personalizado", de: "Benutzerdefinierter Speicher", fr: "Stockage personnalisé" , it: "Archiviazione personalizzata", pt: "Armazenamento personalizado" },
                            slug: "docs/self/custom_storage"
                        },
                        {
                            label: "Controllers", translations: { es: "Controladores", de: "Controller", fr: "Contrôleurs" , it: "Controller", pt: "Controladores" },
                            slug: "docs/self/controllers"
                        },
                        {
                            label: "Security Best Practices", translations: { es: "Mejores prácticas de seguridad", de: "Sicherheits-Best-Practices", fr: "Bonnes pratiques de sécurité", it: "Best practice di sicurezza", pt: "Boas práticas de segurança" },
                            slug: "docs/self/security_best_practices"
                        },
                        {
                            label: "Migrating from v3.0 to v3.1",
                            slug: "docs/self/migrating_from_v3_to_v3_1"
                        },
                        {
                            label: "Migrating from v3 Beta", translations: { es: "Migración desde v3 Beta", de: "Migration von v3 Beta", fr: "Migration depuis v3 Beta" , it: "Migrazione da v3 Beta", pt: "Migração do v3 Beta" },
                            slug: "docs/self/migrating_from_v3_beta"
                        },
                        {
                            label: "Migrating from v2 to v3", translations: { es: "Migración de v2 a v3", de: "Migration von v2 auf v3", fr: "Migration de v2 à v3" , it: "Migrazione da v2 a v3", pt: "Migração do v2 para v3" },
                            slug: "docs/self/migrating_from_v2_to_v3"
                        },
                    ],
                },
                {
                    label: "Collections", translations: { es: "Colecciones", de: "Kollektionen", fr: "Collections" , it: "Collezioni", pt: "Coleções" },
                    collapsed: false,
                    items: [
                        {
                            label: "Collections",
                            slug: "docs/collections/index"
                        },
                        {
                            label: "View Modes", translations: { es: "Modos de vista", de: "Ansichtsmodi", fr: "Modes de vue" , it: "Modalità di visualizzazione", pt: "Modos de visualização" },
                            slug: "docs/collections/view_modes"
                        },
                        {
                            label: "Callbacks", translations: { es: "Callbacks", de: "Callbacks", fr: "Callbacks" , it: "Callback", pt: "Callbacks" },
                            slug: "docs/collections/callbacks"
                        },
                        {
                            label: "Entity Views", translations: { es: "Vistas de entidad", de: "Entitätsansichten", fr: "Vues d'entité" , it: "Viste entità", pt: "Views de entidade" },
                            slug: "docs/collections/entity_views"
                        },
                        {
                            label: "Permissions", translations: { es: "Permisos", de: "Berechtigungen", fr: "Permissions" , it: "Permessi", pt: "Permissões" },
                            slug: "docs/collections/permissions"
                        },
                        {
                            label: "Exporting Data", translations: { es: "Exportación de datos", de: "Daten exportieren", fr: "Export de données" , it: "Esportazione dati", pt: "Exportação de dados" },
                            slug: "docs/collections/exporting_data"
                        },
                        {
                            label: "Additional Columns", translations: { es: "Columnas adicionales", de: "Zusätzliche Spalten", fr: "Colonnes supplémentaires" , it: "Colonne aggiuntive", pt: "Colunas adicionais" },
                            slug: "docs/collections/additional_columns"
                        },
                        {
                            label: "Text Search", translations: { es: "Búsqueda de texto", de: "Textsuche", fr: "Recherche de texte" , it: "Ricerca testuale", pt: "Busca de texto" },
                            slug: "docs/collections/text_search"
                        },
                        {
                            label: "Dynamic Collections", translations: { es: "Colecciones dinámicas", de: "Dynamische Kollektionen", fr: "Collections dynamiques" , it: "Collezioni dinamiche", pt: "Coleções dinâmicas" },
                            slug: "docs/collections/dynamic_collections"
                        },
                        {
                            label: "Collection Actions", translations: { es: "Acciones de colección", de: "Kollektionsaktionen", fr: "Actions de collection" , it: "Azioni collezione", pt: "Ações de coleção" },
                            slug: "docs/collections/collection_actions"
                        },
                        {
                            label: "Collection Groups", translations: { es: "Grupos de colecciones", de: "Kollektionsgruppen", fr: "Groupes de collections" , it: "Gruppi di collezioni", pt: "Grupos de coleções" },
                            slug: "docs/collections/collection_groups"
                        },
                        {
                            label: "Entity Actions", translations: { es: "Acciones de entidad", de: "Entitätsaktionen", fr: "Actions d'entité" , it: "Azioni entità", pt: "Ações de entidade" },
                            slug: "docs/collections/entity_actions"
                        },
                    ],
                },
                {
                    label: "Properties", translations: { es: "Propiedades", de: "Eigenschaften", fr: "Propriétés" , it: "Proprietà", pt: "Propriedades" },
                    collapsed: true,
                    items: [
                        {
                            label: "Properties Introduction", translations: { es: "Introducción a propiedades", de: "Einführung in Eigenschaften", fr: "Introduction aux propriétés" , it: "Introduzione alle proprietà", pt: "Introdução às propriedades" },
                            slug: "docs/properties/index"
                        },
                        {
                            label: "Fields", translations: { es: "Campos", de: "Felder", fr: "Champs" , it: "Campi", pt: "Campos" },
                            collapsed: true,
                            items: [
                                {
                                    label: "Text Fields", translations: { es: "Campos de texto", de: "Textfelder", fr: "Champs de texte" , it: "Campi di testo", pt: "Campos de texto" },
                                    slug: "docs/properties/fields/text_fields"
                                },
                                {
                                    label: "Selects", translations: { es: "Selects", de: "Auswahlen", fr: "Sélecteurs" , it: "Selezioni", pt: "Seleções" },
                                    slug: "docs/properties/fields/selects"
                                },
                                {
                                    label: "File Upload", translations: { es: "Subida de archivos", de: "Datei-Upload", fr: "Téléchargement de fichiers" , it: "Caricamento file", pt: "Upload de arquivo" },
                                    slug: "docs/properties/fields/file_upload"
                                },
                                {
                                    label: "Switch", translations: { es: "Switch", de: "Schalter", fr: "Interrupteur" , it: "Interruttore", pt: "Switch" },
                                    slug: "docs/properties/fields/switch"
                                },
                                {
                                    label: "Date & Time", translations: { es: "Fecha y hora", de: "Datum & Uhrzeit", fr: "Date & heure" , it: "Data e ora", pt: "Data e Hora" },
                                    slug: "docs/properties/fields/date_time"
                                },
                                {
                                    label: "References", translations: { es: "Referencias", de: "Referenzen", fr: "Références" , it: "Riferimenti", pt: "Referências" },
                                    slug: "docs/properties/fields/references"
                                },
                                {
                                    label: "Group", translations: { es: "Grupo", de: "Gruppe", fr: "Groupe" , it: "Gruppo", pt: "Grupo" },
                                    slug: "docs/properties/fields/group"
                                },
                                {
                                    label: "Key Value", translations: { es: "Clave-Valor", de: "Schlüssel-Wert", fr: "Clé-Valeur" , it: "Chiave-Valore", pt: "Chave-Valor" },
                                    slug: "docs/properties/fields/key_value"
                                },
                                {
                                    label: "Repeat", translations: { es: "Repeat", de: "Wiederholen", fr: "Répétition" , it: "Ripeti", pt: "Repeat" },
                                    slug: "docs/properties/fields/repeat"
                                },
                                {
                                    label: "Block", translations: { es: "Block", de: "Block", fr: "Bloc" , it: "Blocco", pt: "Block" },
                                    slug: "docs/properties/fields/block"
                                },
                            ],
                        },
                        {
                            label: "Config", translations: { es: "Configuración", de: "Konfiguration", fr: "Configuration" , it: "Configurazione", pt: "Configuração" },
                            collapsed: true,
                            items: [
                                {
                                    label: "Properties Common", translations: { es: "Propiedades comunes", de: "Gemeinsame Eigenschaften", fr: "Propriétés communes" , it: "Proprietà comuni", pt: "Propriedades comuns" },
                                    slug: "docs/properties/config/properties_common"
                                },
                                {
                                    label: "String", translations: { es: "Cadena de texto (String)", de: "Zeichenkette (String)", fr: "Chaîne de texte (String)" , it: "Stringa (String)", pt: "String" },
                                    slug: "docs/properties/config/string"
                                },
                                {
                                    label: "Number", translations: { es: "Número", de: "Zahl", fr: "Nombre" , it: "Numero", pt: "Número" },
                                    slug: "docs/properties/config/number"
                                },
                                {
                                    label: "Boolean", translations: { es: "Booleano", de: "Boolesch", fr: "Booléen" , it: "Booleano", pt: "Booleano" },
                                    slug: "docs/properties/config/boolean"
                                },
                                {
                                    label: "Reference", translations: { es: "Referencia", de: "Referenz", fr: "Référence" , it: "Riferimento", pt: "Referência" },
                                    slug: "docs/properties/config/reference"
                                },
                                {
                                    label: "Date", translations: { es: "Fecha (Date)", de: "Datum", fr: "Date" , it: "Data", pt: "Data" },
                                    slug: "docs/properties/config/date"
                                },
                                {
                                    label: "Array", translations: { es: "Arreglo (Array)", de: "Array", fr: "Tableau (Array)" , it: "Array", pt: "Array" },
                                    slug: "docs/properties/config/array"
                                },
                                {
                                    label: "Map", translations: { es: "Mapa (Map)", de: "Map", fr: "Carte (Map)" , it: "Mappa (Map)", pt: "Mapa (Map)" },
                                    slug: "docs/properties/config/map"
                                },
                                {
                                    label: "Geopoint", translations: { es: "Geopoint", de: "Geopunkt", fr: "Geopoint" , it: "Punto geografico", pt: "Geopoint" },
                                    slug: "docs/properties/config/geopoint"
                                },
                            ],
                        },
                        {
                            label: "Conditional Fields", translations: { es: "Campos condicionales", de: "Bedingte Felder", fr: "Champs conditionnels" , it: "Campi condizionali", pt: "Campos condicionais" },
                            slug: "docs/properties/conditional_fields"
                        },
                        {
                            label: "Custom Fields", translations: { es: "Campos personalizados", de: "Benutzerdefinierte Felder", fr: "Champs personnalisés" , it: "Campi personalizzati", pt: "Campos personalizados" },
                            slug: "docs/properties/custom_fields"
                        },
                        {
                            label: "Custom Previews", translations: { es: "Vistas previas personalizadas", de: "Benutzerdefinierte Vorschauen", fr: "Aperçus personnalisés" , it: "Anteprime personalizzate", pt: "Visualizações personalizadas" },
                            slug: "docs/properties/custom_previews"
                        },
                        {
                            label: "Reusing Properties", translations: { es: "Reutilización de propiedades", de: "Eigenschaften wiederverwenden", fr: "Réutilisation des propriétés" , it: "Riuso delle proprietà", pt: "Reutilizando propriedades" },
                            slug: "docs/properties/reusing_properties"
                        },
                    ],
                },
                {
                    label: "Top Level Views", translations: { es: "Vistas de nivel superior", de: "Top-Level-Ansichten", fr: "Vues de niveau supérieur" , it: "Viste di primo livello", pt: "Views de nível superior" },
                    slug: "docs/top_level_views",
                },
                {
                    label: "Provided Hooks", translations: { es: "Hooks integrados", de: "Bereitgestellte Hooks", fr: "Hooks intégrés" , it: "Hook forniti", pt: "Hooks fornecidos" },
                    collapsed: true,
                    items: [
                        {
                            label: "useAuthController", translations: { es: "useAuthController", de: "useAuthController", fr: "useAuthController" , it: "useAuthController", pt: "useAuthController" },
                            slug: "docs/hooks/use_auth_controller"
                        },
                        {
                            label: "useSideEntityController", translations: { es: "useSideEntityController", de: "useSideEntityController", fr: "useSideEntityController" , it: "useSideEntityController", pt: "useSideEntityController" },
                            slug: "docs/hooks/use_side_entity_controller"
                        },
                        {
                            label: "useSnackbarController", translations: { es: "useSnackbarController", de: "useSnackbarController", fr: "useSnackbarController" , it: "useSnackbarController", pt: "useSnackbarController" },
                            slug: "docs/hooks/use_snackbar_controller"
                        },
                        {
                            label: "useReferenceDialog", translations: { es: "useReferenceDialog", de: "useReferenceDialog", fr: "useReferenceDialog" , it: "useReferenceDialog", pt: "useReferenceDialog" },
                            slug: "docs/hooks/use_reference_dialog"
                        },
                        {
                            label: "useFireCMSContext", translations: { es: "useFireCMSContext", de: "useFireCMSContext", fr: "useFireCMSContext" , it: "useFireCMSContext", pt: "useFireCMSContext" },
                            slug: "docs/hooks/use_firecms_context"
                        },
                        {
                            label: "useDataSource", translations: { es: "useDataSource", de: "useDataSource", fr: "useDataSource" , it: "useDataSource", pt: "useDataSource" },
                            slug: "docs/hooks/use_data_source"
                        },
                        {
                            label: "useStorageSource", translations: { es: "useStorageSource", de: "useStorageSource", fr: "useStorageSource" , it: "useStorageSource", pt: "useStorageSource" },
                            slug: "docs/hooks/use_storage_source"
                        },
                        {
                            label: "useModeController", translations: { es: "useModeController", de: "useModeController", fr: "useModeController" , it: "useModeController", pt: "useModeController" },
                            slug: "docs/hooks/use_mode_controller"
                        },
                    ],
                },
                {
                    label: "Recipes", translations: { es: "Recetas", de: "Rezepte", fr: "Recettes" , it: "Esempi pratici", pt: "Exemplos práticos" },
                    collapsed: false,
                    items: [
                        {
                            label: "Building a Blog", translations: { es: "Creando un blog", de: "Einen Blog erstellen", fr: "Créer un blog" , it: "Creare un blog", pt: "Criando um blog" },
                            slug: "docs/recipes/building_a_blog"
                        },
                        {
                            label: "Auto-update Slug", translations: { es: "Actualizar slug automáticamente", de: "Slug automatisch aktualisieren", fr: "Mise à jour automatique du slug" , it: "Aggiornamento automatico slug", pt: "Atualizar slug automaticamente" },
                            slug: "docs/recipes/autoupdate_slug"
                        },
                        {
                            label: "Data Type Adapter", translations: { es: "Adaptador de tipos de datos", de: "Datentypanpassung", fr: "Adaptateur de types de données" , it: "Adattatore tipi dati", pt: "Adaptador de tipos de dados" },
                            slug: "docs/recipes/data_type_adapter"
                        },
                        {
                            label: "Copy Entity", translations: { es: "Copiar entidad", de: "Entität kopieren", fr: "Copier une entité" , it: "Copia entità", pt: "Copiar entidade" },
                            slug: "docs/recipes/copy_entity"
                        },
                        {
                            label: "Documents as Subcollections", translations: { es: "Documentos como subcolecciones", de: "Dokumente als Unterkollektionen", fr: "Documents comme sous-collections" , it: "Documenti come sottocollezioni", pt: "Documentos como subcoleções" },
                            slug: "docs/recipes/documents_as_subcollections"
                        },
                        {
                            label: "Entity Callbacks", translations: { es: "Callbacks de entidad", de: "Entitäts-Callbacks", fr: "Callbacks d'entité" , it: "Callback entità", pt: "Callbacks de entidade" },
                            slug: "docs/recipes/entity_callbacks"
                        },
                    ],
                },
                {
                    label: "Icons", translations: { es: "Iconos", de: "Icons", fr: "Icônes" , it: "Icone", pt: "Ícones" },
                    slug: "docs/icons",
                },
                {
                    label: "UI Components", translations: { es: "Componentes de la UI", de: "UI-Komponenten", fr: "Composants UI" , it: "Componenti UI", pt: "Componentes UI" },
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/components"
                        },
                        {
                            label: "Alert", translations: { es: "Alerta", de: "Hinweis", fr: "Alerte" , it: "Avviso", pt: "Alerta" },
                            slug: "docs/components/alert"
                        },
                        {
                            label: "Avatar", translations: { es: "Avatar", de: "Avatar", fr: "Avatar" , it: "Avatar", pt: "Avatar" },
                            slug: "docs/components/avatar"
                        },
                        {
                            label: "Badge", translations: { es: "Insignia", de: "Badge", fr: "Badge" , it: "Badge", pt: "Badge" },
                            slug: "docs/components/badge"
                        },
                        {
                            label: "Boolean Switch", translations: { es: "Interruptor booleano", de: "Boolescher Schalter", fr: "Interrupteur booléen" , it: "Interruttore booleano", pt: "Interruptor booleano" },
                            slug: "docs/components/boolean_switch"
                        },
                        {
                            label: "Button", translations: { es: "Botón", de: "Schaltfläche", fr: "Bouton" , it: "Pulsante", pt: "Botão" },
                            slug: "docs/components/button"
                        },
                        {
                            label: "Card", translations: { es: "Tarjeta", de: "Karte", fr: "Carte" , it: "Scheda", pt: "Cartão" },
                            slug: "docs/components/card"
                        },
                        {
                            label: "Centered View", translations: { es: "Vista centrada", de: "Zentrierte Ansicht", fr: "Vue centrée" , it: "Vista centrata", pt: "View centralizada" },
                            slug: "docs/components/centered_view"
                        },
                        {
                            label: "Checkbox", translations: { es: "Casilla de verificación", de: "Kontrollkästchen", fr: "Case à cocher" , it: "Casella di controllo", pt: "Caixa de seleção" },
                            slug: "docs/components/checkbox"
                        },
                        {
                            label: "Chip", translations: { es: "Chip", de: "Chip", fr: "Puce" , it: "Chip", pt: "Chip" },
                            slug: "docs/components/chip"
                        },
                        {
                            label: "Circular Progress", translations: { es: "Progreso circular", de: "Kreisfortschritt", fr: "Progression circulaire" , it: "Progresso circolare", pt: "Progresso circular" },
                            slug: "docs/components/circular_progress"
                        },
                        {
                            label: "Collapse", translations: { es: "Colapso", de: "Einklappen", fr: "Réductible" , it: "Comprimi", pt: "Recolher" },
                            slug: "docs/components/collapse"
                        },
                        {
                            label: "DateTime Field", translations: { es: "Campo de fecha y hora", de: "Datums-/Zeitfeld", fr: "Champ date et heure" , it: "Campo data/ora", pt: "Campo de data/hora" },
                            slug: "docs/components/datetimefield"
                        },
                        {
                            label: "Debounced Text Field", translations: { es: "Campo de texto con debounce", de: "Verzögertes Textfeld", fr: "Champ texte avec debounce" , it: "Campo testo con debounce", pt: "Campo de texto com debounce" },
                            slug: "docs/components/debounced_text_field"
                        },
                        {
                            label: "Dialog", translations: { es: "Diálogo", de: "Dialog", fr: "Dialogue" , it: "Finestra di dialogo", pt: "Diálogo" },
                            slug: "docs/components/dialog"
                        },
                        {
                            label: "Expandable Panel", translations: { es: "Panel expandible", de: "Erweiterbares Panel", fr: "Panneau extensible" , it: "Pannello espandibile", pt: "Painel expansível" },
                            slug: "docs/components/expandable_panel"
                        },
                        {
                            label: "File Upload",
                            slug: "docs/components/file_upload"
                        },
                        {
                            label: "Icon Button", translations: { es: "Botón de icono", de: "Icon-Schaltfläche", fr: "Bouton icône" , it: "Pulsante icona", pt: "Botão de ícone" },
                            slug: "docs/components/icon_button"
                        },
                        {
                            label: "Info Label", translations: { es: "Etiqueta de información", de: "Info-Beschriftung", fr: "Étiquette d'information" , it: "Etichetta info", pt: "Etiqueta de informação" },
                            slug: "docs/components/info_label"
                        },
                        {
                            label: "Label", translations: { es: "Etiqueta", de: "Beschriftung", fr: "Étiquette" , it: "Etichetta", pt: "Etiqueta" },
                            slug: "docs/components/label"
                        },
                        {
                            label: "Loading Button", translations: { es: "Botón de carga", de: "Lade-Schaltfläche", fr: "Bouton de chargement" , it: "Pulsante di caricamento", pt: "Botão de carregamento" },
                            slug: "docs/components/loading_button"
                        },
                        {
                            label: "Markdown", translations: { es: "Markdown", de: "Markdown", fr: "Markdown" , it: "Markdown", pt: "Markdown" },
                            slug: "docs/components/markdown"
                        },
                        {
                            label: "Menu", translations: { es: "Menú", de: "Menü", fr: "Menu" , it: "Menu", pt: "Menu" },
                            slug: "docs/components/menu"
                        },
                        {
                            label: "Menubar", translations: { es: "Barra de menú", de: "Menüleiste", fr: "Barre de menu" , it: "Barra menu", pt: "Barra de menu" },
                            slug: "docs/components/menubar"
                        },
                        {
                            label: "Multi Select", translations: { es: "Selección múltiple", de: "Mehrfachauswahl", fr: "Sélection multiple" , it: "Selezione multipla", pt: "Seleção múltipla" },
                            slug: "docs/components/multi_select"
                        },
                        {
                            label: "Paper", translations: { es: "Superficie (Paper)", de: "Oberfläche (Paper)", fr: "Surface (Paper)" , it: "Superficie (Paper)", pt: "Superfície (Paper)" },
                            slug: "docs/components/paper"
                        },
                        {
                            label: "Popover", translations: { es: "Popover", de: "Popover", fr: "Popover" , it: "Popover", pt: "Popover" },
                            slug: "docs/components/popover"
                        },
                        {
                            label: "Radio Group", translations: { es: "Grupo de opciones (Radio)", de: "Optionsgruppe (Radio)", fr: "Groupe de boutons radio" , it: "Gruppo radio", pt: "Grupo de botões de rádio" },
                            slug: "docs/components/radio_group"
                        },
                        {
                            label: "Search Bar", translations: { es: "Barra de búsqueda", de: "Suchleiste", fr: "Barre de recherche" , it: "Barra di ricerca", pt: "Barra de busca" },
                            slug: "docs/components/search_bar"
                        },
                        {
                            label: "Select", translations: { es: "Select", de: "Auswahl", fr: "Sélecteur" , it: "Selezione", pt: "Seleção" },
                            slug: "docs/components/select"
                        },
                        {
                            label: "Separator", translations: { es: "Separador", de: "Trennlinie", fr: "Séparateur" , it: "Separatore", pt: "Separador" },
                            slug: "docs/components/separator"
                        },
                        {
                            label: "Sheet", translations: { es: "Hoja (Sheet)", de: "Blatt (Sheet)", fr: "Feuille (Sheet)" , it: "Foglio (Sheet)", pt: "Folha (Sheet)" },
                            slug: "docs/components/sheet"
                        },
                        {
                            label: "Skeleton", translations: { es: "Esqueleto", de: "Skeleton", fr: "Squelette" , it: "Skeleton", pt: "Skeleton" },
                            slug: "docs/components/skeleton"
                        },
                        {
                            label: "Slider", translations: { es: "Deslizador", de: "Schieberegler", fr: "Curseur" , it: "Cursore", pt: "Controle deslizante" },
                            slug: "docs/components/slider"
                        },
                        {
                            label: "Table", translations: { es: "Tabla", de: "Tabelle", fr: "Tableau" , it: "Tabella", pt: "Tabela" },
                            slug: "docs/components/table"
                        },
                        {
                            label: "Tabs", translations: { es: "Pestañas", de: "Tabs", fr: "Onglets" , it: "Schede", pt: "Abas" },
                            slug: "docs/components/tabs"
                        },
                        {
                            label: "Text Field", translations: { es: "Campo de texto", de: "Textfeld", fr: "Champ de texte" , it: "Campo di testo", pt: "Campo de texto" },
                            slug: "docs/components/text_field"
                        },
                        {
                            label: "Textarea Autosize", translations: { es: "Área de texto autoajustable", de: "Automatisch anpassende Textarea", fr: "Zone de texte auto-dimensionnable" , it: "Area di testo ridimensionabile", pt: "Área de texto redimensionável" },
                            slug: "docs/components/textarea_autosize"
                        },
                    ],
                },
                {
                    label: "What's New in v3", translations: { es: "Novedades en v3", de: "Neuigkeiten in v3", fr: "Nouveautés dans v3" , it: "Novità nella v3", pt: "Novidades na v3" },
                    slug: "docs/what_is_new_v3"
                },
                {
                    label: "Changelog", translations: { es: "Registro de cambios", de: "Änderungsprotokoll", fr: "Journal des modifications" , it: "Registro delle modifiche", pt: "Registro de alterações" },
                    slug: "docs/changelog",
                },
            ],
            components: {
                PageFrame: "./src/components/starlight/PageFrame.astro",
                Header: "./src/components/starlight/Header.astro",
                SiteTitle: "./src/components/starlight/SiteTitle.astro",
                Head: "./src/components/starlight/Head.astro",
            },
        }),
        mdx(),
        sitemap({
            i18n: {
                defaultLocale: 'en',
                locales: {
                    en: 'en',
                    es: 'es',
                    de: 'de',
                    fr: 'fr',
                    it: 'it',
                    pt: 'pt',
                },
            },
        })
    ],
    vite: {
        plugins: [
            tailwindcss(),
            yaml()
        ],
        resolve: {
            alias: {
                "@firecms/ui": path.resolve(new URL(".", import.meta.url).pathname, "../packages/ui/src"),
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
