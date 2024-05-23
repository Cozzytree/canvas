import { Shapes, textMap } from "./main";
import { config } from "./config";

export class Text extends Shapes {
  constructor(x, y, size = 20, content) {
    super();
    this.x = x;
    this.y = y;
    this.size = size;
    this.content = content;

    canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mouseup", this.mouseUp.bind(this));
  }

  mouseDown(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    textMap.forEach((text) => {
      if (this.isWithinBounds(mouseX, mouseY, text)) {
        text.isDragging = true;
        text.offsetX = mouseX - text.x;
        text.offsetY = mouseY - text.y;
        text.isActive = true;
      }
      if (this.isWithinResizeHandle(mouseX, mouseY, text)) {
        text.isResizing = true;
      }
    });
  }

  mouseMove(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    textMap.forEach((text) => {
      if (text.isDragging) {
        text.x = mouseX - text.offsetX;
        text.y = mouseY - text.offsetY;
      } else if (text.isResizing) {
        text.size = Math.max(10, mouseY - text.y); // Ensure minimum size
      }
      text.draw();
    });
  }

  mouseUp(e) {
    textMap.forEach((text) => {
      if (text.isDragging || text.isResizing) {
        text.isDragging = false;
        text.isResizing = false;
      }
    });
  }

  isWithinBounds(mouseX, mouseY, text) {
    return (
      mouseX >= text.x &&
      mouseX <= text.x + text.width &&
      mouseY >= text.y &&
      mouseY <= text.x + text.height
    );
  }

  isWithinResizeHandle(mouseX, mouseY, text) {
    return (
      mouseX > text.x + text.width &&
      mouseX <= text.x + text.width + this.tolerance &&
      mouseY > text.y + text.height &&
      mouseY <= text.y + text.height + this.tolerance
    );
  }
}
