import { changeStyle } from "./events.js";
import { config } from "./config.js";
import {
  canvas,
  pencil,
  context,
  // canvasTextContext,
  // canvasText,
} from "./selectors.js";

//for pencil drawing

const setText = document.getElementById("Text");

export const circleMap = new Map();
export const rectMap = new Map();
export const pencilMap = new Map();
export const textMap = new Map();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export class Shapes {
  constructor() {
    this.tolerance = 6.5;
    this.lineWidth = 2;
    this.isDragging = false;
    this.isActive = false;
    this.isResizing = false;
    this.horizontelResizing = false;
    this.verticalResizing = false;

    // document.addEventListener("click", function (event) {
    //   // Check if the Ctrl key is pressed
    //   if (event.ctrlKey) {
    //     // Handle Ctrl+click event
    //     console.log("Ctrl key was pressed while clicking");
    //     // Place your custom logic here
    //   }
    // });

    canvas.addEventListener("click", (e) => {
      const clickX = e.clientX - canvas.getBoundingClientRect().left;
      const clickY = e.clientY - canvas.getBoundingClientRect().top;
      if (config.mode === "pencil") return;
      // Reset all shapes to inactive
      rectMap.forEach((rect) => (rect.isActive = false));
      circleMap.forEach((circle) => (circle.isActive = false));
      let circle = null;
      let square = null;

      // Check if the click is within any rectangle
      for (const [key, rect] of rectMap) {
        if (
          clickX >= rect.x &&
          clickX <= rect.x + rect.width &&
          clickY >= rect.y &&
          clickY <= rect.y + rect.height
        ) {
          if (square === null || square.width > rect.width) {
            square = rect;
          }
        }
      }
      for (const [key, arc] of circleMap) {
        if (
          clickX > arc.x - arc.xRadius &&
          clickX <= arc.x + arc.xRadius &&
          clickY >= arc.y - arc.yRadius &&
          clickY <= arc.y + arc.yRadius
        ) {
          if (circle === null || arc.xRadius > arc.xRadius) {
            circle = arc;
          }
        }
      }

      if (circle && !square) {
        circle.isActive = true;
      } else if (!circle && square) {
        square.isActive = true;
      } else if (circle && square) {
        if (
          square.x < circle.x - circle.xRadius &&
          square.x + square.width > circle.x + circle.xRadius
        ) {
          circle.isActive = true;
        } else {
          square.isActive = true;
        }
      }
      this.draw();
    });

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "a") {
        rectMap.forEach((rect) => {
          rect.isActive = true;
        });
        circleMap.forEach((arc) => {
          arc.isActive = true;
        });
        textMap.forEach((text) => {
          text.isActive = true;
        });
        this.draw();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        //remove selected square
        rectMap.forEach((rect, key) => {
          if (rect.isActive === true) {
            rectMap.delete(key);
          }
        });
        //remove selected arcs
        circleMap.forEach((arc, key) => {
          if (arc.isActive === true) {
            circleMap.delete(key);
          }
        });

        textMap.forEach((text, key) => {
          if (text.isActive) {
            textMap.delete(key);
          }
        });
        this.draw();
      }
    });

    canvas.addEventListener("mousedown", this.mouseDownForActive.bind(this));
  }

  draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    rectMap.forEach((rect) => {
      const radius = 10; // Adjust the radius for the desired roundness
      const x = rect.x;
      const y = rect.y;
      const width = rect.width;
      const height = rect.height;

      if (rect.isActive) {
        context.save();
        const dotRadius = 5;
        context.lineWidth = 1;
        context.strokeStyle = "rgb(2, 211, 134)";
        context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

        // top left
        context.beginPath();
        context.arc(
          rect.x - this.tolerance,
          rect.y - this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // top right
        context.beginPath();
        context.arc(
          rect.x + rect.width + this.tolerance,
          rect.y - this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // bottom right
        context.beginPath();
        context.arc(
          rect.x + rect.width + this.tolerance,
          rect.y + rect.height + this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // bottom left
        context.beginPath();
        context.arc(
          rect.x - this.tolerance,
          rect.y + rect.height + this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // Draw the rectangle using canvas rect method
        context.beginPath();
        context.rect(
          x - this.tolerance,
          y - this.tolerance,
          width + 2 * this.tolerance,
          height + 2 * this.tolerance
        );
        context.stroke();

        context.restore();
      } else {
        context.strokeStyle = "white";
      }

      context.beginPath();
      context.moveTo(x + radius, y);
      context.arcTo(x + width, y, x + width, y + height, radius);
      context.arcTo(x + width, y + height, x, y + height, radius);
      context.arcTo(x, y + height, x, y, radius);
      context.arcTo(x, y, x + width, y, radius);
      context.closePath();
      context.stroke();
    });

    const dotRadius = 5;
    circleMap.forEach((sphere) => {
      const x = sphere.x - sphere.xRadius;
      const y = sphere.y - sphere.yRadius;
      const width = sphere.x + sphere.xRadius;
      const height = sphere.y + sphere.yRadius;
      if (sphere.isActive) {
        context.save(); // Save the current drawing state

        context.strokeStyle = "rgb(2, 211, 134)";
        context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

        //top left
        context.beginPath();
        context.arc(
          x - this.tolerance,
          y - this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // top right
        context.beginPath();
        context.arc(
          width + this.tolerance,
          y - this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // bottom right
        context.beginPath();
        context.arc(
          width + this.tolerance,
          height + this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // bottom left
        context.beginPath();
        context.arc(
          x - this.tolerance,
          height + this.tolerance,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();

        // Draw the rectangle using canvas rect method
        context.beginPath();
        context.rect(
          x - this.tolerance,
          y - this.tolerance,
          2 * sphere.xRadius + 2 * this.tolerance,
          2 * sphere.yRadius + 2 * this.tolerance
        );
        context.stroke();

        context.restore(); // Restore the previous drawing state
      }
      context.beginPath();
      context.strokeStyle = "white";
      context.ellipse(
        sphere.x,
        sphere.y,
        sphere.xRadius,
        sphere.yRadius,
        0,
        0,
        2 * Math.PI
      );
      context.closePath();
      context.stroke();
    });

    context.save();
    pencilMap.forEach((pencil) => {
      context.beginPath();
      pencil.forEach((coor, index) => {
        if (index === 0) {
          context.moveTo(coor.x, coor.y); // Move to the first point
        } else {
          // Use quadraticCurveTo for drawing curved lines
          const prevCoor = pencil[index - 1];
          const cx = (coor.x + prevCoor.x) / 2; // Control point x-coordinate
          const cy = (coor.y + prevCoor.y) / 2; // Control point y-coordinate
          context.quadraticCurveTo(prevCoor.x, prevCoor.y, cx, cy); // Draw a quadratic curve
        }
      });

      // Set line properties
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 1.6;
      context.strokeStyle = "#dcdcdc";
      context.stroke();
      context.closePath();
    });
    context.restore();

    // context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    context.save();
    context.fillStyle = "white";
    context.lineWidth = 1;
    textMap.forEach((t) => {
      if (t.isActive) {
        context.save();
        context.strokeStyle = "rgb(2, 211, 134)";
        context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

        //dots
        //top left
        context.beginPath();
        context.arc(
          t.x - this.tolerance,
          t.y - this.tolerance,
          4,
          0,
          2 * Math.PI,
          false
        );
        context.fill();

        //top right
        context.beginPath();
        context.arc(
          t.x + t.width + this.tolerance,
          t.y - this.tolerance,
          4,
          0,
          2 * Math.PI,
          false
        );
        context.fill();

        //bottom right
        context.beginPath();
        context.arc(
          t.x + t.width + this.tolerance,
          t.y + t.height + this.tolerance,
          4,
          0,
          2 * Math.PI,
          false
        );
        context.fill();

        //bottom left
        context.beginPath();
        context.arc(
          t.x - this.tolerance,
          t.y + t.height + this.tolerance,
          4,
          0,
          2 * Math.PI,
          false
        );
        context.fill();

        context.beginPath();
        context.rect(
          t.x - t.tolerance,
          t.y - t.tolerance,
          2 * this.tolerance + t.width,
          2 * this.tolerance + t.height
        );
        context.stroke();

        context.restore();
      }
      // Set the font size before measuring the text
      context.font = `${t.size}px Arial`;

      // Measure the text
      const textMetrics = context.measureText(t.content);
      t.width = textMetrics.width;
      t.height =
        textMetrics.actualBoundingBoxAscent +
        textMetrics.actualBoundingBoxDescent;

      // Draw the text, adjusting the y coordinate
      context.fillText(
        t.content,
        t.x,
        t.y + textMetrics.actualBoundingBoxAscent
      );
    });
    context.restore();
  }

  mouseDownForActive(e) {
    if (config.mode === "pencil") return;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    let smallestCircle = null;
    let smallestRect = null;

    rectMap.forEach((rect) => {
      if (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
      ) {
        if (smallestRect === null || rect.width < smallestRect.width) {
          smallestRect = rect;
        }
      }
    });

    for (const [_, sphere] of circleMap) {
      const distance = Math.sqrt(
        (mouseX - sphere.x) ** 2 + (mouseY - sphere.y) ** 2
      );

      if (sphere.isActive) sphere.isActive = false;
      if (distance < sphere.xRadius && distance < sphere.yRadius) {
        if (
          smallestCircle === null ||
          (sphere.xRadius < smallestCircle.xRadius &&
            sphere.yRadius < smallestCircle.yRadius)
        ) {
          smallestCircle = sphere;
        }
      }
    }

    if (!smallestRect && smallestCircle) {
      smallestCircle.isDragging = true;
      smallestCircle.isActive = true;
      smallestCircle.offsetX = mouseX - smallestCircle.x;
      smallestCircle.offsetY = mouseY - smallestCircle.y;
    } else if (smallestRect && !smallestCircle) {
      smallestRect.isDragging = true;
      smallestRect.isActive = true;
      smallestRect.offsetX = mouseX - smallestRect.x;
      smallestRect.offsetY = mouseY - smallestRect.y;
    } else if (smallestCircle && smallestRect) {
      if (
        smallestCircle.xRadius * 2 * smallestCircle.xRadius <
        smallestRect.width * smallestRect.height
      ) {
        smallestCircle.isActive = true;
        smallestCircle.isDragging = true;
        smallestCircle.offsetX = mouseX - smallestCircle.x;
        smallestCircle.offsetY = mouseY - smallestCircle.y;
      } else {
        smallestRect.isActive = true;
        smallestRect.isDragging = true;
        smallestRect.offsetX = mouseX - smallestRect.x;
        smallestRect.offsetY = mouseY - smallestRect.y;
      }
    }
  }

  mouseDownforResizing(e) {}
}

export class Rectangle extends Shapes {
  constructor(x, y, width = 100, height = 100) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));

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

  mouseDownforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    let activeRect = null;

    rectMap.forEach((rect) => {
      // Check for horizontal resizing
      const leftEdge =
        mouseX >= rect.x - this.tolerance && mouseX <= rect.x + this.tolerance;
      const rightEdge =
        mouseX >= rect.x + rect.width - this.tolerance &&
        mouseX <= rect.x + rect.width + this.tolerance;
      const verticalBounds =
        mouseY > rect.y + this.tolerance &&
        mouseY < rect.y + rect.height - this.tolerance;

      if ((leftEdge || rightEdge) && verticalBounds) {
        rect.isActive = true;
        rect.horizontalResizing = true;
        activeRect = rect;
      }

      // vertical resizing //
      const withinTopEdge =
        mouseY >= rect.y - this.tolerance && mouseY <= rect.y + this.tolerance;
      const withinBottomEdge =
        mouseY >= rect.y + rect.height - this.tolerance &&
        mouseY <= rect.y + rect.height + this.tolerance;
      const withinHorizontalBounds =
        mouseX > rect.x + this.tolerance &&
        mouseX < rect.x + rect.width - this.tolerance;

      if ((withinTopEdge || withinBottomEdge) && withinHorizontalBounds) {
        rect.isActive = true;
        rect.verticalResizing = true;
        activeRect = rect;
      }

      // Check for corners resize
      const withinTopLeftCorner =
        mouseX >= rect.x - this.tolerance &&
        mouseX <= rect.x + this.tolerance &&
        mouseY >= rect.y - this.tolerance &&
        mouseY <= rect.y + this.tolerance;

      const withinTopRightCorner =
        mouseX >= rect.x + rect.width - this.tolerance &&
        mouseX <= rect.x + rect.width + this.tolerance &&
        mouseY >= rect.y - this.tolerance &&
        mouseY <= rect.y + this.tolerance;

      const withinBottomLeftCorner =
        mouseX >= rect.x - this.tolerance &&
        mouseX <= rect.x + this.tolerance &&
        mouseY >= rect.y + rect.height - this.tolerance &&
        mouseY <= rect.y + rect.height + this.tolerance;

      const withinBottomRightCorner =
        mouseX >= rect.x + rect.width - this.tolerance &&
        mouseX <= rect.x + rect.width + this.tolerance &&
        mouseY >= rect.y + rect.height - this.tolerance &&
        mouseY <= rect.y + rect.height + this.tolerance;

      if (
        withinTopLeftCorner ||
        withinTopRightCorner ||
        withinBottomLeftCorner ||
        withinBottomRightCorner
      ) {
        rect.isActive = true;
        rect.isResizing = true;
        activeRect = rect;
      }
    });

    // Prevent dragging if resizing
    if (activeRect) {
      this.isDragging = false;
    } else {
      // Fallback to dragging if no resizing active
      this.mouseDownForActive(e);
    }
  }

  mouseMoveforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    rectMap.forEach((rect) => {
      if (rect.horizontelResizing) {
        const oldPosition = rect.x + rect.width;
        const newX = mouseX > rect.x ? rect.x : mouseX;

        rect.x = newX;
        if (mouseX < oldPosition) {
          rect.width = Math.abs(oldPosition - mouseX);
        } else if (mouseX > oldPosition) rect.width = Math.abs(mouseX - rect.x); // Adjust width when mouseX is below rect.x

        // rect.width = Math.abs(mouseX - rect.x); // Adjust width normally when mouseX is to the right

        rect.draw();
      }

      if (rect.verticalResizing) {
        const oldPosition = rect.y + rect.height;
        const newY = mouseY > rect.y ? rect.y : mouseY;

        rect.y = newY;
        if (mouseY < oldPosition) {
          rect.height = Math.abs(oldPosition - mouseY);
        } else if (mouseY > oldPosition)
          rect.height = Math.abs(mouseY - rect.y);

        rect.draw();
      }

      if (rect.isResizing) {
        rect.isActive = true;
        rect.width = Math.abs(
          e.clientX - canvas.getBoundingClientRect().left - rect.x
        );
        rect.height = Math.abs(
          e.clientY - canvas.getBoundingClientRect().top - rect.y
        );
        rect.draw();
      }
    });
  }

  mouseUpforResizing() {
    rectMap.forEach((rect) => {
      rect.isActive = true;
      rect.isResizing = false;
      rect.verticalResizing = false;
      rect.horizontelResizing = false;
    });
  }
}

export class Circle extends Shapes {
  constructor(x, y, xRadius = 50, yRadius = 50) {
    super();
    this.x = x;
    this.y = y;
    this.xRadius = xRadius;
    this.yRadius = yRadius;

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

export class Pencil extends Shapes {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
}

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

    canvas.addEventListener("mousedown", this.resizeParameters.bind(this));
    canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
    canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
  }

  mouseDown(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    textMap.forEach((text) => {
      if (
        mouseX >= text.x - this.tolerance &&
        mouseX <= text.x + text.width &&
        mouseY >= text.y - this.tolerance &&
        mouseY <= text.x + text.height
      ) {
        text.isActive = true;
        text.isDragging = true;
        text.offsetX = mouseX - text.x;
        text.offsetY = mouseY - text.y;
        text.draw();
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
        text.draw();
      }
    });
  }

  mouseUp(e) {
    textMap.forEach((text) => {
      if (text.isDragging) {
        text.isDragging = false;
      }
    });
  }

  resizeParameters(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // horizontel
    textMap.forEach((text) => {
      const left = mouseX >= text.x - this.tolerance && mouseX <= text.x;
      const right =
        mouseX >= text.x + text.width &&
        mouseX <= text.x + text.width + this.tolerance;
      const topBottom =
        mouseY >= text.y - 2.5 * text.tolerance &&
        mouseY <= text.y + text.height - this.tolerance;

      if ((left || right) && topBottom) {
        text.horizontalResizing = true;
        text.isActive = true;
      }
    });
  }
  mouseMoveResize(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    textMap.forEach((text) => {
      let initialMouseX = 0;
      let initialSize = 0;
      if (text.horizontalResizing) {
        // text.width = Math.abs(mouseX - text.x);
        const deltaX = mouseX - initialMouseX;
        const newSize = initialSize + deltaX / 15; // Adjust this divisor to control sensitivity
        text.size = Math.max(newSize, 10);
        text.draw();
      }
    });
  }

  mouseUpResize(e) {
    textMap.forEach((text) => {
      if (text.horizontalResizing) {
        text.horizontalResizing = false;
      }
    });
  }
}

new Shapes();
