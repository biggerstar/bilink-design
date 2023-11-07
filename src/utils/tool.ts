export function getElement4EventTarget(ev: Event): HTMLElement | null {
  return <HTMLElement>(ev.target || ev.srcElement)
}

/** 小数转百分比 */
export function toPercent(point: number | string, toFixed: number = 0) {
  let str = Number(point * 100).toFixed(toFixed);
  str += "%";
  return str;
}
