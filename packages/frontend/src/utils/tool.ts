export function getElement4EventTarget(ev: MouseEvent | TouchEvent): HTMLElement {
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

/**
 * 判断一个元素是否已经滚动到底部
 * offset 表示距离底部多少触发
 * */
export function isElementAtBottom(element: Element, offset: number = 0) {
  const {scrollTop, clientHeight, scrollHeight} = element
  if (clientHeight === 0 || scrollHeight === 0) return false
  return scrollTop + clientHeight + offset >= scrollHeight
}


/**
 *  通用函数,传入一个对象数组，递归获取某一个层级的的某个键所有对象值
 *  @param objArr  对象数组
 *  @param depth   深度，想获取第几层的值
 *  @param key     获取某个深度的某某键，支持函数动态返回
 * */
export function getChildrenByDepth(objArr: object[], depth: number = 1, key: string | number | Function = 'children') {
  if (typeof key === "function") key = key.call(null, objArr, depth, key)
  if (depth === 0) return objArr  // depth每次减1直到 0 时作为终止条件, 当深度为0时，返回原始对象数组
  const children = [];
  for (const obj of objArr) {
    if (obj[key] && Array.isArray(obj[key])) {
      const childArr = getChildrenByDepth(obj[key], depth - 1, key);
      children.push(...childArr);
    }
  }
  return children;
}
