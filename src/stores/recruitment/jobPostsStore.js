import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/axiosInstance';
import notyf from '@/components/global/notyf';
import { handleError } from '@/stores/handleError';
import {
  RECRUITMENT_JOB_POSTS,
  RECRUITMENT_JOB_POST_BY_ID,
  RECRUITMENT_JOB_POST_PUBLISH,
  RECRUITMENT_JOB_POST_CLOSE,
  RECRUITMENT_JOB_POST_ARCHIVE,
} from '@/api/Api';

export const useJobPostsStore = defineStore('recruitment-job-posts', () => {
  const posts = ref([]);
  const currentPost = ref(null);
  const loading = ref(false);
  const submitting = ref(false);

  // ── List ──────────────────────────────────────────────────────────────────
  const fetchPosts = async (params = {}) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_JOB_POSTS, { params });
      const list = res.data?.data ?? res.data ?? [];
      posts.value = Array.isArray(list) ? list : [];
      return posts.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Show ──────────────────────────────────────────────────────────────────
  const fetchPost = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.get(RECRUITMENT_JOB_POST_BY_ID(id));
      currentPost.value = res.data?.data ?? res.data;
      return currentPost.value;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const createPost = async (payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_POSTS, payload);
      notyf.success(res.data?.message || 'Job post created successfully.');
      await fetchPosts();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const updatePost = async (id, payload) => {
    submitting.value = true;
    try {
      const res = await apiClient.put(RECRUITMENT_JOB_POST_BY_ID(id), payload);
      notyf.success(res.data?.message || 'Job post updated successfully.');
      await fetchPosts();
      return res.data?.data ?? res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deletePost = async (id) => {
    loading.value = true;
    try {
      const res = await apiClient.delete(RECRUITMENT_JOB_POST_BY_ID(id));
      notyf.success(res.data?.message || 'Job post deleted.');
      await fetchPosts();
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── Publish (draft → published) ───────────────────────────────────────────
  const publishPost = async (id, platforms = []) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_POST_PUBLISH(id), { platforms });
      notyf.success(res.data?.message || 'Job post published successfully.');
      await fetchPosts();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Close (published/draft → closed) ──────────────────────────────────────
  const closePost = async (id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_POST_CLOSE(id));
      notyf.success(res.data?.message || 'Job post closed.');
      await fetchPosts();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Archive (closed → archived) ───────────────────────────────────────────
  const archivePost = async (id) => {
    submitting.value = true;
    try {
      const res = await apiClient.post(RECRUITMENT_JOB_POST_ARCHIVE(id));
      notyf.success(res.data?.message || 'Job post archived.');
      await fetchPosts();
      return res.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      submitting.value = false;
    }
  };

  // ── Status metadata ───────────────────────────────────────────────────────
  const STATUS_META = {
    draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    published: { label: 'Published', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    closed:    { label: 'Closed',    cls: 'bg-red-50 text-red-600 border-red-200' },
    archived:  { label: 'Archived',  cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  };
  const statusMeta = (status) => STATUS_META[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500 border-gray-200' };

  return {
    posts,
    currentPost,
    loading,
    submitting,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    closePost,
    archivePost,
    statusMeta,
  };
});
