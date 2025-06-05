import type { Item, ItemMap } from "./components/types";

export type Quote = {
    quote: string;
    author: string;
};

export const items: Item<Quote>[] = [

    {
        id: "1",
        content: {
            quote: "Sometimes life is scary and dark",
            author: "Finn"
        },

    },
    {
        id: "2",
        content: {
            quote:
                "Sucking at something is the first step towards being sorta good at something.",
            author: "Jake"
        }

    },
    {
        id: "3",
        content: {
            quote: "You got to focus on what's real, man",
            author: "Jake"
        }

    },
    // {
    //     id: "4",
    //     content: {
    //         quote: "Is that where creativity comes from? From sad biz?",
    //         author: "BMO"
    //     }
    //
    // },
    // {
    //     id: "5",
    //     content: {
    //         quote: "Homies help homies. Always",
    //         author: "Finn"
    //     }
    //
    // },
    // {
    //     id: "6",
    //     content: {
    //         quote: "Responsibility demands sacrifice",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "7",
    //     content: {
    //         quote: "That's it! The answer was so simple, I was too smart to see it!",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "8",
    //     content: {
    //         quote:
    //             "People make mistakes. It's all a part of growing up and you never really stop growing",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "9",
    //     content: {
    //         quote: "Don't you always call sweatpants 'give up on life pants,' Jake?",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "10",
    //     content: {
    //         quote: "I should not have drunk that much tea!",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "11",
    //     content: {
    //         quote: "Please! I need the real you!",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
    // {
    //     id: "12",
    //     content: {
    //         quote: "Haven't slept for a solid 83 hours, but, yeah, I'm good.",
    //         author: "Princess Bubblegum"
    //     }
    //
    // },
];

export const authors = items.reduce(
    (previous: string[], item: Item<Quote>) => {
        if (previous.includes(item.content.author)) {
            return previous;
        }
        return [...previous, item.content.author];
    },
    [],
);

export const generateItemMap = (): ItemMap<Quote> => {

    // dedupe the authors
    const authors = items.reduce(
        (previous: string[], item: Item<Quote>) => {
            if (previous.includes(item.content.author)) {
                return previous;
            }
            return [...previous, item.content.author];
        },
        [],
    );
    return authors.reduce(
        (previous: ItemMap<Quote>, author: string) => ({
            ...previous,
            [author]: items.filter((item: Item<Quote>) => item.content.author === author),
        }),
        {},
    );
};

export const authorQuoteMap: ItemMap<Quote> = generateItemMap();
