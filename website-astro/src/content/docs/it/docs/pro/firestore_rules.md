---
title: Regole Firestore
sidebar_label: Regole Firestore
description: Configura le regole di sicurezza Firestore per FireCMS PRO per proteggere i dati di gestione utenti e configurazione collezioni.
---

:::note
Queste regole si applicano specificamente alla configurazione dei plugin FireCMS PRO. Se stai usando la versione community, ti incoraggiamo a scrivere le tue regole per proteggere i tuoi dati.
:::

FireCMS PRO salva alcuni dati di configurazione in Firestore per gestire ruoli e permessi degli utenti, nonché la configurazione delle collezioni. Per funzionare correttamente, devi configurare le regole Firestore per consentire al plugin di leggere e scrivere nei percorsi specificati.

Questi sono i percorsi predefiniti usati da FireCMS (puoi modificarli nella configurazione specifica del plugin):

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### Regole per la configurazione iniziale

A seconda della configurazione del tuo progetto, l'utente connesso potrebbe non avere il permesso di scrivere nel database Firestore nel percorso di configurazione FireCMS. In questo caso ti suggeriamo di consentire temporaneamente l'accesso al percorso `__FIRECMS` e alle sotto-collezioni.

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Regole finali consigliate

Dopo aver creato il primo utente e i ruoli, puoi limitare nuovamente l'accesso al percorso `__FIRECMS`. Ti incoraggiamo a impostare regole specifiche per il tuo progetto, in base ai tuoi requisiti di sicurezza.

Queste sono le regole che suggeriamo:

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

Queste regole consentiranno agli utenti con un ruolo CMS di leggere e scrivere tutti i dati nel tuo database Firestore. I ruoli verranno applicati nel frontend da FireCMS, ma se è un requisito per il tuo progetto, puoi anche applicarli nelle regole Firestore impostando le tue regole personalizzate.
