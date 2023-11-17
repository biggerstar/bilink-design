import axios from "axios";

export async function apiGetResource(opt: { id: number | string, type: string }) {
  return await axios.get('getResource', {params: opt})
}

