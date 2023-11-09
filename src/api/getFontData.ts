import AllFonts from "@/api/mock/all-fonts";

export async function apiGetFontData(id: string) {
  if (!id) return
  return {
    code: 200,
    data: AllFonts.find(item => item.id === id)
  }
}

export async function apiGetAllFonts() {
  return {
    code: 200,
    data: AllFonts
  }
}
