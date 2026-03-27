import axios from 'axios';

const API_URL = 'http://localhost:8082';

// Set auth header for all requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const adminService = {
  // ── Overview KPI Endpoints ──

  getTotalUserCount: async () => {
    const resp = await axios.get(`${API_URL}/user/admin/count`, getAuthHeaders());
    return resp.data;
  },

  getActiveSubscribers: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/active-subscribers`, getAuthHeaders());
    return resp.data;
  },

  getMRR: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/MRR`, getAuthHeaders());
    return resp.data;
  },

  getARR: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/ARR`, getAuthHeaders());
    return resp.data;
  },

  getARPU: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/ARPU`, getAuthHeaders());
    return resp.data;
  },

  getMonthlyAdRevenue: async () => {
    const resp = await axios.get(`${API_URL}/adDeliveryReport/admin/monthlyAdRevenue`, getAuthHeaders());
    return resp.data;
  },

  getChurnCount: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/churnCount`, getAuthHeaders());
    return resp.data;
  },

  getDAUMAUStats: async () => {
    const resp = await axios.get(`${API_URL}/engagementReport/admin/DAU-MAUStats`, getAuthHeaders());
    return resp.data;
  },

  getUpcomingRenewals: async (page = 0, size = 10) => {
    const resp = await axios.get(`${API_URL}/subscription/admin/renewals?page=${page}&size=${size}`, getAuthHeaders());
    return resp.data;
  },

  getOpenAlerts: async () => {
    const resp = await axios.get(`${API_URL}/notification/admin/openAlerts`, getAuthHeaders());
    return resp.data;
  },

  // ── Chart Endpoints ──

  getMRRHistory: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/charts/mrr-history`, getAuthHeaders());
    return resp.data;
  },

  getActiveSubscribersHistory: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/charts/active-subscribers`, getAuthHeaders());
    return resp.data;
  },

  // ── Legacy / Other Endpoints ──

  getUsers: async () => {
    try {
      const resp = await axios.get(`${API_URL}/user/getAll`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      console.warn("Could not fetch users, returning mock data");
      return Array(1000).fill({});
    }
  },

  getSubscriptions: async () => {
    try {
      const resp = await axios.get(`${API_URL}/subscription/getAll`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      console.warn("Could not fetch subscriptions, returning mock data");
      return [];
    }
  },

  getPlans: async () => {
    try {
      const resp = await axios.get(`${API_URL}/plan/admin/getAll`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return [];
    }
  },


  getActiveSubscribersChart: async () => {
    try {
      const resp = await axios.get(`${API_URL}/subscription/admin/plan-distribution`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return [];
    }
  },

  getEngagementMetrics: async () => {
    try {
      const resp = await axios.get(`${API_URL}/analytics/engagement`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return { dau: 0, mau: 0, completionRate: 0, avgBitrate: '0 Mbps' };
    }
  },

  getAdDeliveryReports: async () => {
    try {
      const resp = await axios.get(`${API_URL}/analytics/addelivery`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return [];
    }
  },

  // ── New Dynamic Data Endpoints ──

  getMrrByPlan: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/charts/mrr-by-plan`, getAuthHeaders());
    return resp.data;
  },

  getRevenueBreakdown: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/charts/revenue-breakdown`, getAuthHeaders());
    return resp.data;
  },

  getARPUByPlan: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/charts/arpu-distribution`, getAuthHeaders());
    return resp.data;
  },

  getAdYieldTrends: async () => {
    const resp = await axios.get(`${API_URL}/analytics/admin/ad-yield`, getAuthHeaders());
    return resp.data;
  },

  getPlatformCTR: async () => {
    const resp = await axios.get(`${API_URL}/analytics/admin/ctr-fill`, getAuthHeaders());
    return resp.data;
  },

  getRenewalMetrics: async () => {
    const resp = await axios.get(`${API_URL}/subscription/admin/renewal-metrics`, getAuthHeaders());
    return resp.data;
  },

  getAudienceTrends: async () => {
    const resp = await axios.get(`${API_URL}/engagementReport/admin/engagement-trends`, getAuthHeaders());
    return resp.data;
  },

  getEngagementKPIs: async () => {
    const resp = await axios.get(`${API_URL}/engagementReport/admin/engagement-kpis`, getAuthHeaders());
    return resp.data;
  },

  getWatchTimeTrends: async () => {
    const resp = await axios.get(`${API_URL}/engagementReport/admin/watch-time-trends`, getAuthHeaders());
    return resp.data;
  },

  getRoleDistribution: async () => {
    const resp = await axios.get(`${API_URL}/user/admin/role-distribution`, getAuthHeaders());
    return resp.data;
  },

  getExpiringGrants: async () => {
    const resp = await axios.get(`${API_URL}/entitlement/admin/expiry-stats`, getAuthHeaders());
    return resp.data;
  },

  getEntitlementDistribution: async () => {
    const resp = await axios.get(`${API_URL}/entitlement/admin/entitlement-distribution`, getAuthHeaders());
    return resp.data;
  },

  getPolicyDrift: async (page = 0, size = 10) => {
    const resp = await axios.get(`${API_URL}/entitlement/admin/policy-drift?page=${page}&size=${size}`, getAuthHeaders());
    return resp.data;
  },

  getAdminStats: async () => {
    const resp = await axios.get(`${API_URL}/user/admin/admin-stats`, getAuthHeaders());
    return resp.data;
  },

  getNotifications: async () => {
    try {
      const resp = await axios.get(`${API_URL}/notification/admin/getAll`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return [];
    }
  },
  markAllNotificationsRead: async () => {
    try {
      const resp = await axios.put(`${API_URL}/notification/admin/mark-all-read`, getAuthHeaders());
      return resp.data;
    } catch (e) {
      return [];
    }
  },
  // In adminService.js
  addPlan: async (planData) => {
    const resp = await axios.post(`${API_URL}/plan/admin/add`, planData, getAuthHeaders());
    return resp.data;
  },

  updatePlan: async (planId, planData) => {
    const resp = await axios.put(`${API_URL}/plan/admin/update/${planId}`, planData, getAuthHeaders());
    return resp.data;
  },

  deletePlan: async (planId) => {
    const resp = await axios.delete(`${API_URL}/plan/admin/delete/${planId}`, getAuthHeaders());
    return resp.data;
  }
};