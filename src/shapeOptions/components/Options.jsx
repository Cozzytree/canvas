import ColorOptions from "./colorOptions";
import ThicknessOptions from "./ThicknessOptions";
import React, { useEffect, useState } from "react";
import { config } from "../../config";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "./menuBar";

function Options() {
  const [current, setCurrent] = useState(config.currentActive);
  const [bgColor, setbgColor] = useState(config?.currentActive?.fillStyle);

  useEffect(() => {
    if (current?.currentActive !== null) {
      setCurrent(config.currentActive);
      console.log(current);
    }
  }, [config.currentActive?.x]);

  return (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
            <div
              style={{ background: bgColor }} // Use inline style for dynamic background color
              className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
            ></div>
            <img src="/menu-up.svg" alt="menu-up" width="20px" />
          </MenubarTrigger>
          <MenubarContent className={"z-[999] w-fit"}>
            <ColorOptions setbgColor={setbgColor} />
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
            <img src="/format-line-weight.svg" alt="" width="20px" />
            <img src="/menu-up.svg" alt="menu-up" width="20px" />
          </MenubarTrigger>
          <MenubarContent className={"z-[999]"}>
            <ThicknessOptions />
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  );
}

export default Options;
