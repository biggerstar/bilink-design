import widgetsDetailConfig from "@/api/mock/widgetsDetailConfig";


export async function apiGetWidgetsDetailConfig() {
  return {
    code: 200,
    data: widgetsDetailConfig
  }
}
