import Constants from "expo-constants";

const extra = (
  Constants.expoConfig?.extra ??
  (Constants?.executionEnvironment ? (Constants as any).manifest?.extra : undefined)
) as  { apiUrl: string }

export const API_URL: string = extra.apiUrl;
