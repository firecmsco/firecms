---
title: Licences
slug: fr/docs/pro/licensing
description: Tarifs de FireCMS PRO, l'essai de 30 jours en production, ce qui est mis en pause sans licence et comment définir votre clé de licence.
---

:::tip
Vous avez des questions ou avez besoin d'une licence personnalisée ?
Veuillez [nous contacter par email](mailto:hello@firecms.co),
ou [planifier un appel](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0INW8ihjQ90S4gkdo8_rbL_Zx7gagZShLIpHyW43zDXkQDPole6a1coo1sT2O6Gl05X8lxFDlp?gv=true).
:::

## Prix

FireCMS PRO coûte **€99 par mois pour le premier projet** et **€49 par mois pour chaque projet supplémentaire** sur la même licence, hors taxes.

| | Mensuel | Annuel |
|---|---|---|
| Premier projet | €99 ($119) | €990 ($1 190) |
| Chaque projet supplémentaire | €49 ($59) | €490 ($590) |

- **L'unité est un projet Firebase.** Chaque projet lié à une licence compte de la même façon. Il n'y a aucune différence entre développement, préproduction et production : une application avec des projets Firebase séparés pour dev, staging et prod, ce sont trois projets.
- **Utilisateurs illimités.** Ajoutez autant d'utilisateurs que nécessaire à chaque projet.
- **Tous vos projets sur une seule licence.** Le tarif de €49 s'applique aux projets de la même licence : une licence coûte donc moins cher que plusieurs. Prod et staging sur une licence coûtent €99 + €49 = €148 par mois. Cinq projets clients sur une licence coûtent €99 + 4 × €49 = €295 par mois ; sur cinq licences séparées, ils coûteraient €495.

## Essai gratuit de 30 jours

PRO est gratuit pendant **30 jours en production**. Pour commencer, vous n'avez besoin ni de carte bancaire ni de clé de licence.

L'essai d'un projet Firebase commence la première fois qu'une application déployée, c'est-à-dire tout ce qui n'est pas servi depuis `localhost`, `127.0.0.1` ou `[::1]`, exécute un plugin PRO avec ce projet. Le développement local ne nécessite jamais de licence.

## Ce qui se passe à la fin de l'essai

Si un projet n'a pas de licence valide à la fin de son essai, ou quand sa licence expire, ces fonctionnalités PRO sont mises en pause :

- l'éditeur de collections (éditeur de schéma)
- l'import et l'export
- l'historique des entités
- data enhancement (remplissage automatique par IA)
- DataTalk

L'application elle-même continue de fonctionner. La connexion, vos données, les collections définies dans le code et les collections enregistrées avec l'éditeur de schéma continuent de se charger et restent modifiables. La gestion des utilisateurs continue de gérer la connexion et les rôles, mais ses écrans Utilisateurs et Rôles affichent un avis indiquant qu'ils sont en pause. Une bannière dans l'application renvoie vers la page où obtenir une licence. Dès que le projet est sur une licence active, les fonctionnalités en pause reviennent au prochain chargement de l'application.

Une licence couvre autant de projets en production qu'elle en paie. Si davantage de ses projets tournent en production, ceux qui ont été mis en ligne en premier gardent PRO, et PRO est mis en pause sur les autres, comme décrit ci-dessus, jusqu'à ce que la licence les paie. Le développement local ne compte jamais.

## Plugins qui nécessitent une licence

| Plugin | Paquet |
|---|---|
| Éditeur de collections | `@firecms/collection_editor` |
| Gestion des utilisateurs | `@firecms/user_management` |
| Import et export | `@firecms/data_import`, `@firecms/data_export`, `@firecms/data_import_export` |
| Historique des entités | `@firecms/entity_history` |
| Data enhancement | `@firecms/data_enhancement` |
| DataTalk | `@firecms/datatalk` |

Le gestionnaire de médias, le plugin d'administration Firebase et vos propres plugins ne nécessitent pas de licence. Une application qui n'utilise aucun des plugins ci-dessus est FireCMS Community, gratuit sous licence MIT.

## Obtenir une licence et définir la clé

1. Rendez-vous sur [app.firecms.co/subscriptions](https://app.firecms.co/subscriptions?intent=pro) et connectez-vous.
2. Créez une licence PRO et ajoutez l'ID de chaque projet Firebase qu'elle doit couvrir. L'ID d'un projet se trouve dans la console Firebase, sous **Paramètres du projet**.
3. Copiez la clé de licence et passez-la au composant `FireCMS` via `apiKey` :

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

Si vous êtes parti du template PRO (`npx create-firecms-app --pro`), définissez `VITE_FIRECMS_API_KEY` dans le fichier `.env` ; le template la passe déjà à `FireCMS`.

Quand vous ajoutez un nouveau projet, par exemple un environnement de préproduction ou un nouveau client, ajoutez son ID à la même licence plutôt que d'en créer une nouvelle, pour qu'il soit facturé au tarif de €49.

## Télémétrie

La vérification de licence est une seule requête du navigateur vers `api.firecms.co` lorsqu'un utilisateur connecté ouvre l'application. La page [Télémétrie](/fr/docs/self/telemetry) détaille exactement ce qu'elle envoie, ce que nous conservons et pourquoi.
