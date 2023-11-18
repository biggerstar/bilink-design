import axios from "axios";
import {isNumber, isString} from "is-what";

/**
 * 直接返回data 状态码已经通过返回数据定义替代，无需使用status
 * returnData 是否直接返回数据而不是axios对象 默认为 true
 * */
export async function apiGetList(opt: { id: any, page_num?: any, page_size?: any }, returnData: boolean = true) {
  if (!isString(opt.id) && !isNumber(opt.id)) return console.error('参数错误', opt)
  const res = await axios.get('widgets', {params: opt})
  return returnData ? res?.data : res
}
