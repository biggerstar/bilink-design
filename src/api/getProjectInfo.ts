import LayoutInfo from "@/api/mock/layout-info";
import {useEditorStore} from "@/store/editor";

export async function apiGetProjectInfo() {
  // const url = xxx
  // fetch(url)
  let layoutData = LayoutInfo
  const res = sessionStorage.getItem('layout')
  if (res) layoutData = JSON.parse(res)

  return {
    code: 200,
    data: layoutData
  }
}

setInterval(() => {
  const editorStore = useEditorStore()
  sessionStorage.setItem('layout', JSON.stringify(editorStore.currentProject))
}, 1000)
