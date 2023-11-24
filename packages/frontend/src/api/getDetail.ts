import axios from "axios";
import {isNumber, isObject, isString} from "is-what";
import {pick} from "lodash-es";

export async function apiGetDetail(opt: { id?: string | number, uid?: string | number, page_size?: string | number, page_num?: string | number } = {}, returnData: boolean = true) {
  if (!opt.id && !opt.uid) console.error('[apiGetDetail] 您需要传入获取组件详情的id 或 uid')
  const res = await axios.get('/detail', {params: opt})
  return returnData ? res?.data || [] : res
}

export async function apiPostDetail(opt: { id?: string | number, uid: string | number, data: object } = {}, returnData: boolean = true) {
  if (!opt.uid) console.error('[apiPostDetail]您需要传入uid')
  if (!isObject(opt.data) || !opt.data) console.error('[apiPostDetail]您需要传入画布数据信息')
  const res = await axios.post('/detail', pick(opt, ['id', 'uid', 'data']))
  return returnData ? res?.data || [] : res
}

export async function apiDeleteDetail(opt: { id: string | number } = {}, returnData: boolean = true) {
  if (!isString(opt.id) && !isNumber(opt.id)) console.error('[apiDeleteDetail] 删除的id必须是字符串或者数字')
  const res = await axios.delete('/detail', {
    data: {
      id: opt.id
    }
  })
  return returnData ? res?.data || [] : res
}
