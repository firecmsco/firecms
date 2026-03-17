---
title: Reutilizando configurações de propriedade
---

:::tip
Quando você define uma configuração de propriedade, poderá selecioná-la no
editor de coleções
:::

O FireCMS 3 introduziu uma nova forma de definir propriedades que permite reutilizá-las
em diferentes entidades e coleções.

Você pode definir um objeto `propertyConfigs` que
contém todas as configurações relacionadas a uma propriedade. Este é um array de
objetos `PropertyConfig`, definidos da seguinte forma:

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Chave usada para identificar esta configuração de propriedade.
     */
    key: string,

    /**
     * Nome deste tipo de campo.
     * Este não é o nome da propriedade.
     */
    name: string;

    /**
     * Configuração padrão para a propriedade.
     * Esta propriedade ou builder será usada como valores base para a propriedade resultante.
     * Você também pode usar uma função builder para gerar a propriedade base.
     * Você também pode definir um Campo personalizado como componente React para usar com esta propriedade.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Ícone opcional a ser usado no seletor de campos.
     * Use um componente 24x24, para não quebrar o layout.
     * Qualquer ícone FireCMS pode ser usado.
     */
    Icon?: React.ComponentType;

    /**
     * Cor CSS, usada apenas em alguns plugins como o seletor de campos.
     * Ex.: "#2d7ff9"
     */
    color?: string;

    /**
     * Descrição deste tipo de campo.
     */
    description?: string;

}
```

Note que você pode usar qualquer um dos builders ou propriedades existentes como base para
sua propriedade personalizada. O que você definir na sua propriedade será usado como base
para a propriedade resultante (o usuário ainda pode personalizá-la).

### FireCMS Cloud

Vamos definir uma propriedade personalizada que consiste em um objeto map de traduções com diferentes valores de string:

```typescript

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: [
        // ...
    ],
    propertyConfigs: [
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]
};
```

### FireCMS PRO

No FireCMS PRO, você pode definir os `propertyConfigs` no componente `FireCMS`:

```tsx
<FireCMS
    //...
    propertyConfigs={[
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]}
/>
```
