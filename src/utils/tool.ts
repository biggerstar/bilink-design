export function getElement4EventTarget(ev: Event): HTMLElement | null {
  return <HTMLElement>(ev.target || ev['srcElement'])
}

/** 小数转百分比 */
export function toPercent(point: number | string, toFixed: number = 0) {
  let str = Number(point * 100).toFixed(toFixed);
  str += "%";
  return str;
}

/** 判断某个键是否在自身对象里 */
export function hasOwnKey(obj: object, key: string | symbol) {
  return Reflect.ownKeys(obj).includes(key)
}

/** 柯里化函数 */
export function curry(fn): Function {
  return function nest(...args) {
    if (args.length === fn.length) return fn(...args)
    else {
      return function (arg) {
        return nest(...args, arg);
      }
    }
  }
}
