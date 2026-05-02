import type { ChurchProfile, ChurchProfileUpdate } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

export const churchRepository = {
  async getProfile(): Promise<ChurchProfile> {
    const data = await readData();
    return data.church;
  },

  async updateProfile(update: ChurchProfileUpdate): Promise<ChurchProfile> {
    const data = await readData();
    const church: ChurchProfile = {
      id: data.church.id,
      ...update
    };

    await writeData({ ...data, church });
    return church;
  }
};
