# Custom previews

Every property you define in the CMS has a preview component associated by
default. In some cases you may want to build a custom preview component.

Just as you can customize how your property field is rendered, you can change
how the preview of a property is **displayed in collection** and other **read only
views**.

You can build your preview as a React component that takes
[PropertyPreviewProps](https://firecms.co/docs/api/interfaces/PropertyPreviewProps) as props.

`PropertyPreviewProps` has two generic types: the first one is the type of the
property, such as `string` or `boolean` and the second one (optional) is the
type for any custom props you would like to pass to the preview, just like
done when defining custom fields.

### Example
Example of a custom preview for a `boolean` property:

```tsx

export default function CustomBooleanPreview({
                                                    value, property, size
                                                }: PropertyPreviewProps<boolean>
)
{
    return (
        value ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
    );
}
```

...and how it is used:

```tsx
export const blogCollection = buildCollection({
    name: "Blog entry",
    properties: {
        // ...
        reviewed: {
            name: "Reviewed",
            dataType: "boolean",
            Preview: CustomBooleanPreview
        },
    }
});
```


