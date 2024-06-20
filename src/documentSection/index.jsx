import React from "react";
import { createRoot } from "react-dom/client";
import MainContent from "./component/mainContent";

function Root() {
    return (
        <div className="w-full relative h-full flex flex-col overflow-x-hidden">
            <h1>CANVAS</h1>
            <MainContent />
        </div>
    );
}

const dom = document.getElementById("document");
const root = createRoot(dom);

root.render(<Root />);
