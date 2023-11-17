import axios from "axios";
import {isNumber, isString} from "is-what";

export async function apiGetList(opt: { id: any, page_num?: any, page_size?: any }) {
  if (!isString(opt.id) && !isNumber(opt.id)) return console.error('参数错误', opt)
  const res = await axios.get('getList', {params: opt})
  return res?.data
}
