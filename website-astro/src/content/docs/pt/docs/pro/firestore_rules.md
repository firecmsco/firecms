---
title: Regras do Firestore
sidebar_label: Regras do Firestore
description: Configure as regras de segurança do Firestore para o FireCMS PRO para proteger o gerenciamento de usuários e os dados de configuração de coleções.
---

:::note
Essas regras se aplicam especificamente à configuração dos plugins do FireCMS PRO. Se você estiver usando a versão community, recomendamos escrever suas próprias regras para proteger seus dados.
:::

O FireCMS PRO salva alguns dados de configuração no Firestore para gerenciar papéis e permissões de usuário, bem como a configuração de coleções. Para funcionar corretamente, você precisa configurar as regras do Firestore para permitir que o plugin leia e escreva nos caminhos especificados.

Esses são os caminhos padrão usados pelo FireCMS (você pode modificá-los na configuração específica do plugin):

- `__FIRECMS/config/users`
- `__FIRECMS/config/roles`
- `__FIRECMS/config/collections`

### Regras para a primeira configuração

Dependendo da configuração do seu projeto, o usuário logado pode não ter permissão para escrever no banco de dados Firestore, no caminho de configuração do FireCMS. Nesse caso, sugerimos permitir temporariamente o acesso ao caminho `__FIRECMS` e suas subcoleções.

```
match /__FIRECMS/{document=**} {
  allow read: if true;
  allow write: if true;
}
```

### Regras sugeridas finais

Depois de criar o primeiro usuário e os papéis, você pode restringir o acesso ao caminho `__FIRECMS` novamente. Recomendamos configurar regras específicas para o seu projeto, com base nos seus requisitos de segurança.

Estas são as regras que sugerimos:

```
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/users/$(request.auth.token.email));
}
```

Essas regras permitirão que usuários com um papel CMS leiam e escrevam todos os dados no seu banco de dados Firestore.
Os papéis serão aplicados no frontend pelo FireCMS, mas se for um requisito do seu projeto, você também pode aplicá-los nas regras do Firestore, definindo suas próprias regras personalizadas.
