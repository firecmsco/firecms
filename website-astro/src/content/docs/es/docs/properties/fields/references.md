---
title: Referencias (References)
slug: es/docs/properties/fields/references
---

Usa campos de referencia cuando necesites establecer relaciones entre colecciones.
Por ejemplo, puedes tener un producto que esté relacionado con una categoría, o uno
que tenga múltiples compras.

Cuando configuras una aplicación FireCMS, defines colecciones en rutas o alias de
rutas (paths), y esas son las rutas que usas para configurar las propiedades de
referencia.

### Campo de referencia única (Single reference field)

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Cliente relacionado",
});
```

El tipo de datos es [`reference`](../config/reference)

Internamente, el componente utilizado
es [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding).


### Campo de referencia múltiple (Multiple reference field)

![Field](/img/fields/Multi_reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Productos relacionados",
    of: {
        dataType: "reference",
        path: "products"
    }
});
```

El tipo de datos es [`array`](../config/array) con una propiedad
de referencia como prop `of`. 

Internamente, el componente utilizado
es [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding).
