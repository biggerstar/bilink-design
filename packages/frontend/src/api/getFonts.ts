import axios from "axios";

type FontParams = {
  id: number | string;
  name: number | string;
  page_size: number | string;
  page_num: number | string;
}

export async function apiGetFonts(opt: Partial<FontParams> = {}, returnData: boolean = true) {
  if (opt.name) opt.name = encodeURIComponent(opt.name.toString())
  const res = await axios.get('/fonts', {params: opt})
  return returnData ? res?.data || [] : res
}
