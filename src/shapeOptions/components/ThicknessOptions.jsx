import React, { useState } from "react";
import { config, colors } from "../../config";
import { MenubarSub, MenubarSubContent, MenubarSubTrigger } from "./menuBar";
import { shape } from "../../shape";

const thickness = [
  { size: "S", q: 1 },
  { size: "M", q: 2 },
  { size: "L", q: 3 },
  { size: "XL", q: 4 },
];

function ThicknessOptions() {
  const [borderColor, setBorderColor] = useState(
    config.currentActive?.borderColor
  );
  function handleThickness(num) {
    if (config.currentActive) {
      config.currentActive.lineWidth = num;
      shape.draw();
    }
  }
  return (
    <>
      <div className="p-[3px]">
        <MenubarSub>
          <MenubarSubTrigger className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
            <div
              style={{ background: borderColor }} // Use inline style for dynamic background color
              className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
            ></div>
            <img src="/menu-up.svg" alt="menu-up" width="20px" />
          </MenubarSubTrigger>
          <MenubarSubContent>
            <div className="gap-1 grid grid-cols-4 p-[5px] border border-zinc-700/60">
              {colors.map((a, i) => (
                <div
                  onClick={() => {
                    setBorderColor(a);
                    config.currentActive.borderColor = a;
                    shape.draw();
                  }}
                  key={i}
                  style={{ background: a }}
                  className="h-[20px]"
                ></div>
              ))}
            </div>
          </MenubarSubContent>
        </MenubarSub>

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
