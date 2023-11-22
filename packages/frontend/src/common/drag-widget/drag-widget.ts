import {editorStore} from "@/store/editor";
import {getElement4EventTarget} from "@/utils/tool";
import mitt, {Emitter} from "mitt";
import {Material} from "@type/layout";
import {parseWidget4DomChain} from "@/utils/method";
import {toRaw} from "vue";

/**
 * 用于支持物料拖动
 * */
export class DragWidgetManager {
  public __running: boolean = false
  public bus: Emitter<{ drop: Material }>

  constructor() {
    this.bus = mitt()
  }

  public start() {
    if (this.__running) return
    this.__running = true
    const self = this
    let draggingTarget: HTMLElement | null = null
    let dragOffsetInTarget = {
      left: 0,
      top: 0
    }
    let dragSourceTargetRect: DOMRect | null = null

    function mousemove(ev: MouseEvent) {
      if (!draggingTarget || !dragSourceTargetRect) return
      const currentDraggingMaterial = editorStore.currentDraggingMaterial
      if (!currentDraggingMaterial) return
      let scale = (ev.clientX - dragOffsetInTarget.left) / dragSourceTargetRect.left
      draggingTarget.style.left = `${ev.clientX - dragOffsetInTarget.left}px`
      draggingTarget.style.top = `${ev.clientY - dragOffsetInTarget.top}px`
      draggingTarget.style.opacity = '1'
      draggingTarget.style.transform = `scale(${Math.max(1, Math.min(scale ** 2, 5))})`
    }

    function mouseup(ev: MouseEvent) {
      const currentDraggingMaterial = toRaw(editorStore.currentDraggingMaterial)
      const target: HTMLElement = getElement4EventTarget(ev)
      let finallyRect = draggingTarget.getBoundingClientRect()
      let editorAreaBoxRect = editorStore.editorAreaBoxTarget.getBoundingClientRect()
      document.body.removeChild(draggingTarget)
      dragOffsetInTarget = {left: 0, top: 0}
      dragSourceTargetRect = null
      editorStore.dragMaterial(null)
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
      const inCanvasInnerArea = parseWidget4DomChain(target, (node => node === editorStore.editorAreaBoxTarget))
      if (inCanvasInnerArea) {  // 如果没有拖动到画板上，则忽略
        const canvasScale = editorStore.getCurScaleValue()
        const dropInfo = {
          left: (finallyRect.left - editorAreaBoxRect.left) / canvasScale,
          top: (finallyRect.top - editorAreaBoxRect.top) / canvasScale,
          width: finallyRect.width / canvasScale,
          height: finallyRect.height / canvasScale,
        }
        // console.log(dropInfo)
        Object.assign(currentDraggingMaterial, dropInfo)
        self.bus.emit('drop', currentDraggingMaterial)
      }
    }

    document.addEventListener('dragstart', (ev) => {
      if (editorStore.currentDraggingMaterial) ev.preventDefault()
    })

    document.addEventListener('mousedown', (ev) => {
      if (!editorStore.currentDraggingMaterial) return
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseup)
      const sourceTarget: HTMLElement = getElement4EventTarget(ev)
      draggingTarget = <any>sourceTarget.cloneNode(true)
      draggingTarget.classList.add('dragging-material')
      draggingTarget.style.opacity = '0'
      document.body.appendChild(draggingTarget)
      const rect = sourceTarget.getBoundingClientRect()
      dragSourceTargetRect = rect
      dragOffsetInTarget = {
        left: ev.clientX - rect.left,
        top: ev.clientY - rect.top,
      }
    })
  }
}





