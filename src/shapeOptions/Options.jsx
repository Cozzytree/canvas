import ColorOptions from "./colorOptions";
import ThicknessOptions from "./ThicknessOptions";
import React from "react";
import { config, fontsizes } from "../config.js";
import {
   Menubar,
   MenubarContent,
   MenubarMenu,
   MenubarSeparator,
   MenubarTrigger,
} from "../components/menuBar.jsx";
import { useLocalContext } from "./context/localcontext.jsx";
import { buttonVariants } from "../components/button.jsx";
import { shape } from "../shape.js";

function Options() {
   const { currentActive, setCurrentActive } = useLocalContext();

   return (
      <>
         <Menubar className="h-[40px] w-fit flex items-center">
            <MenubarMenu>
               <MenubarTrigger className="flex gap-1 h-fit rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
                  <div
                     style={{ background: currentActive?.fillStyle }} // Use inline style for dynamic background color
                     className="h-[20px] p-[5px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
                  ></div>
                  <img src="/menu-up.svg" alt="menu-up" width="20px" />
               </MenubarTrigger>
               <MenubarContent className={"z-[999] w-fit"}>
                  <ColorOptions />
               </MenubarContent>
            </MenubarMenu>

            {currentActive?.type === "line" && (
               <MenubarMenu>
                  <MenubarTrigger className="flex gap-1 h-fit rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
                     <p className="flex items-center justify-center h-[20px]">
                        \
                     </p>
                     <img src="/menu-up.svg" alt="menu-up" width="20px" />
                  </MenubarTrigger>
                  <MenubarContent className="z-[999] w-fit">
                     <ul className="text-xs">
                        <li
                           onClick={() => {
                              config.currentActive.lineType = "elbow";
                              config.currentActive.curvePoints = [
                                 config.currentActive.curvePoints[0],
                                 config.currentActive.curvePoints[
                                    config.currentActive.curvePoints.length - 1
                                 ],
                              ];
                              shape.draw();
                           }}
                           className={`${buttonVariants({
                              variant: "ghost",
                              size: "sm",
                           })} w-full h-fit text-xs py-[4px]`}
                        >
                           Elbow
                        </li>
                        <li
                           onClick={() => {
                              config.currentActive.lineType = "straight";
                              let first = config.currentActive.curvePoints[0];
                              let last =
                                 config.currentActive.curvePoints[
                                    config.currentActive.curvePoints.length - 1
                                 ];
                              let midX = (first.x + last.x) / 2;
                              let midY = (first.y + last.y) / 2;

                              let midpoint = { x: midX, y: midY };

                              config.currentActive.curvePoints = [
                                 first,
                                 midpoint,
                                 last,
                              ];

                              shape.draw();
                           }}
                           className={`${buttonVariants({
                              variant: "ghost",
                              size: "sm",
                           })} w-full h-fit text-xs py-[4px]`}
                        >
                           Straight
                        </li>
                     </ul>
                  </MenubarContent>
               </MenubarMenu>
            )}

            {currentActive?.type === "text" && (
               <MenubarMenu>
                  <MenubarTrigger className="flex gap-1 h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
                     <p className="text-xs h-[20px] flex justify-center items-center">
                        T
                     </p>
                     <span className="text-xs">{currentActive?.size}px</span>
                  </MenubarTrigger>
                  <MenubarContent className={"z-[999] w-fit"}>
                     <div className="flex flex-col">
                        <div className="flex gap-1 items-center justify-evenly">
                           <button>-</button>
                           <p>{currentActive?.size}</p>
                           <button>+</button>
                        </div>
                        <MenubarSeparator />
                        <div className="flex flex-col divide-y">
                           {fontsizes.map((s, i) => (
                              <div
                                 onClick={() => {
                                    if (
                                       config.currentActive &&
                                       config.currentActive.size
                                    ) {
                                       config.currentActive.size = s.q;
                                       setCurrentActive(config.currentActive);
                                    }
                                 }}
                                 key={i}
                                 className={`${buttonVariants({
                                    variant: "ghost",
                                    size: "sm",
                                 })} h-fit`}
                              >
                                 {s.size}
                              </div>
                           ))}
                        </div>
                     </div>
                  </MenubarContent>
               </MenubarMenu>
            )}

            {currentActive?.type !== "text" && (
               <MenubarMenu>
                  <MenubarTrigger className="flex gap-1 h-fit rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
                     <img src="/format-line-weight.svg" alt="" width="20px" />
                     <img src="/menu-up.svg" alt="menu-up" width="20px" />
                  </MenubarTrigger>
                  <MenubarContent className={"z-[999]"}>
                     <ThicknessOptions />
                  </MenubarContent>
               </MenubarMenu>
            )}
         </Menubar>
      </>
   );
}

export default Options;
