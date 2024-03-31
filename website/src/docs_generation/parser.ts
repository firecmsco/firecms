export type OnFileParsed = (filename: string, content: string) => void;

export function parseChatGPTOutput(output: string, callback: OnFileParsed) {
    // Pattern to identify filename and match contents until the next filename or end
    const filePattern = /\[([\w._-]+)\]\n```(?:\s|\S)*?\n((?:\s|\S)*?)\n```/g;

    let match: RegExpExecArray | null;

    // Loop over each match found by the regular expression.
    while ((match = filePattern.exec(output)) !== null) {
        // Extract filename and content from the matched result.
        const [, filename, content] = match;

        // Invoke the callback with the filename and the extracted content.
        callback(filename, content);
    }
}

// const chatGPTOutput = `[chip.mdx]
// \`\`\`
// ---
// id: chip
// title: Chip
// sidebar_label: Chip
// ---
//
// Chip components are used to display small pieces of information, such as tags, categories, or contact information. They are compact elements that can be interactive or static, often used in forms, cards, and as filters.
//
// ## Usage
//
// To use the \`Chip\`, import it alongside its types for props and optionally import colors utils from the utility file if you need custom color schemes. You can then pass children, \`size\`, \`colorScheme\`, \`error\`, \`outlined\`, \`onClick\`, and \`icon\` props to customize the chip.
//
// import CodeSample from "../../src/CodeSample";
// import CodeBlock from "@theme/CodeBlock";
//
// ## Basic Chip
//
// A straightforward example showcasing the basic usage of the Chip component with default size and color.
//
// import ChipBasicDemo from '../../samples/components/chip/chip_basic';
// import ChipBasicSource from '!!raw-loader!../../samples/components/chip/chip_basic';
//
// <CodeSample>
//     <ChipBasicDemo/>
// </CodeSample>
//
// <CodeBlock language="tsx">{ChipBasicSource}</CodeBlock>
//
// ## Chip Sizes
//
// Demonstrates how to utilize different sizes (tiny, small, and medium) available for the Chip component.
//
// import ChipSizeDemo from '../../samples/components/chip/chip_sizes';
// import ChipSizeSource from '!!raw-loader!../../samples/components/chip/chip_sizes';
//
// <CodeSample>
//     <ChipSizeDemo/>
// </CodeSample>
//
// <CodeBlock language="tsx">{ChipSizeSource}</CodeBlock>
//
// ## Chip Color Variants
//
// Shows how to use the \`colorScheme\` or \`color\` prop to apply different colors to the Chip, including handling error states.
//
// import ChipColorDemo from '../../samples/components/chip/chip_colors';
// import ChipColorSource from '!!raw-loader!../../samples/components/chip/chip_colors';
//
// <CodeSample>
//     <ChipColorDemo/>
// </CodeSample>
//
// <CodeBlock language="tsx">{ChipColorSource}</CodeBlock>
//
// ## Chip with Icon
//
// Illustrates adding an icon to the Chip to enhance its functionality or meaning.
//
// import ChipIconDemo from '../../samples/components/chip/chip_with_icon';
// import ChipIconSource from '!!raw-loader!../../samples/components/chip/chip_with_icon';
//
// <CodeSample>
//     <ChipIconDemo/>
// </CodeSample>
//
// <CodeBlock language="tsx">{ChipIconSource}</CodeBlock>
//
// ## Clickable Chip
//
// A Chip that can be interacted with, showing an example of using the \`onClick\` prop.
//
// import ChipClickableDemo from '../../samples/components/chip/chip_clickable';
// import ChipClickableSource from '!!raw-loader!../../samples/components/chip/chip_clickable';
//
// <CodeSample>
//     <ChipClickableDemo/>
// </CodeSample>
//
// <CodeBlock language="tsx">{ChipClickableSource}</CodeBlock>
// \`\`\`
//
// [chip_basic.tsx]
// \`\`\`
// import React from "react";
// import { Chip } from "@firecms/ui";
//
// export default function ChipBasicDemo() {
//     return (
//         <Chip>
//             Basic Chip
//         </Chip>
//     );
// }
// \`\`\`
//
// [chip_sizes.tsx]
// \`\`\`
// import React from "react";
// import { Chip } from "@firecms/ui";
//
// export default function ChipSizeDemo() {
//     return (
//         <>
//             <Chip size="tiny">Tiny Chip</Chip>
//             <Chip size="small">Small Chip</Chip>
//             <Chip>Medium Chip</Chip>
//         </>
//     );
// }
// \`\`\`
//
// [chip_colors.tsx]
// \`\`\`
// import React from "react";
// import { Chip } from "@firecms/ui";
//
// export default function ChipColorDemo() {
//     return (
//         <>
//             <Chip colorScheme="primary">Primary Chip</Chip>
//             <Chip colorScheme="secondary">Secondary Chip</Chip>
//             <Chip error>Error Chip</Chip>
//         </>
//     );
// }
// \`\`\`
//
// [chip_with_icon.tsx]
// \`\`\`
// import React from "react";
// import { Chip } from "@firecms/ui";
// import Icon from "@material-ui/core/Icon";
//
// export default function ChipIconDemo() {
//     return (
//         <Chip icon={<Icon>face</Icon>}>
//             Icon Chip
//         </Chip>
//     );
// }
// \`\`\`
//
// [chip_clickable.tsx]
// \`\`\`
// import React from "react";
// import { Chip } from "@firecms/ui";
//
// export default function ChipClickableDemo() {
//     return (
//         <Chip onClick={() => alert("Clicked!")}>
//             Clickable Chip
//         </Chip>
//     );
// }
// \`\`\``;


