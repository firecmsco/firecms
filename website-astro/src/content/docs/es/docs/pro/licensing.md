---
title: Licencias
slug: es/docs/pro/licensing
description: Precios de FireCMS PRO, la prueba de 30 días en producción, qué se pausa sin licencia y cómo configurar tu clave de licencia.
---

:::tip
¿Tienes alguna pregunta o necesitas una licencia personalizada?
[Contáctanos por email](mailto:hello@firecms.co),
o [agenda una llamada](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Precio

FireCMS PRO cuesta **€99 al mes por el primer proyecto** y **€49 al mes por cada proyecto adicional** en la misma licencia.

| | Mensual | Anual |
|---|---|---|
| Primer proyecto | €99 ($119) | €990 ($1.190) |
| Cada proyecto adicional | €49 ($59) | €490 ($590) |

- **La unidad es un proyecto de Firebase.** Todos los proyectos vinculados a una licencia cuentan igual. No hay diferencia entre desarrollo, staging y producción: una app con proyectos de Firebase separados para dev, staging y prod son tres proyectos.
- **Usuarios ilimitados.** Añade a cada proyecto todos los usuarios que necesites.
- **Todos tus proyectos en una sola licencia.** La tarifa de €49 se aplica a los proyectos de la misma licencia, así que una licencia sale más barata que varias. Prod y staging en una licencia cuestan €99 + €49 = €148 al mes. Cinco proyectos de clientes en una licencia cuestan €99 + 4 × €49 = €295 al mes; en cinco licencias separadas costarían €495.

## Prueba gratuita de 30 días

PRO es gratis durante **30 días en producción**. Para empezar no necesitas tarjeta ni clave de licencia.

La prueba de un proyecto de Firebase empieza la primera vez que una app desplegada, es decir, cualquiera que no se sirva desde `localhost`, `127.0.0.1` o `[::1]`, ejecuta un plugin PRO con ese proyecto. El desarrollo local nunca necesita licencia.

## Qué pasa cuando termina la prueba

Si un proyecto no tiene una licencia válida cuando termina su prueba, o cuando su licencia caduca, se pausan estas funciones PRO:

- el editor de colecciones (editor de esquemas)
- la importación y exportación
- el historial de entidades
- data enhancement (autocompletado con IA)
- DataTalk

La app sigue funcionando. El inicio de sesión, tus datos, las colecciones definidas en código y las colecciones guardadas con el editor de esquemas se siguen cargando y se pueden editar. La gestión de usuarios sigue encargándose del inicio de sesión y los roles, pero sus pantallas de Usuarios y Roles muestran un aviso de que están en pausa. Un banner en la app enlaza a la página donde puedes conseguir una licencia. En cuanto el proyecto está en una licencia activa, las funciones pausadas vuelven la próxima vez que se carga la app.

Una licencia cubre tantos proyectos en producción como paga. Si más de sus proyectos se ejecutan en producción, los que se publicaron primero conservan PRO y en los demás PRO se pausa, como se describe arriba, hasta que la licencia los pague. El desarrollo local nunca cuenta.

## Plugins que necesitan licencia

| Plugin | Paquete |
|---|---|
| Editor de colecciones | `@firecms/collection_editor` |
| Gestión de usuarios | `@firecms/user_management` |
| Importación y exportación | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Historial de entidades | `@firecms/entity_history` |
| Data enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

El gestor de medios, el plugin de administración de Firebase y tus propios plugins no necesitan licencia. Una app que no usa ninguno de los plugins de arriba es FireCMS Community, gratis bajo licencia MIT.

## Consigue una licencia y configura la clave

1. Ve a [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) e inicia sesión.
2. Crea una licencia PRO y añade el ID de cada proyecto de Firebase que deba cubrir. El ID de un proyecto está en la consola de Firebase, en **Configuración del proyecto**.
3. Copia la clave de licencia y pásala al componente `FireCMS` como `apiKey`:

```tsx
<FireCMS
    apiKey={import.meta.env.VITE_FIRECMS_API_KEY}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={plugins}>
    {/* ... */}
</FireCMS>
```

Si empezaste con la plantilla PRO (`npx create-firecms-app --pro`), define `VITE_FIRECMS_API_KEY` en el archivo `.env`; la plantilla ya se la pasa a `FireCMS`.

Cuando añadas un proyecto nuevo, como un entorno de staging o un cliente nuevo, añade su ID a la misma licencia en lugar de crear otra, para que se facture a la tarifa de €49.

## Telemetría

La comprobación de licencia es una única petición del navegador a `api.firecms.co` cuando un usuario con sesión iniciada abre la app. En [Telemetría](/es/docs/self/telemetry) se detalla exactamente qué envía, qué guardamos y por qué.
