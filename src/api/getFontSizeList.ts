import fontSizeList from "@/api/mock/font-size-list";

export async function apiGetFontSizeList() {
  return {
    code:200,
    data: fontSizeList
  }
}
