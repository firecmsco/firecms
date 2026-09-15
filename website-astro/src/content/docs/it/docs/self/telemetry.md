---
slug: it/docs/self/telemetry
title: Telemetria e verifica della licenza
sidebar_label: Telemetria
description: L'unica richiesta che un'app FireCMS self-hosted invia a FireCMS, cosa contiene, cosa conserviamo e perché, e come disattivarla in Community.
---

Un'app FireCMS self-hosted legge e scrive i tuoi dati direttamente dal browser, con l'SDK di Firebase o di MongoDB. A FireCMS invia una sola richiesta: il registro degli accessi, che è anche la verifica della licenza PRO. Questa pagina elenca esattamente cosa contiene quella richiesta e cosa conserviamo.

## Quando viene inviata

Una volta per utente autenticato ogni volta che l'app si carica: quando un utente accede, o quando l'app si apre con un utente già autenticato, il browser invia una richiesta `POST` a `https://api.firecms.co/access_log`. Viene inviata anche durante lo sviluppo in locale.

## Cosa contiene la richiesta

- **Header `Authorization`**: l'ID token dell'utente autenticato, rilasciato dal tuo provider di autenticazione (per esempio Firebase Authentication).
- **Header `Referer`**: aggiunto dal browser; l'URL della pagina in cui gira l'app.
- **Body**:
  - `apiKey`: la tua chiave di licenza PRO, se l'hai impostata
  - `email`: l'indirizzo email dell'utente autenticato
  - `datasource`: la chiave della sorgente dati in uso, per esempio `firestore`
  - `plugins`: le chiavi dei plugin che hai configurato, per esempio `["collection_editor", "user_management"]`

La richiesta non contiene credenziali del database, né documenti o altri contenuti di Firestore o Atlas, né schemi delle collezioni.

## Cosa conserviamo

Il nostro server legge l'ID del progetto Firebase dall'ID token e salva una voce per ogni richiesta, con:

- l'ID del progetto Firebase e, se è stata inviata una chiave di licenza, l'ID della licenza
- l'uid e l'indirizzo email dell'utente
- i claim decodificati dell'ID token. Comprendono uid ed email, e il nome visualizzato, l'URL della foto e il provider di accesso quando il tuo provider di autenticazione li imposta.
- l'URL del referer
- la chiave della sorgente dati e le chiavi dei plugin
- l'esito della verifica della licenza (se le funzioni PRO sono state messe in pausa)
- un timestamp

Le voci sono salvate nel nostro progetto Google Cloud, in Firestore e con una copia in BigQuery per analizzare l'utilizzo. Il body della richiesta, senza la chiave di licenza, viene scritto anche nei log del nostro server.

## Perché

- **Verificare la licenza.** Per un progetto che usa plugin PRO, la risposta dice all'app se funzionano o vanno in pausa.
- **Il conteggio della prova.** La [prova di 30 giorni in produzione](/it/docs/pro/licensing) di un progetto inizia con la sua prima voce da un'app distribuita che usa plugin PRO.
- **Contare l'utilizzo.** Quanti progetti e utenti usano FireCMS Community e PRO, e quali plugin.

## Email

Quando un'app distribuita usa plugin PRO, usiamo anche l'indirizzo email della voce per scrivere a quell'utente riguardo a PRO: un'email di benvenuto la prima volta che il progetto esegue PRO, un follow-up circa 14 giorni dopo e un avviso se la verifica della licenza mette in pausa le funzioni PRO. Nessuna viene inviata due volte allo stesso indirizzo per lo stesso progetto.

## Conservazione

Al momento le voci vengono conservate senza una data di cancellazione fissa. Scrivi a [hello@firecms.co](mailto:hello@firecms.co) per far cancellare le voci del tuo progetto.

## Disattivarla

In un'app senza `apiKey` e senza plugin PRO, passa `telemetry={false}` a `FireCMS` e la richiesta non viene inviata affatto:

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

Con un `apiKey` impostato, o con un plugin PRO attivo (editor delle collezioni, gestione utenti, import/export, cronologia delle entità, data enhancement, DataTalk), la richiesta viene sempre inviata: è la verifica della licenza e avvia la prova.

## Altre richieste a FireCMS

Questa pagina riguarda solo il registro degli accessi. Le funzioni di IA opzionali (data enhancement, DataTalk e la generazione di collezioni con IA nell'editor delle collezioni) inviano a `api.firecms.co` i campi e i prompt su cui le usi. Funzionano solo se le aggiungi alla tua app.
