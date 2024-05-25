import { Shapes, circleMap } from "./main";
import { config } from "./config";

export class Circle extends Shapes {
  constructor(x, y, xRadius = 50, yRadius = 50) {
    super();
    this.x = x;
    this.y = y;
    this.xRadius = xRadius;
    this.yRadius = yRadius;
    this.type = "sphere";

    // canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mouseup", this.mouseUp.bind(this));

    canvas.addEventListener("mousedown", this.mouseDownResize.bind(this));
    canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
    canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
  }

  // mouseDown(event) {
  //   if (config.mode === "pencil") return;
  //   const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  //   const mouseY = event.clientY - canvas.getBoundingClientRect().top;
  //   let smallestCircle = null;

  //   // Check if the mouse is inside any rectangle
  //   circleMap.forEach((sphere) => {
  //     const isInside = Math.sqrt(
  //       (mouseX - sphere.x) ** 2 + (mouseY - sphere.y) ** 2
  //     );

  //     if (sphere.isActive) sphere.isActive = false;
  //     if (isInside < sphere.xRadius && isInside < sphere.yRadius) {
  //       if (
  //         smallestCircle === null ||
  //         sphere.xRadius * sphere.yRadius <
  //           smallestCircle.xRadius * smallestCircle.yRadius
  //       ) {
  //         smallestCircle = sphere;
  //       }
  //     }
  //     if (smallestCircle) {
  //       smallestCircle.isActive = true;
  //       smallestCircle.isDragging = true;
  //       smallestCircle.offsetX = mouseX - smallestCircle.x;
  //       smallestCircle.offsetY = mouseY - smallestCircle.y;
  //       console.log(smallestCircle);
  //     }
  //   });
  // }

  mouseMove(event) {
    if (config.mode === "pencil") return;
    circleMap.forEach((arc) => {
      if (arc.isDragging) {
        arc.isActive = true;
        arc.x =
          event.clientX - canvas.getBoundingClientRect().left - arc.offsetX;
        arc.y =
          event.clientY - canvas.getBoundingClientRect().top - arc.offsetY;
        this.draw();
      }
    });
  }

  mouseUp() {
    circleMap.forEach((arc) => {
      arc.isDragging = false;
    });
  }

  mouseDownResize(e) {
    if (config.mode === "pencil") return;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const width = 10;

    circleMap.forEach((arc) => {
      const forXless = arc.x - arc.xRadius;
      const forXmore = arc.x + arc.xRadius;
      const forYless = arc.y - arc.yRadius;
      const forYmore = arc.y + arc.yRadius;

      //horizontel resizing
      const leftEdge =
        mouseX >= forXless - this.tolerance && mouseX <= forXless;
      const rightEdge =
        mouseX >= forXmore && mouseX <= forXmore + this.tolerance;
      const verticalBounds =
        mouseY >= forYless + this.tolerance &&
        mouseY <= forYmore - this.tolerance;

      if ((leftEdge || rightEdge) && verticalBounds) {
        arc.isActive = true; // Set the circle as active
        arc.horizontelResizing = true; // Set the horizontal resizing flag
      }

      //vertical resizing
      const topEdge = mouseY >= forYless - this.tolerance && mouseY <= forYless;
      const bottomEdge =
        mouseY >= forYmore && mouseY <= forYmore + this.tolerance;
      const horizontalBounds =
        mouseX >= forXless + width && mouseX <= forXmore - width;

      if ((topEdge || bottomEdge) && horizontalBounds) {
        arc.isActive = true;
        arc.verticalResizing = true; // set vertical resizing to true
      }

      //full resize
      if (
        // Top-left corner
        (mouseX >= forXless &&
          mouseX < forXless + this.tolerance &&
          mouseY > forYless - this.tolerance &&
          mouseY <= forYless) ||
        // Top-right corner
        (mouseX >= forXmore &&
          mouseX < forXmore + this.tolerance &&
          mouseY > forYless - this.tolerance &&
          mouseY <= forYless) ||
        // Bottom-left corner
        (mouseX >= forXless - this.tolerance &&
          mouseX <= forXless &&
          mouseY >= forYmore &&
          mouseY <= forYmore + this.tolerance) ||
        // Bottom-right corner
        (mouseX >= forXmore &&
          mouseX <= forXmore + this.tolerance &&
          mouseY >= forYmore &&
          mouseY <= forYmore + this.tolerance)
      ) {
        arc.isActive = true;
        arc.isResizing = true;
      }
    });
  }

  mouseMoveResize(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    circleMap.forEach((arc) => {
      if (arc.horizontelResizing) {
        arc.isActive = true;
        arc.xRadius = Math.abs(mouseX - arc.x);
        arc.draw();
      }
      if (arc.verticalResizing) {
        arc.isActive = true;
        arc.yRadius = Math.abs(mouseY - arc.y);
        arc.draw();
      }
      if (arc.isResizing) {
        arc.isActive = true;
        arc.xRadius = Math.abs(mouseX - arc.x);
        arc.yRadius = Math.abs(mouseY - arc.y);
        arc.draw();
      }
    });
  }

  mouseUpResize() {
    circleMap.forEach((arc) => {
      if (arc.horizontelResizing) {
        arc.horizontelResizing = false;
      }
      if (arc.verticalResizing) {
        arc.verticalResizing = false;
      }
      if (arc.isResizing) {
        arc.isResizing = false;
      }
    });
  }
}
