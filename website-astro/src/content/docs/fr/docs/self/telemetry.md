---
slug: fr/docs/self/telemetry
title: Télémétrie et vérification de licence
sidebar_label: Télémétrie
description: La seule requête qu'une application FireCMS auto-hébergée envoie à FireCMS, ce qu'elle contient, ce que nous conservons et pourquoi, et comment la désactiver dans Community.
---

Une application FireCMS auto-hébergée lit et écrit vos données depuis le navigateur, via le SDK de Firebase ou votre propre backend. Elle envoie une seule requête à FireCMS : le journal d'accès, qui est aussi la vérification de la licence PRO. Cette page détaille exactement ce que contient cette requête et ce que nous conservons.

## Quand elle est envoyée

Une fois par utilisateur connecté à chaque chargement de l'application : quand un utilisateur se connecte, ou quand l'application s'ouvre avec un utilisateur déjà connecté, le navigateur envoie une requête `POST` à `https://api.firecms.co/access_log`. Elle est aussi envoyée en développement local.

## Ce que contient la requête

- **En-tête `Authorization`** : le jeton d'identification (ID token) de l'utilisateur connecté, fourni par votre fournisseur d'authentification (par exemple Firebase Authentication).
- **En-tête `Referer`** : ajouté par le navigateur ; l'URL de la page où tourne l'application.
- **Corps** :
  - `apiKey` : votre clé de licence PRO, si vous en avez défini une
  - `email` : l'adresse email de l'utilisateur connecté
  - `datasource` : la clé de la source de données utilisée, par exemple `firestore`
  - `plugins` : les clés des plugins que vous avez configurés, par exemple `["collection_editor", "user_management"]`

La requête ne contient aucun identifiant de base de données, aucun document ni autre contenu de Firestore, et aucun schéma de collection.

## Ce que nous conservons

Notre serveur lit l'ID du projet Firebase dans le jeton et enregistre une entrée par requête, avec :

- l'ID du projet Firebase et, si une clé de licence a été envoyée, l'ID de la licence
- l'uid et l'adresse email de l'utilisateur
- les claims décodés du jeton. Ils comprennent l'uid et l'email, ainsi que le nom d'affichage, l'URL de la photo et le fournisseur de connexion lorsque votre fournisseur d'authentification les définit.
- l'URL du referer
- la clé de la source de données et les clés des plugins
- le résultat de la vérification de licence (si les fonctionnalités PRO ont été mises en pause)
- un horodatage

Les entrées sont stockées dans notre projet Google Cloud, dans Firestore avec une copie dans BigQuery pour l'analyse de l'usage. Le corps de la requête, sans la clé de licence, est aussi écrit dans les journaux de notre serveur.

## Pourquoi

- **Valider la licence.** Pour un projet qui utilise des plugins PRO, la réponse indique à l'application s'ils fonctionnent ou sont mis en pause.
- **Le compteur de l'essai.** L'[essai de 30 jours en production](/fr/docs/pro/licensing) d'un projet commence avec sa première entrée provenant d'une application déployée qui utilise des plugins PRO.
- **Mesurer l'usage.** Combien de projets et d'utilisateurs utilisent FireCMS Community et PRO, et quels plugins.

## Emails

Quand une application déployée utilise des plugins PRO, nous utilisons aussi l'adresse email de l'entrée pour écrire à cet utilisateur au sujet de PRO : un email de bienvenue la première fois que le projet exécute PRO, une relance environ 14 jours plus tard et un avis si la vérification de licence met en pause les fonctionnalités PRO. Aucun n'est envoyé deux fois à la même adresse pour le même projet.

## Conservation

Les entrées sont actuellement conservées sans date de suppression fixe. Écrivez à [hello@firecms.co](mailto:hello@firecms.co) pour faire supprimer les entrées de votre projet.

## La désactiver

Dans une application sans `apiKey` et sans plugin PRO, passez `telemetry={false}` à `FireCMS` et la requête n'est pas envoyée du tout :

```tsx
<FireCMS
    telemetry={false}
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}>
    {/* ... */}
</FireCMS>
```

Lorsqu'un `apiKey` est défini, ou qu'un plugin PRO est utilisé (éditeur de collections, gestion des utilisateurs, import/export, historique des entités, data enhancement, DataTalk), la requête est toujours envoyée : c'est la vérification de licence, et elle démarre l'essai.

## Autres requêtes vers FireCMS

Cette page ne couvre que le journal d'accès. Les fonctionnalités d'IA optionnelles (data enhancement, DataTalk et la génération de collections par IA de l'éditeur de collections) envoient à `api.firecms.co` les champs et les prompts sur lesquels vous les utilisez. Elles ne fonctionnent que si vous les ajoutez à votre application.
