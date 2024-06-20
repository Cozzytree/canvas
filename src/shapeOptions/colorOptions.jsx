import React from "react";
import { config } from "../config";
import { shape } from "../shape";
import { useLocalContext } from "./context/localcontext";

const colors = [
   "#FF5733",
   "#33FF57",
   "#3357FF",
   "#FF33A1",
   "#A133FF",
   "#33FFF5",
];

function ColorOptions() {
   const { currentActive, setCurrentActive } = useLocalContext();

   function handleColor(color) {
      if (config && config.currentActive) {
         if (currentActive.type === "line") {
            config.currentActive.borderColor = color;
         } else {
            config.currentActive.fillStyle = color;
         }

         setCurrentActive(config.currentActive);
         shape.draw();
      }
   }

   return (
      <>
         <div className="flex flex-col divide-y w-full">
            <div>Circle</div>
            <div className="grid grid-cols-4 gap-[5px]">
               {colors.map((color, i) => (
                  <div
                     key={i}
                     onClick={() => handleColor(color)}
                     className={`h-[25px] w-[25px] rounded-sm border border-zinc-200/40 cursor-pointer`}
                     style={{ background: color }}
                  ></div>
               ))}
               <div
                  onClick={() => handleColor("#00000000")}
                  className={`relative h-[25px] w-[25px] rounded-sm border border-zinc-200/40 cursor-pointer`}
               >
                  <div className="absolute w-full h-[2px] border border-zinc-200 top-[50%] rotate-[46deg] left-0"></div>
               </div>
               <label htmlFor="custom-color">
                  <div
                     className={`relative bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 h-[25px] w-[25px] rounded-sm border border-zinc-200/40 cursor-pointer`}
                  >
                     <input
                        id="custom-color"
                        type="color"
                        className="hidden"
                        onChange={(e) => {
                           handleColor(e.target.value);
                        }}
                     />
                  </div>
               </label>
            </div>
         </div>
      </>
   );
}

export default ColorOptions;
