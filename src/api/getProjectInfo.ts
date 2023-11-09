import LayoutInfo from "@/api/mock/layout-info";

export async function apiGetProjectInfo() {
  // const url = xxx
  // fetch(url)
  return {
    code: 200,
    data: LayoutInfo
  }
}
