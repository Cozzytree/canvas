import React from "react";
import { config } from "../../config";

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF5",
];

function ColorOptions({ isColor, setbgColor, setColor }) {
  function handleColor(color) {
    if (config && config.currentActive) {
      config.currentActive.fillStyle = color;
      setbgColor(color);
    }
  }

  return (
    <>
      {isColor && (
        <div className="grid grid-cols-4 w-full gap-[5px] p-[4px] border-[2px] border-zinc-700 rounded-[2px]">
          {colors.map((color, i) => (
            <div
              key={i}
              onClick={() => handleColor(color)}
              className="h-[20px] cursor-pointer"
              style={{ background: color }}
            ></div>
          ))}
        </div>
      )}
    </>
  );
}

export default ColorOptions;
