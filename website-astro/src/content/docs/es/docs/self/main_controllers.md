---
slug: es/docs/self/controllers
title: Construir un backend personalizado
description: Aprende a implementar DataSourceDelegate, StorageSource y AuthController personalizados para FireCMS con tu propio backend.
---

FireCMS usa internamente 3 controladores principales para gestionar los datos, el almacenamiento de archivos y la autenticación.
Estos controladores están diseñados para ser fácilmente extendidos y reemplazados con tus propias implementaciones.

FireCMS proporciona implementaciones predeterminadas para Firebase, Firestore y Firebase Authentication,
pero puedes reemplazarlas con tus propias implementaciones. También proporcionamos una integración con MongoDB Atlas.

## DataSourceDelegate

El `DataSourceDelegate` es el delegado responsable de gestionar la fuente de datos. El delegado
se pasará a FireCMS y será utilizado internamente por el `DataSource`.

Puedes recuperar la fuente de datos en cualquier componente usando el hook `useDataSource`. También puedes acceder a la fuente de datos
desde callbacks donde hay un objeto `context` definido, en `context.dataSource`.

FireCMS proporciona implementaciones predeterminadas para:

- Firebase `useFirestoreDelegate` (paquete `@firecms/firebase`)
- MongoDB `useMongoDBDelegate` (paquete `@firecms/mongodb`)

### Crear tu propio DataSourceDelegate

Si deseas crear tu propio `DataSourceDelegate`, necesitarás implementar los siguientes métodos:

**fetchCollection**: Usado para obtener una colección de entidades desde tu fuente de datos. Acepta varios parámetros
como `path`, `filter`, `limit`, etc.

**listenCollection**: (Opcional) Escucha actualizaciones en tiempo real en una colección. Devuelve una función para cancelar la
suscripción. Si no se implementa, se usará el método `fetchCollection` en su lugar.

**fetchEntity**: Obtiene una sola entidad basada en `path` y `entityId`.

**listenEntity**: (Opcional) Escucha actualizaciones en tiempo real en una sola entidad. Devuelve una función para cancelar la
suscripción. Si no se implementa, se usará el método `fetchEntity` en su lugar.

**saveEntity**: Guarda o actualiza una entidad en una ruta específica.

**deleteEntity**: Elimina una entidad proporcionando la entidad a eliminar.

**checkUniqueField**: Verifica la unicidad de un campo específico en una colección.

**generateEntityId**: Genera un ID único para una nueva entidad.

**countEntities**: (Opcional) Cuenta el número de entidades en una colección.

**isFilterCombinationValid**: (Opcional) Verifica si una combinación de filtros dada es válida.

**currentTime**: (Opcional) Obtiene el objeto de marca de tiempo actual.

**delegateToCMSModel**: Convierte datos del modelo fuente al modelo CMS.

**cmsToDelegateModel**: Convierte datos del modelo CMS al modelo fuente.

**initTextSearch**: (Opcional) Inicializa las capacidades de búsqueda de texto.

## StorageSource

El `StorageSource` es el controlador responsable de gestionar el almacenamiento de archivos. El delegado
se pasará a FireCMS y será utilizado internamente por el CMS.

Puedes acceder a la fuente de almacenamiento en cualquier componente usando el hook `useStorageSource`. También puedes acceder a la fuente de almacenamiento
desde callbacks donde hay un objeto `context` definido, en `context.storageSource`.

FireCMS proporciona implementaciones predeterminadas para:

- Firebase `useFirebaseStorageSource` (paquete `@firecms/firebase`)

### Descripción de Métodos

**uploadFile**: Sube un archivo al almacenamiento, especificando un nombre y una ruta. Acepta parámetros
como `file`, `fileName`, `path`, `metadata` y `bucket`.

**getDownloadURL**: Convierte una ruta o URL de almacenamiento en una configuración de descarga. Acepta `pathOrUrl` y
opcionalmente `bucket`.

**getFile**: Recupera un archivo desde una ruta de almacenamiento. Devuelve `null` si el archivo no existe. Acepta `path` y
opcionalmente `bucket`.

## AuthController

El `AuthController` es el controlador responsable de gestionar la autenticación. El delegado
se pasará a FireCMS y será utilizado internamente por el CMS.

Puedes acceder al controlador de autenticación en cualquier componente usando el hook `useAuthController`.
También puedes acceder al controlador de autenticación desde callbacks donde hay un objeto `context` definido,
en `context.authController`.

FireCMS proporciona implementaciones predeterminadas para:

- Firebase `useFirebaseAuthController` (paquete `@firecms/firebase`)
- MongoDB `useMongoDBAuthController` (paquete `@firecms/mongodb`)

### Descripción de Propiedades y Métodos

**user**: El usuario actualmente conectado. Puede ser el objeto de usuario o `null` si el inicio de sesión fue omitido.

**roles**: (Opcional) Roles relacionados con el usuario conectado.

**initialLoading**: (Opcional) Un indicador usado para evitar mostrar la pantalla de inicio de sesión cuando la app se carga por primera vez y el estado de inicio de sesión aún no se ha determinado.

**authLoading**: Un indicador usado para mostrar una pantalla de carga mientras el usuario está iniciando o cerrando sesión.

**signOut**: Un método para cerrar la sesión del usuario. Devuelve una `Promise<void>`.

**authError**: (Opcional) Un objeto de error que representa problemas al inicializar la autenticación.

**authProviderError**: (Opcional) Un objeto de error enviado por el proveedor de autenticación.

**getAuthToken**: Un método para recuperar el token de autenticación del usuario actual. Devuelve una `Promise<string>`.

**loginSkipped**: Un indicador que indica si el usuario omitió el proceso de inicio de sesión.

**extra**: Un objeto que contiene datos adicionales relacionados con el controlador de autenticación.

**setExtra**: Un método para establecer los datos adicionales del controlador de autenticación. Acepta el parámetro `extra` de tipo `ExtraData`.

#### Métodos Adicionales para `useFirebaseAuthController`

**googleLogin**: Un método para iniciar el inicio de sesión con autenticación de Google.

**anonymousLogin**: Un método para iniciar sesión de forma anónima.

**appleLogin**: Un método para iniciar el inicio de sesión con autenticación de Apple.

**facebookLogin**: Un método para iniciar el inicio de sesión con autenticación de Facebook.

**githubLogin**: Un método para iniciar el inicio de sesión con autenticación de GitHub.

**microsoftLogin**: Un método para iniciar el inicio de sesión con autenticación de Microsoft.

**twitterLogin**: Un método para iniciar el inicio de sesión con autenticación de Twitter.

**emailPasswordLogin**: Un método para iniciar sesión con correo electrónico y contraseña. Toma `email` y `password` como parámetros.

**fetchSignInMethodsForEmail**: Un método para obtener los métodos de inicio de sesión para un correo electrónico dado. Toma `email` como parámetro y devuelve una `Promise<string[]>`.

**createUserWithEmailAndPassword**: Un método para crear un nuevo usuario con correo electrónico y contraseña. Toma `email` y `password` como parámetros.

**sendPasswordResetEmail**: Un método para enviar un correo electrónico de restablecimiento de contraseña. Toma `email` como parámetro y devuelve una `Promise<void>`.

**phoneLogin**: Un método para iniciar sesión con un número de teléfono. Toma `phone` y `applicationVerifier` como parámetros.

**confirmationResult**: (Opcional) Un objeto que contiene el resultado de una operación de autenticación por número de teléfono.

**skipLogin**: Un método para saltar el proceso de inicio de sesión.

**setUser**: Un método para establecer el objeto de usuario. Toma `user` de tipo `FirebaseUser` o `null` como parámetro.

**setRoles**: Un método para establecer los roles del usuario conectado. Toma un array de objetos `Role` como parámetro.
