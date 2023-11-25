import {editorStore} from "@/store/editor";
import {getElement4EventTarget} from "@/utils/tool";
import mitt, {Emitter} from "mitt";
import {Material} from "@type/layout";
import {parseMaterial4DomChain, parseWidget4DomChain} from "@/utils/method";
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
    let dragOffsetInTarget = {  // 鼠标mousedown点击位置
      left: 0,
      top: 0,
      startX: 0,
      startY: 0,
    }
    let dragSourceTargetRect: DOMRect | null = null

    const isDragMaterial = (ev) => editorStore.currentDraggingMaterial && parseMaterial4DomChain(getElement4EventTarget(ev))

    function mousemove(ev: MouseEvent) {
      if (!draggingTarget || !dragSourceTargetRect) return
      const currentDraggingMaterial = editorStore.currentDraggingMaterial
      if (!currentDraggingMaterial) return
      const offsetPx = ev.clientX - dragOffsetInTarget.startX
      let scale = offsetPx / dragSourceTargetRect.width   // 宽度越大，scale倍率越小
      draggingTarget.style.left = `${ev.clientX - dragOffsetInTarget.left}px`
      draggingTarget.style.top = `${ev.clientY - dragOffsetInTarget.top}px`
      draggingTarget.style.opacity = '1'
      if (offsetPx > 320) return   // 偏移超过320停止缩放
      draggingTarget.style.transform = `scale(${Math.max(1, Math.min(scale, 5))})`
    }

    function mouseup(ev: MouseEvent) {
      const currentDraggingMaterial = toRaw(editorStore.currentDraggingMaterial)
      editorStore.currentDraggingMaterial = null
      const target: HTMLElement = getElement4EventTarget(ev)
      let finallyRect = draggingTarget.getBoundingClientRect()
      let editorAreaBoxRect = editorStore.editorAreaBoxTarget.getBoundingClientRect()
      document.body.removeChild(draggingTarget)
      dragOffsetInTarget = {left: 0, top: 0, startX: 0, startY: 0}
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
      if (isDragMaterial(ev)) ev.preventDefault()
    })

    document.addEventListener('mousedown', (ev) => {
      // console.log(!isDragMaterial(ev))
      if (!isDragMaterial(ev)) return
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseup)
      const sourceTarget: HTMLElement = getElement4EventTarget(ev)
      draggingTarget = <any>sourceTarget.cloneNode(true)
      draggingTarget.classList.add('dragging-material')
      draggingTarget.style.opacity = '0'
      document.body.appendChild(draggingTarget)
      const rect = sourceTarget.getBoundingClientRect()
      draggingTarget.style.width = `${rect.width}px`
      draggingTarget.style.height = `${rect.height}px`
      dragSourceTargetRect = rect
      dragOffsetInTarget = {
        left: ev.clientX - rect.left,
        top: ev.clientY - rect.top,
        startX: ev.clientX,
        startY: ev.clientY,
      }
    })
  }
}





