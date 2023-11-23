import Moveable from "moveable";

/**
 * 获取当前调整方向意图
 * */
export function getDirectionType(direction: string): 'scale' | 'resize' | void {
  if (["nw", "ne", "se", "sw"].includes(direction)) return 'scale'
  if (["n", "s", "e", "w"].includes(direction)) return 'resize'
}

/**
 * 设置当前点击调整框的意图
 * 当前支持判定 'scale' 'resize'
 * */
export function setDirection(moveable: Moveable, target: HTMLElement) {
  // console.log(target)
  const direction = getDirectionType(target.dataset['direction'])
  // console.log(direction)
  if (direction === 'scale') {
    moveable.setState({
      keepRatio: true,
      scalable: true,
      resizable: false,
      snappable: false,
    })
  } else if (direction === 'resize') {
    moveable.setState({
      keepRatio: false,
      resizable: true,
      scalable: false,
      snappable: false,
    })
  }
  else {
    moveable.setState({
      keepRatio: true,
      scalable: true,
      resizable: true,
      snappable: true,
    })
  }
}
