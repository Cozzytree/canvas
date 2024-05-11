import { Shapes } from "./main";
import { rectArray } from "./main";

class Rectangle extends Shapes {
  constructor(x, y, width = 100, height = 100) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));

    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mousemove", this.mouseMoveforResizing.bind(this));

    canvas.addEventListener("mouseup", this.mouseUp.bind(this));
    canvas.addEventListener("mouseup", this.mouseUpforResizing.bind(this));
    // canvas.addEventListener("mouseover",)
  }

  mouseDown(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    // Check if the mouse is inside any rectangle
    rectArray.forEach((rect) => {
      if (rect.isActive) rect.isActive = false;
      if (
        mouseX > rect.x + 10 &&
        mouseX < rect.x + rect.width - 10 &&
        mouseY > rect.y + 10 &&
        mouseY < rect.y + rect.height - 10
      ) {
        rect.isActive = true;
        rect.isDragging = true;
        rect.offsetX = mouseX - rect.x;
        rect.offsetY = mouseY - rect.y;
      }
    });
  }

  mouseMove(event) {
    rectArray.forEach((rect) => {
      if (rect.isDragging) {
        rect.x =
          event.clientX - canvas.getBoundingClientRect().left - rect.offsetX;
        rect.y =
          event.clientY - canvas.getBoundingClientRect().top - rect.offsetY;
        rect.draw();
      }
    });
  }

  mouseUp() {
    rectArray.forEach((rect) => {
      rect.isDragging = false;
    });
  }

  mouseDownforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const width = 10;
    rectArray.forEach((rect) => {
      // horizaontal resizing //

      if (
        (mouseX >= rect.x - width && mouseX <= rect.x + width) || // Left edge
        (mouseX >= rect.x + rect.width - width &&
          mouseX <= rect.x + rect.width + width &&
          mouseY > rect.y + width &&
          mouseY < rect.y + rect.height - width)
      ) {
        rect.isActive = true;
        rect.horizontelResizing = true;
      }

      // vertical resizing //
      if (
        (mouseY >= rect.y - width && mouseY <= rect.y + width) ||
        (mouseY >= rect.y + rect.height - width &&
          mouseY <= rect.y + rect.height + width &&
          mouseX > rect.x + width &&
          mouseX < rect.x + rect.width - width)
      ) {
        rect.isActive = true;
        rect.verticalResizing = true;
      }

      // corners resize //
      if (
        // Top-left corner
        (mouseX >= rect.x - width &&
          mouseX <= rect.x + width &&
          mouseY >= rect.y - width &&
          mouseY <= rect.y + width) ||
        // Top-right corner
        (mouseX >= rect.x + rect.width - width &&
          mouseX <= rect.x + rect.width + width &&
          mouseY >= rect.y - width &&
          mouseY <= rect.y + width) ||
        // Bottom-left corner
        (mouseX >= rect.x - width &&
          mouseX <= rect.x + width &&
          mouseY >= rect.y + rect.height - width &&
          mouseY <= rect.y + rect.height + width) ||
        // Bottom-right corner
        (mouseX >= rect.x + rect.width - width &&
          mouseX <= rect.x + rect.width + width &&
          mouseY >= rect.y + rect.height - width &&
          mouseY <= rect.y + rect.height + width)
      ) {
        rect.isActive = true;
        rect.isResizing = true;
      }
    });
  }

  mouseMoveforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    rectArray.forEach((rect) => {
      if (rect.horizontelResizing) {
        const oldPosition = rect.x + rect.width;
        const newX = mouseX > rect.x ? rect.x : mouseX;

        if (mouseX < rect.x) {
          rect.width = oldPosition - mouseX; // Adjust width when mouseX is below rect.x
        } else {
          rect.width = mouseX - rect.x; // Adjust width normally when mouseX is to the right
        }

        rect.x = newX;
        console.log("X", rect.x, "mousex", mouseX, "old", oldPosition);
        rect.draw();
      }

      if (rect.verticalResizing) {
        const oldPosition = rect.y + rect.height;
        const newY = mouseY > rect.y ? rect.y : mouseY;

        if (mouseY < rect.y) {
          rect.height = oldPosition - mouseY; // Adjust width when mouseX is below rect.x
        } else {
          rect.height = mouseY - rect.Y; // Adjust width normally when mouseX is to the right
        }

        rect.Y = newY;
        rect.draw();
      }
      if (rect.isResizing) {
        rect.isActive = true;
        rect.width = e.clientX - canvas.getBoundingClientRect().left - rect.x;
        rect.height = e.clientY - canvas.getBoundingClientRect().top - rect.y;
        rect.draw();
      }
    });
  }
  mouseUpforResizing() {
    rectArray.forEach((rect) => {
      rect.isActive = true;
      rect.isResizing = false;
      rect.verticalResizing = false;
      rect.horizontelResizing = false;
    });
  }
}

export const Rect = new Rectangle();
