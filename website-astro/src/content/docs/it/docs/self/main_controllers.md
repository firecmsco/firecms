---
slug: it/docs/self/controllers
title: Costruire un backend personalizzato
description: Impara come implementare DataSourceDelegate, StorageSource e AuthController personalizzati per FireCMS con il tuo backend.
---

FireCMS usa internamente 3 controller principali per gestire dati, archiviazione file e autenticazione. Questi controller sono progettati per essere facilmente estesi e sostituiti con le tue implementazioni.

FireCMS fornisce implementazioni predefinite per Firebase, Firestore e Firebase Authentication, ma puoi sostituirle con le tue. Forniamo anche un'integrazione con MongoDB Atlas.

## DataSourceDelegate

Il `DataSourceDelegate` è il delegato responsabile della gestione del datasource. Il delegato verrà passato a FireCMS e sarà usato internamente dalla `DataSource`.

Puoi recuperare il datasource in qualsiasi componente usando l'hook `useDataSource`. Puoi anche accedere al datasource dai callback dove è definito un oggetto `context`, sotto `context.dataSource`.

FireCMS fornisce implementazioni predefinite per:

- Firebase `useFirestoreDelegate` (pacchetto `@firecms/firebase`)
- MongoDB `useMongoDBDelegate` (pacchetto `@firecms/mongodb`)

### Creare il tuo DataSourceDelegate

Se vuoi creare il tuo `DataSourceDelegate`, dovrai implementare i seguenti metodi:

**fetchCollection**: Usato per recuperare una collezione di entità dal tuo datasource. Accetta vari parametri come `path`, `filter`, `limit`, ecc.

**listenCollection**: (Opzionale) Ascolta aggiornamenti in tempo reale su una collezione. Restituisce una funzione per annullare la sottoscrizione.

**fetchEntity**: Recupera una singola entità in base a `path` e `entityId`.

**listenEntity**: (Opzionale) Ascolta aggiornamenti in tempo reale su una singola entità.

**saveEntity**: Salva o aggiorna un'entità in un percorso specifico.

**deleteEntity**: Elimina un'entità fornendo l'entità da eliminare.

**checkUniqueField**: Controlla l'unicità di un particolare campo in una collezione.

**generateEntityId**: Genera un ID univoco per una nuova entità.

**countEntities**: (Opzionale) Conta il numero di entità in una collezione.

**isFilterCombinationValid**: (Opzionale) Controlla se una combinazione di filtri è valida.

**currentTime**: (Opzionale) Ottieni l'oggetto timestamp corrente.

**delegateToCMSModel**: Converte i dati dal modello sorgente al modello CMS.

**cmsToDelegateModel**: Converte i dati dal modello CMS al modello sorgente.

**initTextSearch**: (Opzionale) Inizializza le capacità di ricerca testo.

## StorageSource

Il `StorageSource` è il controller responsabile della gestione dell'archiviazione file. Il delegato verrà passato a FireCMS e sarà usato internamente dal CMS.

Puoi accedere al sorgente di archiviazione in qualsiasi componente usando l'hook `useStorageSource`. Puoi anche accedere al sorgente di archiviazione dai callback dove è definito un oggetto `context`, sotto `context.storageSource`.

FireCMS fornisce implementazioni predefinite per:

- Firebase `useFirebaseStorageSource` (pacchetto `@firecms/firebase`)

### Descrizione dei metodi

**uploadFile**: Carica un file nello storage, specificando un nome e un percorso.

**getDownloadURL**: Converte un percorso o URL di storage in una configurazione di download.

**getFile**: Recupera un file da un percorso di storage. Restituisce `null` se il file non esiste.

## AuthController

L'`AuthController` è il controller responsabile della gestione dell'autenticazione. Il delegato verrà passato a FireCMS e sarà usato internamente dal CMS.

Puoi accedere al controller auth in qualsiasi componente usando l'hook `useAuthController`. Puoi anche accedere al controller auth dai callback dove è definito un oggetto `context`, sotto `context.authController`.

FireCMS fornisce implementazioni predefinite per:

- Firebase `useFirebaseAuthController` (pacchetto `@firecms/firebase`)
- MongoDB `useMongoDBAuthController` (pacchetto `@firecms/mongodb`)

### Descrizione delle proprietà e dei metodi

**user**: L'utente attualmente connesso. Può essere l'oggetto utente o `null` se il login è stato saltato.

**roles**: (Opzionale) Ruoli relativi all'utente connesso.

**initialLoading**: (Opzionale) Flag per evitare di visualizzare la schermata di login quando l'app viene caricata per la prima volta.

**authLoading**: Flag per visualizzare una schermata di caricamento mentre l'utente accede o esce.

**signOut**: Metodo per disconnettere l'utente. Restituisce una `Promise<void>`.

**authError**: (Opzionale) Oggetto errore che rappresenta problemi nell'inizializzazione dell'autenticazione.

**authProviderError**: (Opzionale) Oggetto errore inviato dal provider di autenticazione.

**getAuthToken**: Metodo per recuperare il token di autenticazione per l'utente corrente.

**loginSkipped**: Flag che indica se l'utente ha saltato il processo di login.

**extra**: Oggetto contenente dati aggiuntivi relativi al controller di autenticazione.

**setExtra**: Metodo per impostare i dati aggiuntivi per il controller di autenticazione.

#### Metodi aggiuntivi per `useFirebaseAuthController`

**googleLogin**: Avvia il login usando l'autenticazione Google.

**anonymousLogin**: Accede in modo anonimo.

**appleLogin**: Avvia il login usando l'autenticazione Apple.

**facebookLogin**: Avvia il login usando l'autenticazione Facebook.

**githubLogin**: Avvia il login usando l'autenticazione GitHub.

**microsoftLogin**: Avvia il login usando l'autenticazione Microsoft.

**twitterLogin**: Avvia il login usando l'autenticazione Twitter.

**emailPasswordLogin**: Accede usando un'email e una password.

**fetchSignInMethodsForEmail**: Recupera i metodi di accesso per un'email specificata.

**createUserWithEmailAndPassword**: Crea un nuovo utente usando email e password.

**sendPasswordResetEmail**: Invia un'email di reset della password.

**phoneLogin**: Accede usando un numero di telefono.

**skipLogin**: Salta il processo di login.

**setUser**: Imposta l'oggetto utente.

**setRoles**: Imposta i ruoli per l'utente connesso.
