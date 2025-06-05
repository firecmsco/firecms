import { useState } from "react";
import { Board } from "./components/Board";
import { authors, items as initialItems } from "./data";
import QuoteItemView from "./QuoteItem";
import { Item } from "./components/types";
import { Quote } from "./data";

export function TestBoardView() {
    // Add state for columns
    const [columns, setColumns] = useState(authors);
    // Add state for items
    const [items, setItems] = useState<Item<Quote>[]>(initialItems);

    const handleItemsReorder = (
        updatedItems: Item<Quote>[],
        moveInfo?: {
            itemId: string,
            sourceColumn: string,
            targetColumn: string
        }
    ) => {
        if (moveInfo) {
            // An item was moved between columns
            // Update the author property to match the new column
            const updatedItemsWithAuthor = updatedItems.map(item => {
                if (item.id === moveInfo.itemId) {
                    return {
                        ...item,
                        content: {
                            ...item.content,
                            author: moveInfo.targetColumn
                        }
                    };
                }
                return item;
            });
            setItems(updatedItemsWithAuthor);
        } else {
            // Just a reordering within the same column
            setItems(updatedItems);
        }
    };

    return <Board data={items}
                  ItemComponent={QuoteItemView}
                  assignColumn={(item) => item.content.author}
                  columns={columns}
                  onColumnReorder={setColumns}
                  onItemsReorder={handleItemsReorder} />;
}
