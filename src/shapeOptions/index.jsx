import React from "react";
import { createRoot } from "react-dom/client";
import Options from "./Options";
import { LocalContextProvider } from "./context/localcontext";

function Root() {
   return (
      <div className="flex flex-col gap-1">
         <LocalContextProvider>
            <Options />
         </LocalContextProvider>
      </div>
   );
}
const dom = document.getElementById("options-container");
const root = createRoot(dom);

root.render(<Root />);
