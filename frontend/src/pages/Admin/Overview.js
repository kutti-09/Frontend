import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Overview = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    mrr: 0,
    arr: 0,
    arpu: 0,
    adRevenue: 0,
    churnRate: 0,
    dauMauRatio: 0,
    upcomingRenewals: 0,
    openAlerts: 0
  });

  const [mrrHistory, setMrrHistory] = useState([]);
  const [subsHistory, setSubsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          adminService.getTotalUserCount(),        // 0
          adminService.getActiveSubscribers(),      // 1
          adminService.getMRR(),                    // 2
          adminService.getARR(),                    // 3
          adminService.getARPU(),                   // 4
          adminService.getMonthlyAdRevenue(),       // 5
          adminService.getChurnCount(),             // 6
          adminService.getDAUMAUStats(),            // 7
          adminService.getUpcomingRenewals(),       // 8
          adminService.getOpenAlerts(),             // 9
          adminService.getMRRHistory(),             // 10
          adminService.getActiveSubscribersHistory() // 11
        ]);

        const getValue = (index, fallback = 0) => {
          const r = results[index];
          return r.status === 'fulfilled' ? r.value : fallback;
        };

        setMetrics({
          totalUsers: getValue(0, 0),
          activeSubscribers: getValue(1, 0),
          mrr: getValue(2, 0),
          arr: getValue(3, 0),
          arpu: getValue(4, 0),
          adRevenue: getValue(5, 0),
          churnRate: getValue(6, 0),
          dauMauRatio: getValue(7, 0),
          upcomingRenewals: getValue(8, 0),
          openAlerts: getValue(9, 0)
        });

        // Chart data
        const mrrData = getValue(10, []);
        const subsData = getValue(11, []);
        setMrrHistory(Array.isArray(mrrData) ? mrrData : []);
        setSubsHistory(Array.isArray(subsData) ? subsData : []);

      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return '₹' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatWholeNumber = (value) => {
    const num = typeof value === 'number' ? value : parseInt(value) || 0;
    return num.toLocaleString();
  };

  const formatPercent = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return num.toFixed(1) + '%';
  };

  // Custom tooltip for charts
  const ChartTooltip = ({ active, payload, label, prefix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(13, 13, 13, 0.95)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.85rem'
        }}>
          <p style={{ color: '#aaa', margin: 0, marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#C084FC', margin: 0, fontWeight: 600 }}>
            {prefix}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-content">
      {/* Header row with title on left */}
      <div className="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1 className="page-title">Executive Overview</h1>
          <p className="page-subtitle">Key performance indicators and business metrics</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
      ) : (
        <>
          <div className="row g-4">
            {/* Row 1: Total Users, Active Subscribers, MRR, ARR */}
            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Total Users</span>
                  <i className="bi bi-people"></i>
                </div>
                <div className="metric-value">{formatWholeNumber(metrics.totalUsers)}</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Active Subscribers</span>
                  <i className="bi bi-credit-card"></i>
                </div>
                <div className="metric-value">{formatWholeNumber(metrics.activeSubscribers)}</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>MRR (This Month)</span>
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div className="metric-value">{formatCurrency(metrics.mrr)}</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>ARR (Run Rate)</span>
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <div className="metric-value">{formatCurrency(metrics.arr)}</div>
              </div>
            </div>

            {/* Row 2: ARPU, Ad Revenue, Churn Rate, DAU/MAU */}
            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>ARPU (This Month)</span>
                  <i className="bi bi-bullseye"></i>
                </div>
                <div className="metric-value">{formatCurrency(metrics.arpu)}</div>
                <div className="metric-sub">Per subscriber</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Ad Revenue (This Month)</span>
                  <i className="bi bi-cash"></i>
                </div>
                <div className="metric-value">{formatCurrency(metrics.adRevenue)}</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Churn Rate (This Month)</span>
                  <i className="bi bi-exclamation-circle"></i>
                </div>
                <div className="metric-value">{formatPercent(metrics.churnRate)}</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>DAU / MAU</span>
                  <i className="bi bi-bar-chart"></i>
                </div>
                <div className="metric-value">{formatPercent(metrics.dauMauRatio)}</div>
                <div className="metric-sub">Latest ratio</div>
              </div>
            </div>

            {/* Row 3: Upcoming Renewals, Open Alerts */}
            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Upcoming Renewals</span>
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <div className="metric-value">{formatWholeNumber(metrics.upcomingRenewals)}</div>
                <div className="metric-sub">Next 30 days</div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Open Alerts</span>
                  <i className="bi bi-bell"></i>
                </div>
                <div className="metric-value">{formatWholeNumber(metrics.openAlerts)}</div>
              </div>
            </div>
          </div>

          {/* ── Charts Row ── */}
          <div className="row g-4 mt-1">
            {/* MRR History Chart */}
            <div className="col-md-6">
              <div className="metric-card" style={{ padding: '1.25rem' }}>
                <h6 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  MRR (Last 6 Months)
                </h6>
                <div style={{ height: 260 }}>
                  {mrrHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mrrHistory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid stroke="rgba(147, 51, 234, 0.12)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          stroke="#555"
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <YAxis
                          stroke="#555"
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <Tooltip content={<ChartTooltip prefix="₹" />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#9333EA"
                          strokeWidth={2.5}
                          dot={{ fill: '#9333EA', stroke: '#9333EA', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#C084FC', stroke: '#9333EA', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex h-100 align-items-center justify-content-center text-secondary">
                      <span>No chart data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Subscribers History Chart */}
            <div className="col-md-6">
              <div className="metric-card" style={{ padding: '1.25rem' }}>
                <h6 style={{ color: '#fff', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                  Active Subscribers (Last 6 Months)
                </h6>
                <div style={{ height: 260 }}>
                  {subsHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={subsHistory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid stroke="rgba(147, 51, 234, 0.12)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          stroke="#555"
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <YAxis
                          stroke="#555"
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#9333EA"
                          strokeWidth={2.5}
                          dot={{ fill: '#9333EA', stroke: '#9333EA', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#C084FC', stroke: '#9333EA', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex h-100 align-items-center justify-content-center text-secondary">
                      <span>No chart data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
