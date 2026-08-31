import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_OFFERS,
  RECRUITMENT_OFFER_BY_ID,
  RECRUITMENT_OFFER_SEND,
  RECRUITMENT_OFFER_EXPIRE,
} from '@/api/Api';

export const useOffersStore = defineStore('recruitment-offers', () => {
  const offers = ref([]);
  const loading = ref(false);

  const fetchOffers = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_OFFERS, { params });
      const list = res.data?.data ?? res.data ?? [];
      offers.value = Array.isArray(list) ? list : [];
      return offers.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOffer = async (payload) => {
    try {
      const res = await apiClient.post(RECRUITMENT_OFFERS, payload);
      notyf.success(res.data?.message || 'Offer letter generated successfully.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateOffer = async (id, payload) => {
    loading.value = true;
    try {
      const res = await apiClient.put(RECRUITMENT_OFFER_BY_ID(id), payload);
      notyf.success(res.data?.message || 'Offer terms updated.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendOffer = async (id) => {
    try {
      const res = await apiClient.post(RECRUITMENT_OFFER_SEND(id));
      notyf.success(res.data?.message || 'Offer sent to candidate email.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const expireOffer = async (id) => {
    try {
      const res = await apiClient.post(RECRUITMENT_OFFER_EXPIRE(id));
      notyf.success(res.data?.message || 'Offer set as expired.');
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteOffer = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_OFFER_BY_ID(id));
      notyf.success(res.data?.message || 'Offer deleted.');
      offers.value = offers.value.filter(o => o.id !== id);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    offers,
    loading,
    fetchOffers,
    createOffer,
    updateOffer,
    sendOffer,
    expireOffer,
    deleteOffer,
  };
});
