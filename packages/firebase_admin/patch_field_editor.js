const fs = require('fs');
const file = '/Users/francesco/firecms/packages/firebase_admin/src/FieldEditor.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
`<TextareaAutosize
                value={value}
                onChange={(e) => onChange(e.target.value)}
                minRows={1}
                maxRows={8}
                ignoreBoxSizing
                className={cls(
                    "w-full outline-none text-sm leading-normal px-3 py-0.5 min-h-[28px] rounded-md resize-none",
                    "border",
                    defaultBorderMixin,
                    "bg-surface-50 dark:bg-surface-900",
                    "focus:ring-2 focus:ring-primary focus:border-primary",
                )}
            />`,
`<TextField
                size="small"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full"
                autoFocus
            />`
);

fs.writeFileSync(file, data);
