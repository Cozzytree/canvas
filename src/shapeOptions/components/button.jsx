import React from "react";

function Button({ onClick, bgColor }) {
  return (
    <button
      onClick={onClick}
      className="flex gap-1 p-[5px] h-full rounded-[5px] items-center hover:bg-zinc-700/50 transition-all duration-200"
    >
      <div
        style={{ background: bgColor }} // Use inline style for dynamic background color
        className="h-[20px] w-[20px] rounded-full border-[1px] border-zinc-700 shrink-0"
      ></div>
      <img src="/menu-up.svg" alt="menu-up" width="20px" />
    </button>
  );
}
export default Button;
