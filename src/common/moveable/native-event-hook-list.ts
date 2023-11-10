import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {setDirection} from "@/common/method/set-direction";
import {MoveableManager} from "@/common/moveable/moveable";
import {getWidgetsName} from "@/utils/method";

export default function createNativeEventHookList(moveableManger: MoveableManager) {
  return [
    {
      name: 'mousedown',
      call: (ev: MouseEvent) => {
        const clickEl = getElement4EventTarget(ev)
        if (!clickEl) return
        const widgetsName = getWidgetsName(clickEl, true)
        // console.log(widgetsName);
      }
    },
    {
      name: 'mousemove',
      call: throttle((ev: MouseEvent) => {
        const overEl = getElement4EventTarget(ev)
        if (!overEl || ev.buttons !== 0 /*  鼠标未按下才自动跳框 */) return
        moveableManger.activeWidgets(overEl)
      }, 160)
    },
    {
      name: 'mousemove',
      call: throttle((ev: MouseEvent) => {
        const clickTarget = getElement4EventTarget(<any>ev)
        if (!clickTarget) return
        setDirection(moveableManger.moveable, clickTarget)
      }, 120),
      options: true
    },
  ]
}
