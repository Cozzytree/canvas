import { canvas } from "./main";

const textButton = document.getElementById("Text");

canvas.addEventListener("dblclick", function (event) {
  // Handle double click event
  console.log("Double click detected");
  console.log(event.target);
  if (event.target.tagName === "INPUT") return;

  const html = `<input type="text" class="w-[10ch] absolute px-[3px] text-[14px] outline-none bg-transparent focus:border-[1px] border-zinc-400/50 z-[999] shadow-sm" id="input"/>
  `;
  document.body.insertAdjacentHTML("afterbegin", html);
  const input = document.getElementById("input");
  input.style.left = event.clientX + "px";
  input.style.top = event.clientY + "px";
  input.focus();
});
