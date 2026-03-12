---
slug: fr/docs/self/controllers
title: Construire un backend personnalisé
description: Apprenez à implémenter des DataSourceDelegate, StorageSource et AuthController personnalisés pour FireCMS avec votre propre backend.
---

FireCMS utilise en interne 3 contrôleurs principaux pour gérer les données, le stockage de fichiers et l'authentification.
Ces contrôleurs sont conçus pour être facilement étendus et remplacés par vos propres implémentations.

FireCMS fournit des implémentations par défaut pour Firebase, Firestore et Firebase Authentication,
mais vous pouvez les remplacer par vos propres implémentations. Nous fournissons également une intégration avec MongoDB Atlas.

## DataSourceDelegate

Le `DataSourceDelegate` est le délégué responsable de la gestion de la source de données. Le délégué sera
transmis à FireCMS et sera utilisé en interne par la `DataSource`.

Vous pouvez récupérer la source de données dans n'importe quel composant à l'aide du hook `useDataSource`. Vous pouvez également accéder à la source de données
depuis les callbacks où un objet `context` est défini, sous `context.dataSource`.

FireCMS fournit des implémentations par défaut pour :

- Firebase `useFirestoreDelegate` (package `@firecms/firebase`)
- MongoDB `useMongoDBDelegate` (package `@firecms/mongodb`)

### Créer votre propre DataSourceDelegate

Si vous souhaitez créer votre propre `DataSourceDelegate`, vous devrez implémenter les méthodes suivantes :

**fetchCollection** : Utilisée pour récupérer une collection d'entités depuis votre source de données. Accepte divers paramètres
comme `path`, `filter`, `limit`, etc.

**listenCollection** : (Optionnelle) Écouter les mises à jour en temps réel sur une collection. Retourne une fonction pour annuler
l'abonnement. Si non implémentée, la méthode `fetchCollection` sera utilisée à la place.

**fetchEntity** : Récupérer une seule entité basée sur `path` et `entityId`.

**listenEntity** : (Optionnelle) Écouter les mises à jour en temps réel sur une seule entité. Retourne une fonction pour annuler
l'abonnement. Si non implémentée, la méthode `fetchEntity` sera utilisée à la place.

**saveEntity** : Sauvegarder ou mettre à jour une entité à un chemin spécifique.

**deleteEntity** : Supprimer une entité en fournissant l'entité à supprimer.

**checkUniqueField** : Vérifier l'unicité d'un champ particulier dans une collection.

**generateEntityId** : Générer un ID unique pour une nouvelle entité.

**countEntities** : (Optionnelle) Compter le nombre d'entités dans une collection.

**isFilterCombinationValid** : (Optionnelle) Vérifier si une combinaison de filtres est valide.

**currentTime** : (Optionnelle) Obtenir l'objet d'horodatage actuel.

**delegateToCMSModel** : Convertir les données du modèle source vers le modèle CMS.

**cmsToDelegateModel** : Convertir les données du modèle CMS vers le modèle source.

**initTextSearch** : (Optionnelle) Initialiser les capacités de recherche textuelle.

## StorageSource

La `StorageSource` est le contrôleur responsable de la gestion du stockage de fichiers. Le délégué sera
transmis à FireCMS et sera utilisé en interne par le CMS.

Vous pouvez accéder à la source de stockage dans n'importe quel composant à l'aide du hook `useStorageSource`. Vous pouvez également accéder à la source de stockage
depuis les callbacks où un objet `context` est défini, sous `context.storageSource`.

FireCMS fournit des implémentations par défaut pour :

- Firebase `useFirebaseStorageSource` (package `@firecms/firebase`)

### Description des méthodes

**uploadFile** : Téléverser un fichier vers le stockage, en spécifiant un nom et un chemin. Accepte des paramètres
comme `file`, `fileName`, `path`, `metadata` et `bucket`.

**getDownloadURL** : Convertir un chemin de stockage ou une URL en configuration de téléchargement. Accepte `pathOrUrl` et
optionnellement `bucket`.

**getFile** : Récupérer un fichier depuis un chemin de stockage. Retourne `null` si le fichier n'existe pas. Accepte `path` et
optionnellement `bucket`.

## AuthController

L'`AuthController` est le contrôleur responsable de la gestion de l'authentification. Le délégué sera
transmis à FireCMS et sera utilisé en interne par le CMS.

Vous pouvez accéder au contrôleur d'authentification dans n'importe quel composant à l'aide du hook `useAuthController`.
Vous pouvez également accéder au contrôleur d'authentification depuis les callbacks où un objet `context` est défini,
sous `context.authController`.

FireCMS fournit des implémentations par défaut pour :

- Firebase `useFirebaseAuthController` (package `@firecms/firebase`)
- MongoDB `useMongoDBAuthController` (package `@firecms/mongodb`)

### Description des propriétés et méthodes

**user** : L'utilisateur actuellement connecté. Peut être l'objet utilisateur ou `null` si la connexion a été ignorée.

**roles** : (Optionnel) Rôles liés à l'utilisateur connecté.

**initialLoading** : (Optionnel) Un indicateur utilisé pour éviter d'afficher l'écran de connexion lors du premier chargement de l'application si le statut de connexion n'a pas encore été déterminé.

**authLoading** : Un indicateur utilisé pour afficher un écran de chargement pendant que l'utilisateur se connecte ou se déconnecte.

**signOut** : Une méthode pour déconnecter l'utilisateur. Retourne une `Promise<void>`.

**authError** : (Optionnel) Un objet d'erreur représentant des problèmes lors de l'initialisation de l'authentification.

**authProviderError** : (Optionnel) Un objet d'erreur distribué par le fournisseur d'authentification.

**getAuthToken** : Une méthode pour récupérer le token d'authentification pour l'utilisateur actuel. Retourne une `Promise<string>`.

**loginSkipped** : Un indicateur indiquant si l'utilisateur a ignoré le processus de connexion.

**extra** : Un objet contenant des données supplémentaires liées au contrôleur d'authentification.

**setExtra** : Une méthode pour définir les données supplémentaires du contrôleur d'authentification. Accepte le paramètre `extra` de type `ExtraData`.

#### Méthodes supplémentaires pour `useFirebaseAuthController`

**googleLogin** : Une méthode pour initier la connexion avec l'authentification Google.

**anonymousLogin** : Une méthode pour se connecter de façon anonyme.

**appleLogin** : Une méthode pour initier la connexion avec l'authentification Apple.

**facebookLogin** : Une méthode pour initier la connexion avec l'authentification Facebook.

**githubLogin** : Une méthode pour initier la connexion avec l'authentification GitHub.

**microsoftLogin** : Une méthode pour initier la connexion avec l'authentification Microsoft.

**twitterLogin** : Une méthode pour initier la connexion avec l'authentification Twitter.

**emailPasswordLogin** : Une méthode pour se connecter avec un email et un mot de passe. Prend `email` et `password` comme paramètres.

**fetchSignInMethodsForEmail** : Une méthode pour récupérer les méthodes de connexion pour un email donné. Prend `email` comme paramètre et retourne une `Promise<string[]>`.

**createUserWithEmailAndPassword** : Une méthode pour créer un nouvel utilisateur avec un email et un mot de passe. Prend `email` et `password` comme paramètres.

**sendPasswordResetEmail** : Une méthode pour envoyer un email de réinitialisation du mot de passe. Prend `email` comme paramètre et retourne une `Promise<void>`.

**phoneLogin** : Une méthode pour se connecter avec un numéro de téléphone. Prend `phone` et `applicationVerifier` comme paramètres.

**confirmationResult** : (Optionnel) Un objet contenant le résultat d'une opération d'authentification par numéro de téléphone.

**skipLogin** : Une méthode pour ignorer le processus de connexion.

**setUser** : Une méthode pour définir l'objet utilisateur. Prend `user` de type `FirebaseUser` ou `null` comme paramètre.

**setRoles** : Une méthode pour définir les rôles pour l'utilisateur connecté. Prend un tableau d'objets `Role` comme paramètre.
