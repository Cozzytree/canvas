import { Shapes, arrows } from "./main";
import { canvas, context } from "./selectors";

export class Arrows extends Shapes {
  constructor(x, y, tox, toy) {
    super();
    this.x = x;
    this.y = y;
    this.tox = tox;
    this.toy = toy;
    this.isActive = false;
    this.isDragging = false;
    this.type = "arrow";

    this.mouseDownListener = this.mouseD.bind(this);
    this.mouseMoveListener = this.mouseMd.bind(this);
    this.mouseUpListener = this.mousep.bind(this);

    canvas.addEventListener("mousedown", this.mouseDownListener);
    canvas.addEventListener("mousemove", this.mouseMoveListener);
    canvas.addEventListener("mouseup", this.mouseUpListener);
  }

  mouseD(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    arrows.forEach((arrow) => {
      if (
        mouseX >= arrow.tox &&
        mouseX <= arrow.tox + this.tolerance &&
        mouseY >= arrow.toy &&
        mouseY <= arrow.toy + this.tolerance
      ) {
        arrow.isActive = true;
        arrow.isResizing = true;
      }
      if (arrow.x < arrow.tox) {
        if (
          mouseX >= arrow.x - this.tolerance &&
          mouseX <= arrow.tox + this.tolerance &&
          mouseY >= arrow.y - this.tolerance &&
          mouseY <= arrow.toy + this.tolerance &&
          !arrow.isActive
        ) {
          arrow.isActive = true;
          arrow.isDragging = true;
          arrow.dragOffsetX = mouseX - arrow.x;
          arrow.dragOffsetY = mouseY - arrow.y;
        }
      } else if (arrow.x > arrow.tox) {
        if (
          mouseX <= arrow.x + this.tolerance &&
          mouseX >= arrow.tox - this.tolerance &&
          mouseY >= arrow.y - this.tolerance &&
          mouseY <= arrow.toy + this.tolerance &&
          !arrow.isActive
        ) {
          arrow.isActive = true;
          arrow.isDragging = true;
          arrow.dragOffsetX = mouseX - arrow.x;
          arrow.dragOffsetY = mouseY - arrow.y;
        }
      }
    });
  }

  mouseMd(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    arrows.forEach((arrow) => {
      if (arrow.isResizing) {
        arrow.tox = mouseX;
        arrow.toy = mouseY;
      }

      if (arrow.isDragging) {
        const deltaX = mouseX - arrow.dragOffsetX;
        const deltaY = mouseY - arrow.dragOffsetY;
        const diffX = arrow.tox - arrow.x;
        const diffY = arrow.toy - arrow.y;

        arrow.x = deltaX;
        arrow.y = deltaY;
        arrow.tox = deltaX + diffX;
        arrow.toy = deltaY + diffY;
      }
    });

    this.draw();
  }

  mousep(e) {
    arrows.forEach((arrow) => {
      if (arrow.isDragging) {
        arrow.isDragging = false;
      }
      if (arrow.isResizing) {
        arrow.isResizing = false;
        console.log(arrow);
      }
    });
  }

  drawArrow(fromx, fromy, tox, toy, arrowWidth = 2, color = "black") {
    let headlen = 10;
    let angle = Math.atan2(toy - fromy, tox - fromx);

    context.save();
    context.strokeStyle = color;
    context.lineWidth = arrowWidth;

    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();

    context.beginPath();
    context.moveTo(tox, toy);
    context.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );
    context.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    );
    context.lineTo(tox, toy);
    context.stroke();

    context.restore();
  }
}
