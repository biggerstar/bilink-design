import tags from "@/api/mock/tags";

export async function apiGetPageConfig() {
  return {
    code: 200,
    data: {
      brand: 'BiLink设计',
      asideTag: tags
    }
  }
}
