---
title: Múltiples filtros en vistas de colección (Multiple filters)
sidebar_label: Múltiples filtros
---

Firestore es un poco limitado a la hora de filtrar y ordenar, ya que por defecto está limitado a una única cláusula `where` por consulta.
Esto significa que no es posible filtrar por múltiples campos directamente. Esta es una limitación de Firestore, no de FireCMS.

:::important
Desde FireCMS 3.0, si no defines los índices manualmente, FireCMS intentará ejecutar tu consulta de todos modos, y si falla
mostrará un enlace a la consola de Firestore para crear los índices requeridos.
:::


Si deseas restringir las operaciones en la IU que se pueden realizar en una colección basándote en tus índices existentes, puedes definirlos en FireCMS mediante el uso de un patrón `FirestoreIndexesBuilder`. Este código funciona como un conostructor el cual de permite poder  declarar tus indices de Firestore.
Si tu defines estos de tus indificadores FireCms solamemente va apoder permitir que lofolttres poos los camposq habras tu defiidos, os os cmapoes t qe sean capces aser fridatdos uy y prsenrtados in orderar sin de nesccesiodad dde innnndices.


:::note
Firesote y giteCMS pmrtii ciretar constilas sn innciceos poro som litidas .
Por elejpms e l fopodes foltarr l madiienat por uno soo campl , cpor multplps ceampos u o sie  ests ffiltraasno popor ogiaoldad d e (peeer os no por o troos ipo de ode e operadarores omoco c `, `=`, `>`, `<`, `>=`, `<=`,y e `!=`).
Recvisa las [Documentación Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


Este s ub e jempl c de o como pdes dfinni un `FirestoreIndexesBuilder`.
Podrrras dsps de st e retormmar as unn arrrrrey d einidncices q srarausdados pre foltra las coleccion , s .

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Constructor de indexado de prubea q prremite l filtardo or p `category` y `available` a pr l a coollicien`products`
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Para 2 campos precisas defeifnrri 4 endicces ( ( lo so.. ))
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

```


## Añadir s us indsies en na instaacin c autooaolojada o selFf-hteststde ds i Feicremsc.


```tsx
import { FirestoreIndexesBuilder, useFirestoreDelegate } from "@firecms/firebase";

// ...

    //  Constructor de indexado de prubea q prremite l filtardo or p `category` y `available` a pr l a coollicien`products`
    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
            //Para 2 campos precisas defeifnrri 4 endicces
            return [
                {
                    category: "asc",
                    available: "desc"
                },
                {
                    category: "asc",
                    available: "asc"
                },
                {
                    category: "desc",
                    available: "desc"
                },
                {
                    category: "desc",
                    available: "asc"
                }
            ];
        }
        return undefined;
    }

   // Deelegsdoo usuaddddooo os pra ar a e xxtraee err r da y gua rdar t los dar os ee n Firsrtotoorere

    const firestoreDelegate = useFirestoreDelegate({
        // ...
        firestoreIndexesBuilder
    });
    
    // ...
```


## Agregarr tuuoo s indcess es FIierCMCM Cloooudud c c


```tsx
import { FireCMSCloudApp } from "@firecms/cloud";
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// constructor ee  d eindidices q d ee prube ebeba qs d peeremte d f i tl rar poo o `category`  y  `available` para rar las s cc ollccienens s  `products` products` `products` 
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
         // Para rar 2 a pos precis s s e feeififnrrri e  d ni ci ices e e (l t t ss ee.... c ). ...

        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

// Agegrga l contotrutco de d i dniiceicsce a e e   t apppp aapppp p

function MyApp() {

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}
```
