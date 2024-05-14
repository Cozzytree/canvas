"use strict";

export const canvas = document.getElementById("canvas");
const newCircle = document.getElementById("newCircle");
const setText = document.getElementById("Text");
const context = canvas.getContext("2d");
const newRect = document.getElementById("newRect");

let NEWSHAPE = false;
let SHAPE = null;

export const circleArray = new Map();
export const rectArray = new Map();

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight;

export class Shapes {
  constructor() {
    this.lineWidth = 1.5;
    this.isDragging = false;
    this.isActive = false;
    this.isResizing = false;
    this.horizontelResizing = false;
    this.verticalResizing = false;

    document.addEventListener("click", function (event) {
      // Check if the Ctrl key is pressed
      if (event.ctrlKey) {
        // Handle Ctrl+click event
        console.log("Ctrl key was pressed while clicking");
        // Place your custom logic here
      }
    });

    canvas.addEventListener("click", (e) => {
      const clickX = e.clientX - canvas.getBoundingClientRect().left;
      const clickY = e.clientY - canvas.getBoundingClientRect().top;

      // Reset all shapes to inactive
      rectArray.forEach((rect) => (rect.isActive = false));
      circleArray.forEach((circle) => (circle.isActive = false));

      let circle = null;
      let square = null;

      // Check if the click is within any rectangle
      for (const [key, rect] of rectArray) {
        if (
          clickX >= rect.x &&
          clickX <= rect.x + rect.width &&
          clickY >= rect.y &&
          clickY <= rect.y + rect.height
        ) {
          square = key;
          break;
        }
      }
      for (const [key, arc] of circleArray) {
        if (
          clickX > arc.x - arc.xRadius &&
          clickX <= arc.x + arc.xRadius &&
          clickY >= arc.y - arc.yRadius &&
          clickY <= arc.y + arc.yRadius
        ) {
          circle = key;
          break;
        }
      }

      if (circleArray.get(circle) && !rectArray.get(square)) {
        circleArray.get(circle).isActive = true;
      } else if (!circleArray.get(circle) && rectArray.get(square)) {
        rectArray.get(square).isActive = true;
      } else if (circle && square) {
        const s = rectArray.get(square);
        const c = circleArray.get(circle);
        if (s.x < c.x - c.xRadius && s.x + s.width > c.x + c.xRadius) {
          c.isActive = true;
        } else {
          s.isActive = true;
        }
      }

      this.draw();
    });
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "a") {
        rectArray.forEach((rect) => {
          rect.isActive = true;
        });
        circleArray.forEach((arc) => {
          arc.isActive = true;
        });
        this.draw();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete") {
        //remove selected square
        rectArray.forEach((rect, key) => {
          if (rect.isActive === true) {
            rectArray.delete(key);
          }
        });
        //remove selected arcs
        circleArray.forEach((arc, key) => {
          if (arc.isActive === true) {
            circleArray.delete(key);
          }
        });
        this.draw();
      }
    });
  }
  draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw all rectangles in rectArray

    rectArray.forEach((rect) => {
      if (rect.isActive) {
        context.save();
        const dotRadius = 5;
        context.lineWidth = 1;
        context.strokeStyle = "skyblue";
        context.fillStyle = "rgb(0, 149, 255)"; // Color for active dots
        context.beginPath();
        context.arc(rect.x, rect.y, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(rect.x + rect.width, rect.y, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(rect.x, rect.y + rect.height, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(
          rect.x + rect.width,
          rect.y + rect.height,
          dotRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
      } else context.strokeStyle = "white";

      const radius = 10; // Adjust the radius for the desired roundness
      const x = rect.x;
      const y = rect.y;
      const width = rect.width;
      const height = rect.height;
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
    const gap = 5;
    circleArray.forEach((sphere) => {
      if (sphere.isActive) {
        context.save(); // Save the current drawing state

        context.beginPath();
        context.strokeStyle = "skyblue";
        context.fillStyle = "rgb(0, 149, 255)"; // Color for active dots

        context.moveTo(
          sphere.x - sphere.xRadius,
          sphere.y - sphere.yRadius - gap
        );

        // Draw the top edge with rounded top-right corner
        context.arcTo(
          sphere.x + sphere.xRadius + gap,
          sphere.y - sphere.yRadius - gap,
          sphere.x + sphere.xRadius + gap,
          sphere.y - sphere.yRadius,
          gap
        );

        // Draw the right edge with rounded bottom-right corner
        context.arcTo(
          sphere.x + sphere.xRadius + gap,
          sphere.y + sphere.yRadius + gap,
          sphere.x - sphere.xRadius + gap,
          sphere.y + sphere.yRadius + gap,
          gap
        );

        // Draw the bottom edge with rounded bottom-left corner
        context.arcTo(
          sphere.x - sphere.xRadius - gap,
          sphere.y + sphere.yRadius + gap,
          sphere.x - sphere.xRadius,
          sphere.y - sphere.yRadius + gap,
          gap
        );

        // Draw the left edge with rounded top-left corner, completing the shape
        context.arcTo(
          sphere.x - sphere.xRadius - gap,
          sphere.y - sphere.yRadius - gap,
          sphere.x - sphere.xRadius,
          sphere.y - sphere.yRadius - gap,
          gap
        );

        context.stroke(); // Stroke the shape

        // Draw the dots
        //top left
        context.beginPath();
        context.arc(
          sphere.x - sphere.xRadius - dotRadius,
          sphere.y - sphere.yRadius - dotRadius,
          dotRadius,
          0,
          2 * Math.PI
        );
        context.fill();
        // //top Middle
        // context.beginPath();
        // context.arc(
        //   (sphere.x -
        //     sphere.xRadius -
        //     dotRadius +
        //     (sphere.x + sphere.xRadius + dotRadius)) *
        //     0.5,
        //   sphere.y - sphere.yRadius - dotRadius,
        //   dotRadius,
        //   0,
        //   2 * Math.PI
        // );
        // context.fill();

        // top right
        context.beginPath();
        context.arc(
          sphere.x + sphere.xRadius + dotRadius,
          sphere.y - sphere.yRadius - dotRadius,
          dotRadius,
          0,
          2 * Math.PI
        );
        context.fill();

        // //right middle
        // context.beginPath();
        // context.arc(
        //   sphere.x + sphere.xRadius + dotRadius,
        //   (sphere.y -
        //     sphere.yRadius -
        //     dotRadius +
        //     sphere.y +
        //     sphere.yRadius +
        //     dotRadius) *
        //     0.5,
        //   dotRadius,
        //   0,
        //   2 * Math.PI
        // );
        // context.fill();

        //bottom right
        context.beginPath();
        context.arc(
          sphere.x + sphere.xRadius + dotRadius,
          sphere.y + sphere.yRadius + dotRadius,
          dotRadius,
          0,
          2 * Math.PI
        );
        context.fill();

        //bottom mid
        // context.beginPath();
        // context.arc(
        //   (sphere.x -
        //     sphere.xRadius -
        //     dotRadius +
        //     (sphere.x + sphere.xRadius + dotRadius)) *
        //     0.5,
        //   sphere.y + sphere.yRadius + dotRadius,
        //   dotRadius,
        //   0,
        //   2 * Math.PI
        // );
        // context.fill();

        //bottom left
        context.beginPath();
        context.arc(
          sphere.x - sphere.xRadius - dotRadius,
          sphere.y + sphere.yRadius + dotRadius,
          dotRadius,
          0,
          2 * Math.PI
        );
        context.fill();

        //left mid
        // context.beginPath();
        // context.arc(
        //   sphere.x - sphere.xRadius - dotRadius,
        //   (sphere.y -
        //     sphere.yRadius -
        //     dotRadius +
        //     sphere.y +
        //     sphere.yRadius +
        //     dotRadius) *
        //     0.5,
        //   dotRadius,
        //   0,
        //   2 * Math.PI
        // );
        // context.fill();

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
  }
}

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
      // if (rect.isActive) rect.isActive = false;
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
        rect.isActive = true;
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
        console.log(rect.x, rect.x + rect.width);

        rect.width = Math.abs(mouseX - rect.x); // Adjust width when mouseX is below rect.x

        // rect.width = Math.abs(mouseX - rect.x); // Adjust width normally when mouseX is to the right

        rect.x = newX;
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

class Circle extends Shapes {
  constructor(x, y, xRadius = 50, yRadius = 50) {
    super();
    this.x = x;
    this.y = y;
    this.xRadius = xRadius;
    this.yRadius = yRadius;

    canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mouseup", this.mouseUp.bind(this));

    canvas.addEventListener("mousedown", this.mouseDownResize.bind(this));
    canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
    canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
  }

  mouseDown(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    // Check if the mouse is inside any rectangle
    const width = 10;
    circleArray.forEach((sphere) => {
      const isInside = Math.sqrt(
        (mouseX - sphere.x) ** 2 + (mouseY - sphere.y) ** 2
      );

      if (sphere.isActive) sphere.isActive = false;
      if (isInside < sphere.xRadius && isInside < sphere.yRadius) {
        sphere.isActive = true;
        sphere.isDragging = true;
        sphere.offsetX = mouseX - sphere.x;
        sphere.offsetY = mouseY - sphere.y;
      }
    });
  }

  mouseMove(event) {
    circleArray.forEach((arc) => {
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
    circleArray.forEach((arc) => {
      arc.isDragging = false;
    });
  }

  mouseDownResize(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const width = 10;
    circleArray.forEach((arc) => {
      const forXless = arc.x - arc.xRadius;
      const forXmore = arc.x + arc.xRadius;
      const forYless = arc.y - arc.yRadius;
      const forYmore = arc.y + arc.yRadius;

      //horizontel resizing
      if (
        (mouseX >= forXless - width && mouseX <= forXless) ||
        (mouseX <= forXmore + width &&
          mouseX >= forXmore &&
          mouseY >= forYless + width &&
          mouseY <= forYmore - width)
      ) {
        arc.isActive = true; // Set the circle as active
        arc.horizontelResizing = true; // Set the horizontal resizing flag
      }

      //vertical resizing
      if (
        (mouseY >= forYless - width && mouseY <= forYless) ||
        (mouseY <= forYmore &&
          mouseY >= forYmore - width &&
          mouseX >= forYless + width &&
          mouseX <= forYmore - width)
      ) {
        arc.isActive = true;
        arc.verticalResizing = true; // set vertical resizing to true
      }

      //full resize
      if (
        // Top-left corner
        (mouseX >= forXless - width &&
          mouseX <= forXless &&
          mouseY >= forYless - width &&
          mouseY <= forYless) ||
        // Top-right corner
        (mouseX >= forXmore &&
          mouseX < forXmore + width &&
          mouseY > forYless - width &&
          mouseY <= forYless) ||
        // Bottom-left corner
        (mouseX > forXless - width &&
          mouseX <= forXless &&
          mouseY < forYmore &&
          mouseY >= forYmore - width) ||
        // Bottom-right corner
        (mouseX >= forXmore - width &&
          mouseX <= forXmore &&
          mouseY >= forYmore - width &&
          mouseY <= forYmore)
      ) {
        arc.isResizing = true;
      }
    });
  }

  mouseMoveResize(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    circleArray.forEach((arc) => {
      if (arc.horizontelResizing) {
        arc.isActive = true;
        arc.xRadius = Math.abs(mouseX - arc.x);
        arc.draw();
      }
      if (arc.verticalResizing) {
        arc.isActive = true;
        arc.xRadius = Math.abs(mouseX - arc.x);
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
    circleArray.forEach((arc) => {
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

newRect.addEventListener("click", (e) => {
  NEWSHAPE = true;
  const shape = document.createElement("div");
  shape.classList.add("rectShape");
  shape.style.width = "100px";
  shape.style.height = "100px";
  shape.style.position = "absolute";

  document.addEventListener("mousemove", (e) => {
    if (!NEWSHAPE) return;
    shape.style.top = e.clientY + "px";
    shape.style.left = e.clientX + "px";
    document.body.append(shape);
  });

  // Listen for click on the canvas to place the rectangle inside it
  canvas.addEventListener("click", (e) => {
    shape.remove();
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    if (NEWSHAPE) {
      const temp = new Rectangle(x, y);
      rectArray.set(Math.random() * 10, temp);
      temp.draw(); // Draw the new rectangle
      NEWSHAPE = false; // Reset NEWSHAPE to null
    }
  });
});

// add new circle
newCircle.addEventListener("click", (e) => {
  for (const [key, circle] of circleArray.entries()) {
    if (circle.isActive) {
      circle.isActive = false;
    }
  }
  const arc = new Circle(Math.random() * 150, Math.random() * 150);
  circleArray.set(Math.random() * 10, arc);
  arc.draw();
});

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
