import axios from "axios";


/**
 * 传入 type 获取某种大类的树结构， 比如 文字，照片， 模板等大类
 * 传入 id 获取该id下的树结构，包含子树
 * */
export async function apiGetResource(opt: { id?: number | string, type?: string }) {
  return await axios.get('getResource', {params: opt})
}

