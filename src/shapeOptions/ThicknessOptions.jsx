import React, { useState } from "react";
import { config, colors } from "../config.js";
import { MenubarSub, MenubarSubContent, MenubarSubTrigger } from "../components/menuBar.jsx";
import { shape } from "../shape.js";
import { useLocalContext } from "./context/localcontext";

const thickness = [
   { size: "S", q: 1 },
   { size: "M", q: 2 },
   { size: "L", q: 3 },
   { size: "XL", q: 4 },
];

function ThicknessOptions() {
   const { currentActive, setCurrentActive } = useLocalContext();
   const [borderColor, setBorderColor] = useState(
      config.currentActive?.borderColor
   );
   function handleThickness(num) {
      if (config && config.currentActive) {
         config.currentActive.lineWidth = num;
         setCurrentActive(config.currentActive);
         shape.draw();
      }
   }
   function handleBorderColor(color) {
      setBorderColor(color);
      config.currentActive.borderColor = color;
      shape.draw();
      setCurrentActive(config.currentActive);
   }

   return (
      <>
         <div className="p-[3px] w-fit">
            {currentActive.type !== "line" && (
               <MenubarSub>
                  <MenubarSubTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
                     <div
                        style={{ background: borderColor }} // Use inline style for dynamic background color
                        className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
                     ></div>
                     <img src="/menu-up.svg" alt="menu-up" width="20px" />
                  </MenubarSubTrigger>
                  <MenubarSubContent className="">
                     <div className="grid grid-cols-4 gap-[5px]">
                        {colors.map((a, i) => (
                           <div
                              onClick={() => {
                                 handleBorderColor(a);
                              }}
                              key={i}
                              style={{ background: a }}
                              className={`h-[25px] w-[25px] rounded-sm border border-zinc-200/40 cursor-pointer`}
                           ></div>
                        ))}
                        <div
                           onClick={() => handleBorderColor("#00000000")}
                           className={`relative h-[25px] w-[25px] rounded-sm border border-zinc-200/40 cursor-pointer`}
                        >
                           <div className="absolute w-full h-[2px] border border-zinc-200 top-[50%] rotate-[46deg] left-0"></div>
                        </div>
                     </div>
                  </MenubarSubContent>
               </MenubarSub>
            )}

            {thickness.map((a, i) => (
               <div
                  onClick={() => handleThickness(a.q)}
                  key={i}
                  className={`${
                     a.q === config.currentActive.lineWidth && "bg-blue-700"
                  } grid grid-cols-[0.5fr_1fr] gap-2 items-center hover:bg-zinc-700/60 transition-all duration-200 p-[3px]`}
               >
                  <p className="text-sm">{a.size}</p>
                  <div
                     style={{ border: `${a.q}px solid` }}
                     className={`border-zinc-100`}
                  ></div>
               </div>
            ))}
         </div>
      </>
   );
}

export default ThicknessOptions;
