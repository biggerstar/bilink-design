import LayoutInfo from "@/api/mock/editor-data-gd";
import {editorStore} from "@/store/editor";

export async function apiGetProjectInfo() {
  // const url = xxx
  // fetch(url)
  let layoutData = LayoutInfo
  const res = sessionStorage.getItem('layout')
  res.toString();
  // if (res) layoutData = JSON.parse(res)

  return {
    code: 200,
    data: layoutData
  }
}

setInterval(() => {
  sessionStorage.setItem('layout', JSON.stringify(editorStore.currentTemplate))
}, 1000)
