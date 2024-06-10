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

function ColorOptions({ setbgColor }) {
  function handleColor(color) {
    if (config && config.currentActive) {
      config.currentActive.fillStyle = color;
      setbgColor(color);
    }
  }

  return (
    <>
      <div className="flex flex-col divide-y w-[167px]">
        <div>Circle</div>
        <div className="grid grid-cols-4 gap-[5px]">
          {colors.map((color, i) => (
            <div
              key={i}
              onClick={() => handleColor(color)}
              className={`h-[20px] cursor-pointer`}
              style={{ background: color }}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ColorOptions;
