import { Shapes, arrows } from "./main";
import { context } from "./selectors";

export class Arrows extends Shapes {
  constructor(x, y, tox, toy) {
    super();
    this.x = x;
    this.y = y;
    this.tox = tox;
    this.toy = toy;
  }

  drawArrow(fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    let headlen = 10;
    let angle = Math.atan2(toy - fromy, tox - fromx);

    context.save();
    context.strokeStyle = color;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineWidth = arrowWidth;
    context.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    context.beginPath();
    context.moveTo(tox, toy);
    context.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );

    //path from the side point of the arrow, to the other side point
    context.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    );

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    context.lineTo(tox, toy);
    context.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );

    //draws the paths created above
    context.stroke();
    context.restore();
  }
}
