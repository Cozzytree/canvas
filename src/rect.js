import Shapes from "./shape.js";
import { context } from "./selectors";

export default class Rectangle extends Shapes {
  constructor(x, y, width = 100, height = 100) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = "rect";
    this.pointTo = [];
  }

  drawRect(rect) {
    const radius = 10;
    context.beginPath();
    context.moveTo(rect.x + radius, rect.y);
    context.arcTo(
      rect.x + rect.width,
      rect.y,
      rect.x + rect.width,
      rect.y + rect.height,
      radius
    );
    context.arcTo(
      rect.x + rect.width,
      rect.y + rect.height,
      rect.x,
      rect.y + rect.height,
      radius
    );
    context.arcTo(rect.x, rect.y + rect.height, rect.x, rect.y, radius);
    context.arcTo(rect.x, rect.y, rect.x + rect.width, rect.y, radius);
    context.closePath();
    context.stroke();
  }
}
