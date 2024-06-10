import React from "react";
import { createRoot } from "react-dom/client";
import Options from "./components/Options";
import { config } from "../config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./components/dropDownMenu";

function Root() {
  return (
    <div className="flex flex-col gap-1">
      <Options />
    </div>
  );
}
const dom = document.getElementById("options-container");
const root = createRoot(dom);

root.render(<Root />);
