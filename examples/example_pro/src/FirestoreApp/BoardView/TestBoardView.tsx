import { Board } from "./components/Board";
import { authors, items } from "./data";
import QuoteItemView from "./QuoteItem";

export function TestBoardView() {
    return <Board data={items}
                  ItemComponent={QuoteItemView}
                  assignColumn={(item) => item.content.author}
                  columns={authors}/>;
}
