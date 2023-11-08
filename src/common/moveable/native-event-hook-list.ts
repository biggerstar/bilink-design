import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from "lodash-es";
import {setDirection} from "@/common/method/set-direction";
import {MoveableManager} from "@/common/moveable/moveable";

export default function createNativeEventHookList(moveableManger: MoveableManager) {
  return [
    {
      name: 'mousedown',
      call: (ev: MouseEvent) => {
        const curClickEl = getElement4EventTarget(ev)
        if (!curClickEl) return
        const widgetsName = moveableManger.getWidgetsName(curClickEl)
        if (!widgetsName) return moveableManger.deActive()
        moveableManger.activeElement = curClickEl
        moveableManger.active4EventTarget(ev)
      }
    },
    {
      name: 'mousemove',
      call: throttle((ev: MouseEvent) => {
        if (ev.buttons === 0) moveableManger.active4EventTarget(ev)  // 鼠标未按下才自动跳框
      }, 200)
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
