import React, { useEffect, useState } from "react";
import ColorOptions from "./colorOptions";
import { config } from "../../config";

function Options() {
  const [isColor, setColor] = useState(false);
  const [current, setCurrent] = useState(config.currentActive);
  const [bgColor, setbgColor] = useState(config?.currentActive?.fillStyle);

  useEffect(() => {
    console.log(current);
  }, [config.currentActive]);

  return (
    <>
      <ColorOptions
        isColor={isColor}
        setbgColor={setbgColor}
        setColor={setColor}
      />
      <div className="w-fit h-[40px] p-[2px] border border-zinc-700 grid grid-cols-[1fr_1fr] gap-2 justify-evenly items-center rounded-[5px]">
        <button
          onClick={() => {
            setColor((e) => !e);
          }}
          className="flex gap-1 p-[2px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200"
        >
          <div
            style={{ background: bgColor }} // Use inline style for dynamic background color
            className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
          ></div>
          <img src="/menu-up.svg" alt="menu-up" width="20px" />
        </button>
        <button className="flex gap-1 p-[2px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200">
          <img src="/format-line-weight.svg" alt="" width="20px" />
          <img src="/menu-up.svg" alt="menu-up" width="20px" />
        </button>
      </div>
    </>
  );
}

export default Options;
