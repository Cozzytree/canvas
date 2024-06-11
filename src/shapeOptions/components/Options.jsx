import ColorOptions from "./colorOptions";
import ThicknessOptions from "./ThicknessOptions";
import React, { useEffect, useState } from "react";
import { config, fontsizes } from "../../config";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./menuBar";
import { useLocalContext } from "../localcontext";

function Options() {
  const { currentActive, setCurrentActive } = useLocalContext();
  //   const [current, setCurrent] = useState(config.currentActive);
  const [bgColor, setbgColor] = useState(config?.currentActive?.fillStyle);

  return (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
            <div
              style={{ background: currentActive?.fillStyle }} // Use inline style for dynamic background color
              className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
            ></div>
            <img src="/menu-up.svg" alt="menu-up" width="20px" />
          </MenubarTrigger>
          <MenubarContent className={"z-[999] w-fit"}>
            <ColorOptions setbgColor={setbgColor} />
          </MenubarContent>
        </MenubarMenu>
        {currentActive?.type === "text" && (
          <MenubarMenu>
            <MenubarTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
              <p>T</p> <span>{currentActive?.size}px</span>
            </MenubarTrigger>
            <MenubarContent className={"z-[999]"}>
              <div className="flex flex-col">
                <div className="flex gap-1 items-center justify-evenly">
                  <button>-</button>
                  <p>{currentActive?.size}</p>
                  <button>+</button>
                </div>
                <MenubarSeparator />
                <div className="">
                  {fontsizes.map((s, i) => (
                    <div
                      onClick={() => {
                        if (config.currentActive && config.currentActive.size) {
                          config.currentActive.size = s.q;
                          setCurrentActive(config.currentActive);
                        }
                      }}
                      key={i}
                      className="hover:bg-zinc-700/50 p-[5px]"
                    >
                      <p>{s.size}</p>
                    </div>
                  ))}
                </div>
              </div>
            </MenubarContent>
          </MenubarMenu>
        )}

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
