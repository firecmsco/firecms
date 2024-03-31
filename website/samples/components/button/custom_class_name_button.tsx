import React from "react";
import { Button } from "@firecms/ui";

export default function CustomClassNameButtonDemo() {
    return (
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button className="bg-red-500 hover:bg-red-600">
                Button with Custom Class
            </Button>
        </div>
    );
}
