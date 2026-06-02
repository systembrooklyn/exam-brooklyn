import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "../api/axiosInstance";
import { PRICE_SETTINGS, PRICE_SETTINGS_BY_ID } from "../api/Api";
import notyf from "../components/global/notyf";
import { handleError } from "./handleError";

export const usePriceSettingsStore = defineStore("priceSettingsStore", () => {
  const priceSettings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /** GET /price-settings — returns flat list; children are nested inside each item */
  const fetchPriceSettings = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(PRICE_SETTINGS);
      priceSettings.value = response.data.data;
    } catch (err) {
      handleError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  /** GET /price-settings/{id} — returns a single price setting */
  const fetchPriceSettingById = async (id) => {
    error.value = null;
    try {
      const response = await apiClient.get(PRICE_SETTINGS_BY_ID(id));
      return response.data.data ?? response.data;
    } catch (err) {
      handleError(err);
      console.error(err);
      return null;
    }
  };

  /** POST /price-settings */
  const createPriceSetting = async (payload) => {
    try {
      const response = await apiClient.post(PRICE_SETTINGS, payload);
      const row = response.data.data ?? response.data;
      if (row) priceSettings.value.push(row);
      notyf.success("Price setting created successfully");
      return row;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  /** PUT /price-settings/{id} */
  const updatePriceSetting = async (id, payload) => {
    try {
      const response = await apiClient.put(PRICE_SETTINGS_BY_ID(id), payload);
      const row = response.data.data ?? response.data;
      if (row) {
        // Update the item in the top-level list
        priceSettings.value = priceSettings.value.map((s) =>
          s.id === id ? row : s
        );
      }
      notyf.success("Price setting updated successfully");
      return row;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return {
    priceSettings,
    loading,
    error,
    fetchPriceSettings,
    fetchPriceSettingById,
    createPriceSetting,
    updatePriceSetting,
  };
});
