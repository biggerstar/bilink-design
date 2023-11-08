import {MoveableOptions} from "moveable";

export default {
  'w-text': {
    // keepRatio: true,
    // keepRatioFinally: true,
    // clippable: true,
    // resizable: true,
    // scalable: true,
    draggable: true,
    rotatable: true,
    throttleDrag: 0,
    throttleResize: 0,
    throttleScale: 0,
    throttleRotate: 0,
    renderDirections: ["nw", "ne", "s", "se", "sw", "e"],
  }
} as Record<any, MoveableOptions>
