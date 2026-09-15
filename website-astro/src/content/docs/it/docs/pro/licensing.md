---
title: Licenze
slug: it/docs/pro/licensing
description: Prezzi di FireCMS PRO, la prova di 30 giorni in produzione, cosa si mette in pausa senza licenza e come impostare la chiave di licenza.
---

:::tip
Hai domande o hai bisogno di una licenza personalizzata?
[Contattaci via email](mailto:hello@firecms.co),
o [prenota una chiamata](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Prezzo

FireCMS PRO costa **€99 al mese per il primo progetto** e **€49 al mese per ogni progetto aggiuntivo** sulla stessa licenza.

| | Mensile | Annuale |
|---|---|---|
| Primo progetto | €99 ($119) | €990 ($1.190) |
| Ogni progetto aggiuntivo | €49 ($59) | €490 ($590) |

- **L'unità è un progetto Firebase.** Ogni progetto collegato a una licenza conta allo stesso modo. Non c'è differenza tra sviluppo, staging e produzione: un'app con progetti Firebase separati per dev, staging e prod sono tre progetti.
- **Utenti illimitati.** Aggiungi a ogni progetto tutti gli utenti che ti servono.
- **Tutti i tuoi progetti su un'unica licenza.** La tariffa di €49 vale per i progetti sulla stessa licenza, quindi una licenza costa meno di diverse. Prod e staging su una licenza costano €99 + €49 = €148 al mese. Cinque progetti di clienti su una licenza costano €99 + 4 × €49 = €295 al mese; su cinque licenze separate costerebbero €495.

## Prova gratuita di 30 giorni

PRO è gratuito per **30 giorni in produzione**. Per iniziare non servono né carta né chiave di licenza.

La prova di un progetto Firebase inizia la prima volta che un'app distribuita, cioè qualsiasi app non servita da `localhost`, `127.0.0.1` o `[::1]`, esegue un plugin PRO con quel progetto. Lo sviluppo in locale non richiede mai una licenza.

## Cosa succede quando la prova finisce

Se alla fine della prova un progetto non ha una licenza valida, o quando la sua licenza scade, queste funzioni PRO si mettono in pausa:

- l'editor delle collezioni (editor dello schema)
- import ed export
- la cronologia delle entità
- data enhancement (compilazione automatica con IA)
- DataTalk

L'app continua a funzionare. L'accesso, i tuoi dati, le collezioni definite nel codice e quelle salvate con l'editor dello schema continuano a caricarsi e si possono modificare. La gestione utenti continua a occuparsi di accesso e ruoli, ma le sue schermate Utenti e Ruoli mostrano un avviso che sono in pausa. Un banner nell'app porta alla pagina dove ottenere una licenza. Appena il progetto è su una licenza attiva, le funzioni in pausa tornano al successivo caricamento dell'app.

Non viene mai bloccato nulla perché una licenza ha più progetti collegati di quelli che paga. L'app mostra un avviso che invita ad aggiornare la licenza.

## Plugin che richiedono una licenza

| Plugin | Pacchetto |
|---|---|
| Editor delle collezioni | `@firecms/collection_editor` |
| Gestione utenti | `@firecms/user_management` |
| Import ed export | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Cronologia delle entità | `@firecms/entity_history` |
| Data enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

Il media manager, il plugin di amministrazione Firebase e i tuoi plugin non richiedono una licenza. Un'app che non usa nessuno dei plugin sopra è FireCMS Community, gratuito con licenza MIT.

## Ottieni una licenza e imposta la chiave

1. Vai su [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) e accedi.
2. Crea una licenza PRO e aggiungi l'ID di ogni progetto Firebase che deve coprire. L'ID di un progetto si trova nella console Firebase, in **Impostazioni progetto**.
3. Copia la chiave di licenza e passala al componente `FireCMS` come `apiKey`:

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

Se sei partito dal template PRO (`npx create-firecms-app --pro`), imposta `VITE_FIRECMS_API_KEY` nel file `.env`; il template la passa già a `FireCMS`.

Quando aggiungi un nuovo progetto, come un ambiente di staging o un nuovo cliente, aggiungi il suo ID alla stessa licenza invece di crearne una nuova, così viene fatturato alla tariffa di €49.

## Telemetria

La verifica della licenza è una singola richiesta del browser a `api.firecms.co` quando un utente autenticato apre l'app. La pagina [Telemetria](/it/docs/self/telemetry) spiega esattamente cosa invia, cosa conserviamo e perché.
