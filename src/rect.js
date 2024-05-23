import { Shapes, rectMap } from "./main";
import { config } from "./config";

export class Rectangle extends Shapes {
  constructor(x, y, width = 100, height = 100) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));

    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mousemove", this.mouseMoveforResizing.bind(this));

    canvas.addEventListener("mouseup", this.mouseUp.bind(this));
    canvas.addEventListener("mouseup", this.mouseUpforResizing.bind(this));
  }

  mouseMove(event) {
    if (config.mode === "pencil") return;
    rectMap.forEach((rect) => {
      if (rect.isDragging) {
        rect.isActive = true;
        rect.x =
          event.clientX - canvas.getBoundingClientRect().left - rect.offsetX;
        rect.y =
          event.clientY - canvas.getBoundingClientRect().top - rect.offsetY;
        rect.draw();
      }
    });
  }

  mouseUp(e) {
    if (config.mode === "pencil") return;
    rectMap.forEach((rect) => {
      if (rect.isDragging) {
        rect.x = e.clientX - canvas.getBoundingClientRect().left - rect.offsetX;
        rect.y = e.clientY - canvas.getBoundingClientRect().top - rect.offsetY;
        rect.draw();
        rect.isDragging = false;
      }
    });
  }

  // mouseDownforResizing(e) {
  //   const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  //   const mouseY = e.clientY - canvas.getBoundingClientRect().top;

  //   rectMap.forEach((rect) => {
  //     // Check for horizontal resizing
  //     const leftEdge =
  //       mouseX >= rect.x - this.tolerance && mouseX <= rect.x + this.tolerance;
  //     const rightEdge =
  //       mouseX >= rect.x + rect.width - this.tolerance &&
  //       mouseX <= rect.x + rect.width + this.tolerance;
  //     const verticalBounds =
  //       mouseY > rect.y + this.tolerance &&
  //       mouseY < rect.y + rect.height - this.tolerance;

  //     if ((leftEdge || rightEdge) && verticalBounds) {
  //       console.log("true");
  //       rect.isActive = true;
  //       rect.horizontalResizing = true;
  //     }

  //     // vertical resizing //
  //     const withinTopEdge =
  //       mouseY >= rect.y - this.tolerance && mouseY <= rect.y + this.tolerance;
  //     const withinBottomEdge =
  //       mouseY >= rect.y + rect.height - this.tolerance &&
  //       mouseY <= rect.y + rect.height + this.tolerance;
  //     const withinHorizontalBounds =
  //       mouseX > rect.x + this.tolerance &&
  //       mouseX < rect.x + rect.width - this.tolerance;

  //     if ((withinTopEdge || withinBottomEdge) && withinHorizontalBounds) {
  //       rect.isActive = true;
  //       rect.verticalResizing = true;
  //     }

  //     // Check for corners resize
  //     const withinTopLeftCorner =
  //       mouseX >= rect.x - this.tolerance &&
  //       mouseX <= rect.x + this.tolerance &&
  //       mouseY >= rect.y - this.tolerance &&
  //       mouseY <= rect.y + this.tolerance;

  //     const withinTopRightCorner =
  //       mouseX >= rect.x + rect.width - this.tolerance &&
  //       mouseX <= rect.x + rect.width + this.tolerance &&
  //       mouseY >= rect.y - this.tolerance &&
  //       mouseY <= rect.y + this.tolerance;

  //     const withinBottomLeftCorner =
  //       mouseX >= rect.x - this.tolerance &&
  //       mouseX <= rect.x + this.tolerance &&
  //       mouseY >= rect.y + rect.height - this.tolerance &&
  //       mouseY <= rect.y + rect.height + this.tolerance;

  //     const withinBottomRightCorner =
  //       mouseX >= rect.x + rect.width - this.tolerance &&
  //       mouseX <= rect.x + rect.width + this.tolerance &&
  //       mouseY >= rect.y + rect.height - this.tolerance &&
  //       mouseY <= rect.y + rect.height + this.tolerance;

  //     if (
  //       withinTopLeftCorner ||
  //       withinTopRightCorner ||
  //       withinBottomLeftCorner ||
  //       withinBottomRightCorner
  //     ) {
  //       rect.isActive = true;
  //       rect.isResizing = true;
  //     }
  //   });
  // }

  mouseMoveforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    rectMap.forEach((rect) => {
      if (rect.horizontalResizing) {
        const oldPosition = rect.x + rect.width;
        const newX = mouseX > rect.x ? rect.x : mouseX;

        rect.x = newX;
        if (mouseX < oldPosition) {
          rect.width = Math.abs(oldPosition - mouseX);
        } else if (mouseX > oldPosition) rect.width = Math.abs(mouseX - rect.x); // Adjust width when mouseX is below rect.x

        // rect.width = Math.abs(mouseX - rect.x); // Adjust width normally when mouseX is to the right
      } else if (rect.verticalResizing) {
        const oldPosition = rect.y + rect.height;
        const newY = mouseY > rect.y ? rect.y : mouseY;

        rect.y = newY;
        if (mouseY < oldPosition) {
          rect.height = Math.abs(oldPosition - mouseY);
        } else if (mouseY > oldPosition)
          rect.height = Math.abs(mouseY - rect.y);
      } else if (rect.isResizing) {
        rect.isActive = true;
        rect.width = Math.abs(
          e.clientX - canvas.getBoundingClientRect().left - rect.x
        );
        rect.height = Math.abs(
          e.clientY - canvas.getBoundingClientRect().top - rect.y
        );
      }
      rect.draw();
    });
  }

  mouseUpforResizing() {
    rectMap.forEach((rect) => {
      rect.isActive = true;
      rect.isResizing = false;
      rect.verticalResizing = false;
      rect.horizontalResizing = false;
    });
  }
}