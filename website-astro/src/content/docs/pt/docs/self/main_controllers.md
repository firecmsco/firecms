---
slug: pt/docs/self/controllers
title: Construindo um backend personalizado
description: Aprenda como implementar DataSourceDelegate, StorageSource e AuthController personalizados para o FireCMS com seu próprio backend.
---

O FireCMS usa internamente 3 controllers principais para gerenciar os dados, armazenamento de arquivos e autenticação.
Esses controllers são projetados para serem facilmente estendidos e substituídos com suas próprias implementações.

O FireCMS fornece implementações padrão para Firebase, Firestore e Firebase Authentication,
mas você pode substituí-las com suas próprias implementações. Também fornecemos uma integração com MongoDB Atlas.

## DataSourceDelegate

O `DataSourceDelegate` é o delegate responsável por gerenciar o datasource. O delegate será
passado para o FireCMS e será usado internamente pelo `DataSource`.

Você pode recuperar o datasource em qualquer componente usando o hook `useDataSource`. Você também pode acessar o datasource
de callbacks onde há um objeto `context` definido, em `context.dataSource`.

O FireCMS fornece implementações padrão para:

- Firebase `useFirestoreDelegate` (pacote `@firecms/firebase`)
- MongoDB `useMongoDBDelegate` (pacote `@firecms/mongodb`)

### Criando seu próprio DataSourceDelegate

Se você quiser criar seu próprio `DataSourceDelegate`, precisará implementar os seguintes métodos:

**fetchCollection**: Usado para buscar uma coleção de entidades do seu datasource. Aceita vários parâmetros
como `path`, `filter`, `limit`, etc.

**listenCollection**: (Opcional) Ouvir atualizações em tempo real em uma coleção. Retorna uma função para cancelar a
assinatura. Se não implementado, o método `fetchCollection` será usado em vez disso.

**fetchEntity**: Buscar uma única entidade com base em `path` e `entityId`.

**listenEntity**: (Opcional) Ouvir atualizações em tempo real em uma única entidade. Retorna uma função para cancelar a
assinatura. Se não implementado, o método `fetchEntity` será usado em vez disso.

**saveEntity**: Salvar ou atualizar uma entidade em um caminho específico.

**deleteEntity**: Deletar uma entidade fornecendo a entidade a ser deletada.

**checkUniqueField**: Verificar a unicidade de um campo específico em uma coleção.

**generateEntityId**: Gerar um ID único para uma nova entidade.

**countEntities**: (Opcional) Contar o número de entidades em uma coleção.

**isFilterCombinationValid**: (Opcional) Verificar se uma determinada combinação de filtros é válida.

**currentTime**: (Opcional) Obter o objeto de timestamp atual.

**delegateToCMSModel**: Converter dados do modelo de origem para o modelo CMS.

**cmsToDelegateModel**: Converter dados do modelo CMS para o modelo de origem.

**initTextSearch**: (Opcional) Inicializar recursos de pesquisa de texto.

## StorageSource

O `StorageSource` é o controller responsável por gerenciar o armazenamento de arquivos. O delegate será
passado para o FireCMS e será usado internamente pelo CMS.

Você pode acessar o storage source em qualquer componente usando o hook `useStorageSource`. Você também pode acessar o storage
source de callbacks onde há um objeto `context` definido, em `context.storageSource`.

O FireCMS fornece implementações padrão para:

- Firebase `useFirebaseStorageSource` (pacote `@firecms/firebase`)

### Descrição dos Métodos

**uploadFile**: Fazer upload de um arquivo para armazenamento, especificando um nome e um caminho. Aceita parâmetros
como `file`, `fileName`, `path`, `metadata` e `bucket`.

**getDownloadURL**: Converter um caminho ou URL de armazenamento em uma configuração de download. Aceita `pathOrUrl` e
opcionalmente `bucket`.

**getFile**: Recuperar um arquivo de um caminho de armazenamento. Retorna `null` se o arquivo não existir. Aceita `path` e
opcionalmente `bucket`.

## AuthController

O `AuthController` é o controller responsável por gerenciar a autenticação. O delegate será
passado para o FireCMS e será usado internamente pelo CMS.

Você pode acessar o controller de autenticação em qualquer componente usando o hook `useAuthController`.
Você também pode acessar o controller de autenticação de callbacks onde há um objeto `context` definido,
em `context.authController`.

O FireCMS fornece implementações padrão para:

- Firebase `useFirebaseAuthController` (pacote `@firecms/firebase`)
- MongoDB `useMongoDBAuthController` (pacote `@firecms/mongodb`)

### Descrição de Propriedades e Métodos

**user**: O usuário atualmente logado. Pode ser o objeto do usuário ou `null` se o login foi ignorado.

**roles**: (Opcional) Papéis relacionados ao usuário logado.

**initialLoading**: (Opcional) Uma flag usada para evitar exibir a tela de login quando o app carrega pela primeira vez e o
status de login ainda não foi determinado.

**authLoading**: Uma flag usada para exibir uma tela de carregamento enquanto o usuário está logando ou saindo.

**signOut**: Um método para desconectar o usuário. Retorna uma `Promise<void>`.

**authError**: (Opcional) Um objeto de erro representando problemas ao inicializar a autenticação.

**authProviderError**: (Opcional) Um objeto de erro despachado pelo provedor de autenticação.

**getAuthToken**: Um método para recuperar o token de autenticação do usuário atual. Retorna uma `Promise<string>`.

**loginSkipped**: Uma flag indicando se o usuário pulou o processo de login.

**extra**: Um objeto contendo dados adicionais relacionados ao controller de autenticação.

**setExtra**: Um método para definir dados adicionais para o controller de autenticação. Aceita o parâmetro `extra` do
tipo `ExtraData`.

#### Métodos Adicionais para `useFirebaseAuthController`

**googleLogin**: Um método para iniciar login usando autenticação Google.

**anonymousLogin**: Um método para efetuar login anonimamente.

**appleLogin**: Um método para iniciar login usando autenticação Apple.

**facebookLogin**: Um método para iniciar login usando autenticação Facebook.

**githubLogin**: Um método para iniciar login usando autenticação GitHub.

**microsoftLogin**: Um método para iniciar login usando autenticação Microsoft.

**twitterLogin**: Um método para iniciar login usando autenticação Twitter.

**emailPasswordLogin**: Um método para efetuar login usando e-mail e senha. Aceita `email` e `password` como parâmetros.

**fetchSignInMethodsForEmail**: Um método para buscar métodos de login para um determinado e-mail. Aceita `email` como parâmetro e retorna uma `Promise<string[]>`.

**createUserWithEmailAndPassword**: Um método para criar um novo usuário usando e-mail e senha. Aceita `email` e `password` como parâmetros.

**sendPasswordResetEmail**: Um método para enviar um e-mail de redefinição de senha. Aceita `email` como parâmetro e retorna uma `Promise<void>`.

**phoneLogin**: Um método para efetuar login usando um número de telefone. Aceita `phone` e `applicationVerifier` como parâmetros.

**confirmationResult**: (Opcional) Um objeto contendo o resultado de uma operação de autenticação por número de telefone.

**skipLogin**: Um método para pular o processo de login.

**setUser**: Um método para definir o objeto do usuário. Aceita `user` do tipo `FirebaseUser` ou `null` como parâmetro.

**setRoles**: Um método para definir papéis para o usuário logado. Aceita um array de objetos `Role` como parâmetro.
