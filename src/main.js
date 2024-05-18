import "./events.js";
import { config } from "./config.js";

export const canvas = document.getElementById("canvas");
const newCircle = document.getElementById("newCircle");
const setText = document.getElementById("Text");
const freeMode = document.getElementById("freeMode");
const context = canvas.getContext("2d");
const newRect = document.getElementById("newRect");
const pencil = document.getElementById("pencil");

export const circleMap = new Map();
export const rectMap = new Map();
export const pencilMap = new Map();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export class Shapes {
  constructor() {
    this.tolerance = 5;
    this.lineWidth = 2;
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
          square = key;
          break;
        }
      }
      for (const [key, arc] of circleMap) {
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

      if (circleMap.get(circle) && !rectMap.get(square)) {
        circleMap.get(circle).isActive = true;
      } else if (!circleMap.get(circle) && rectMap.get(square)) {
        rectMap.get(square).isActive = true;
      } else if (circle && square) {
        const s = rectMap.get(square);
        const c = circleMap.get(circle);
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
        rectMap.forEach((rect) => {
          rect.isActive = true;
        });
        circleMap.forEach((arc) => {
          arc.isActive = true;
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
        this.draw();
      }
    });
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
    const gap = 5;
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
  }
}

export class Rectangle extends Shapes {
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
  }

  mouseDown(event) {
    console.log(event);
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    // Check if the mouse is inside any rectangle
    rectMap.forEach((rect) => {
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
    rectMap.forEach((rect) => {
      // if (rect.isDragging) {
      //   const offsetX =
      //     event.clientX - rect.offsetX - canvas.getBoundingClientRect().left;
      //   const offsetY =
      //     event.clientY - rect.offsetY - canvas.getBoundingClientRect().top;
      //   rect.x = Math.max(0, Math.min(canvas.width - rect.width, offsetX));
      //   rect.y = Math.max(0, Math.min(canvas.height - rect.height, offsetY));
      //   rect.draw();
      // }

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
    const tolerance = 10;
    rectMap.forEach((rect) => {
      // horizaontal resizing //
      if (
        (mouseX >= rect.x - tolerance && mouseX <= rect.x + tolerance) ||
        (mouseX >= rect.x + rect.width - tolerance &&
          mouseX <= rect.x + rect.width + tolerance &&
          mouseY > rect.y + tolerance &&
          mouseY < rect.y + rect.height - tolerance)
      ) {
        rect.isActive = true;
        rect.horizontelResizing = true;
      }

      // vertical resizing //
      if (
        (mouseY >= rect.y - tolerance && mouseY <= rect.y + tolerance) ||
        (mouseY >= rect.y + rect.height - tolerance &&
          mouseY <= rect.y + rect.height + tolerance &&
          mouseX > rect.x + tolerance &&
          mouseX < rect.x + rect.width - tolerance)
      ) {
        rect.isActive = true;
        rect.verticalResizing = true;
      }

      // corners resize //
      if (
        // Top-left corner
        (mouseX >= rect.x - tolerance &&
          mouseX <= rect.x + tolerance &&
          mouseY >= rect.y - tolerance &&
          mouseY <= rect.y + tolerance) ||
        // Top-right corner
        (mouseX >= rect.x + rect.width - tolerance &&
          mouseX <= rect.x + rect.width + tolerance &&
          mouseY >= rect.y - tolerance &&
          mouseY <= rect.y + tolerance) ||
        // Bottom-left corner
        (mouseX >= rect.x - tolerance &&
          mouseX <= rect.x + tolerance &&
          mouseY >= rect.y + rect.height - tolerance &&
          mouseY <= rect.y + rect.height + tolerance) ||
        // Bottom-right corner
        (mouseX >= rect.x + rect.width - tolerance &&
          mouseX <= rect.x + rect.width + tolerance &&
          mouseY >= rect.y + rect.height - tolerance &&
          mouseY <= rect.y + rect.height + tolerance)
      ) {
        rect.isActive = true;
        rect.isResizing = true;
      }
    });
  }

  mouseMoveforResizing(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    rectMap.forEach((rect) => {
      if (rect.horizontelResizing) {
        const oldPosition = rect.x + rect.width;
        const newX = mouseX > rect.x ? rect.x : mouseX;
        console.log(rect.x, rect.x + rect.width);

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
    circleMap.forEach((sphere) => {
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
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const width = 10;
    circleMap.forEach((arc) => {
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
    circleMap.forEach((arc) => {
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

// // add new circle
// newCircle.addEventListener("click", (e) => {
//   document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
//   config.mode = "circle";
//   const shape = document.createElement("div");
//   shape.classList.add("rectShape");
//   shape.style.width = "100px";
//   shape.style.height = "100px";
//   shape.style.position = "absolute";
//   shape.style.borderRadius = "100%";

//   document.addEventListener("mousemove", (e) => {
//     if (config.mode !== "circle") return;
//     shape.style.top = e.clientY + "px";
//     shape.style.left = e.clientX + "px";
//     document.body.append(shape);
//   });

//   canvas.addEventListener("click", (e) => {
//     shape.remove();
//     const x = e.clientX - canvas.getBoundingClientRect().left;
//     const y = e.clientY - canvas.getBoundingClientRect().top;
//     if (config.mode === "circle") {
//       const temp = new Circle(x + 50, y + 50);
//       circleMap.set(Math.random() * 10, temp);
//       temp.draw(); // Draw the new rectangle
//       config.mode = "free";
//     }
//   });
// });

// free mode
freeMode.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "free";
});

canvas.addEventListener("dblclick", function (event) {
  // Handle double click event
  if (event.target.tagName === "INPUT") return;

  const html = `<input type="text" class="w-[10ch] absolute px-[3px] text-[14px] outline-none bg-transparent focus:border-[1px] border-zinc-400/50 z-[999] shadow-sm" id="input"/>
  `;
  document.body.insertAdjacentHTML("afterbegin", html);
  const input = document.getElementById("input");
  input.style.left = event.clientX + "px";
  input.style.top = event.clientY + "px";
  input.focus();

  input.addEventListener("change", (e) => {
    context.font = "14px Arial";
    context.fillStyle = "white"; // Ensure fillStyle is set
    context.fillText(
      e.target.value,
      event.clientX - canvas.getBoundingClientRect().left,
      event.clientY - canvas.getBoundingClientRect().top + 5
    );
    input.remove();
  });
});

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentDrawingId = 0; // ID for the current drawing

pencil.addEventListener("click", () => {
  config.mode = "pencil";
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
});

function startDrawing(e) {
  if (config.mode !== "pencil") return;
  currentDrawingId++;
  isDrawing = true;
  [lastX, lastY] = [
    e.clientX - canvas.getBoundingClientRect().left,
    e.clientY - canvas.getBoundingClientRect().top,
  ];
}

function draw(e) {
  if (!isDrawing || config.mode !== "pencil") return;
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.beginPath();
  context.moveTo(lastX, lastY);
  context.lineTo(x, y);
  context.strokeStyle = "white"; // Set pencil color
  context.lineWidth = 2; // Set pencil thickness
  context.lineCap = "round";
  context.stroke();

  [lastX, lastY] = [x, y];

  // Store drawing data in the map
  if (!pencilMap.has(currentDrawingId)) {
    pencilMap.set(currentDrawingId, []);
  }
  pencilMap.get(currentDrawingId).push({ x, y });
}

function stopDrawing() {
  isDrawing = false;
}

// context.beginPath();
// [
//   { x: 100, y: 100 },
//   { x: 200, y: 200 },
//   { x: 430, y: 353, x: 500, y: 30 },
// ].forEach((coor, index) => {
//   if (index === 0) {
//     context.moveTo(coor.x, coor.y); // Move to the first point
//   } else {
//     context.lineTo(coor.x, coor.y); // Draw a line to subsequent points
//   }
// });
// context.strokeStyle = "white"; // Set pencil color
// context.lineWidth = 2; // Set pencil thickness
// context.lineCap = "round";
// context.stroke(); // Stroke the path to draw the lines
// context.closePath();
