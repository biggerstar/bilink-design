import Moveable, {MoveableOptions, OnDrag, OnResize, OnRotate, OnScale} from "moveable";
import {getElement4EventTarget} from "@/utils/tool";
import {throttle} from 'lodash-es'

export const defaultMoveableOptions: any = {
    // zoom: 0.8,
    draggable: true,
    clippable: false,
    resizable: true,
    scalable: false,
    keepRatio: true,
    rotatable: true,
    throttleDrag: 0,
    throttleResize: 0,
    throttleScale: 0,
    throttleRotate: 0,
    renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
}


export class MoveableManager {
    public moveable: Moveable
    public container: HTMLElement
    private _activeElement: HTMLElement | null
    private __running: boolean

    public eventMap = <Record<any, any>>{
        mousedown: (ev: MouseEvent) => {
            this._activeElement = getElement4EventTarget(ev)
            this.active4EventTarget(ev)
        },
        mousemove: throttle((ev: MouseEvent) => {
            this.active4EventTarget(ev)
        }, 450),
    }

    /**
     * 开始工作
     * */
    public start(moveableOptions: MoveableOptions = {}, container: HTMLElement | null) {
        if (this.__running) return
        this.__running = true
        if (!container) container = document.body
        this.container = container
        this.moveable = new Moveable(container, moveableOptions);
        const moveable = this.moveable
        moveable.renderDirections = ["nw", "ne", "sw", "se"];
        moveable.target = document.querySelector('#editor-area div')
        moveable
            .on("drag", (ev: OnDrag) => {
                ev.target.style.transform = ev.transform;
            })
            .on("resize", (ev: OnResize) => {
                moveable.keepRatio = false
                ev.target.style.width = `${ev.width}px`;
                ev.target.style.height = `${ev.height}px`;
            })
            .on("scale", (ev: OnScale) => {
                console.log(ev);
                ev.target.style.transform = ev.drag.transform;
            })
            .on("rotate", (ev: OnRotate) => {
                // console.log(ev);
                ev.target.style.transform = ev.drag.transform;
            })

        ;const eventMap = this.eventMap
        Object.keys(eventMap).forEach((name) => container && container.addEventListener(name, eventMap[name]))

    }

    /**
     * 停止工作
     * */
    public stop() {
        this.moveable.destroy()
        Object.keys(this.eventMap).forEach((name, index, array) => {
            this.container && this.container.removeEventListener(name, array[name])
        })
    }

    /**
     * 让某些元素活跃
     * */
    public active(elements: HTMLElement | SVGElement | HTMLElement[] | SVGElement[]) {
        if (!elements) return
        const elList = !Array.isArray(elements) ? [elements] : elements
        if (this._activeElement) elList.push(this._activeElement)
        this.moveable.target = elList.filter((el: HTMLElement) => el && el.dataset['type'] === 'widgets')
    }

    public deActive() {
        this._activeElement = null
        this.moveable.target = []
    }

    /**
     * 让事件中的发起目标元素活跃
     * */
    public active4EventTarget(ev: Event) {
        const elTarget = getElement4EventTarget(ev)
        if (elTarget) this.active(elTarget)
    }
}


