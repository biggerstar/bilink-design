export function getElement4EventTarget(ev: Event): HTMLElement | null {
    return <HTMLElement>(ev.target || ev.srcElement)
}
