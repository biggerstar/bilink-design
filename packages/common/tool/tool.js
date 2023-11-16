export function sleep(time = 1000) {
  return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * 获取树中叶子节点的所属对象
 * @return {Array}
 * */
export function getLeafChildren(arr) {
  if (!arr) return void 0
  let result = [];

  function recursiveGetChildren(arr) {
    for (const item of arr) {
      if (!item.children) continue
      if (!item.children.length) {  // 如果是叶子节点则加入返回结果中
        result.push(item);
      } else {
        recursiveGetChildren(item.children)  // 继续递归处理下一层
      }
    }
  }

  recursiveGetChildren(arr);
  return result;
}
