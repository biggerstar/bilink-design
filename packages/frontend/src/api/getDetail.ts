import axios from "axios";

export async function apiGetDetail(opt: { id: string | number } = {}, returnData: boolean = true) {
  if (!opt.id) console.error('您需要传入获取组件详情的id')
  const res = await axios.get('/detail', {params: opt})
  return returnData ? res?.data || [] : res
}
