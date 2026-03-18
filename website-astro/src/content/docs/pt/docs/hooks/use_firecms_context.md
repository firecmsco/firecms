---
slug: pt/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Obtém o contexto que inclui os controladores internos e contextos utilizados pela aplicação.
Alguns controladores e contextos incluídos podem ser acessados
diretamente a partir dos seus respectivos hooks.

As propriedades fornecidas por este hook são:

* `dataSource`: Conector para o seu banco de dados, por exemplo, seu banco de dados Firestore

* `storageSource`: Implementação de armazenamento utilizada

* `navigation`: Contexto que inclui a navegação resolvida e métodos e
  atributos utilitários.

* `sideEntityController`: Controlador para abrir o diálogo lateral exibindo formulários de entidade

* `sideDialogsController`: Controlador utilizado para abrir diálogos laterais (utilizado internamente pelos
  diálogos laterais de entidade ou diálogos de referência)

* `dialogsController`: Controlador utilizado para abrir diálogos regulares

* `authController`: Controlador de autenticação utilizado

* `customizationController`: Controlador que contém as opções de personalização do CMS

* `snackbarController`: Use este controlador para exibir snackbars

* `userConfigPersistence`: Use este controlador para acessar dados armazenados no navegador do usuário

* `analyticsController`: Callback para enviar eventos de analytics (opcional)

* `userManagement`: Seção utilizada para gerenciar usuários no CMS. Usada para exibir informações
  do usuário em vários locais e atribuir a propriedade das entidades.

Exemplo:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Acessar a fonte de dados
    const dataSource = context.dataSource;

    // Abrir uma snackbar
    context.snackbarController.open({
        type: "success",
        message: "Mensagem de exemplo"
    });

    return <div>Visualização de exemplo</div>;
}
```
