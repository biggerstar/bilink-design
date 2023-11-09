import tags from "@/api/mock/tags";

export async function apiGetAsideTags() {
  return {
    code: 200,
    data: tags
  }
}
