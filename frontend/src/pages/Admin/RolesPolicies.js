import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ReactECharts from 'echarts-for-react';
import './RolesPolicies.css';

export const RolesPolicies = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminStats, setAdminStats] = useState(0);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [entitlementScopeData, setEntitlementScopeData] = useState([]);
  const [driftData, setDriftData] = useState([]);
  const [expiringGrants, setExpiringGrants] = useState({ lessThan7Days: 0, sevenTo30Days: 0, moreThan30Days: 0 });
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Initial fetch for dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userCount, stats, roles, entitlements, grants] = await Promise.all([
          adminService.getTotalUserCount(),
          adminService.getAdminStats(),
          adminService.getRoleDistribution(),
          adminService.getEntitlementDistribution(),
          adminService.getExpiringGrants()
        ]);
        console.log("1. Total Users:", userCount);
        console.log("2. Admin Stats Object:", stats);
        console.log("3. Roles Map:", roles);
        setTotalUsers(userCount || 0);
        setAdminStats(stats || 0);
        if (roles && typeof roles === 'object' && !Array.isArray(roles)) {
          setRoleDistribution(Object.entries(roles).map(([name, value]) => ({ name, value })));
        } else {
          setRoleDistribution(roles || []);
        }

        // 4. Entitlement Scope (TRANSFORM MAP TO ARRAY)
        // Backend: { "All": 6, "Category": 3 } -> Frontend: [{name: "All", value: 6}]
        if (entitlements && typeof entitlements === 'object' && !Array.isArray(entitlements)) {
          setEntitlementScopeData(Object.entries(entitlements).map(([name, value]) => ({ name, value })));
        } else {
          setEntitlementScopeData(entitlements || []);
        }

        setExpiringGrants(grants || { lessThan7Days: 0, sevenTo30Days: 0, moreThan30Days: 0 });
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchStats();
  }, []);

  // Fetch paginated drift data
  useEffect(() => {
    const fetchDrift = async () => {
      try {
        setLoading(true);
        const response = await adminService.getPolicyDrift(currentPage - 1, rowsPerPage);
        // Expecting { content: [], totalPages: 0 } from backend
        setDriftData(response.content || response || []);
        setTotalPages(response.totalPages || 0);
      } catch (e) {
        console.error("Error fetching drift data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrift();
  }, [currentPage]);

  // ECharts Options
  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#888' } },
    yAxis: {
      type: 'category',
      data: roleDistribution.map(d => d.name).reverse(),
      axisLabel: { color: '#ccc', fontSize: 11 },
      axisLine: { lineStyle: { color: '#333' } }
    },
    series: [{
      name: 'Users',
      type: 'bar',
      data: roleDistribution.map(d => d.value).reverse(),
      itemStyle: { color: '#9333EA', borderRadius: [0, 4, 4, 0] },
      barWidth: '60%'
    }]
  };

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center', textStyle: { color: '#aaa' } },
    series: [{
      name: 'Entitlement Scope',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#06060c', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' } },
      data: entitlementScopeData.map((d, i) => ({
        ...d,
        itemStyle: { color: i === 0 ? '#9333EA' : i === 1 ? '#C084FC' : '#E879F9' }
      }))
    }]
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Roles & Policies</h1>
        <p className="page-subtitle">RBAC Governance and Entitlements</p>
      </div>

      <div className="row g-4 mb-4">
        {loading ? (
          <div className="text-center w-100 mt-5"><div className="spinner-border text-light" role="status"></div></div>
        ) : (
          <React.Fragment>
            {/* Metric Cards */}
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1">
                  <span>Admin Accounts</span>
                  <i className="bi bi-shield-lock"></i>
                </div>
                <div className="metric-value me-2">{adminStats}</div>
                <div className="metric-sub mt-2">Total</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1">
                  <span>Total Users</span>
                  <i className="bi bi-people"></i>
                </div>
                <div className="metric-value total-users">{totalUsers.toLocaleString()}</div>
                <div className="metric-sub mt-2">Platform population</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1">
                  <span>Expiring Special Grants</span>
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div className="mt-2">
                  <div className="d-flex justify-content-between text-secondary small mb-1">
                    <span>&lt; 7 Days</span>
                    <span className="text-danger fw-bold">{expiringGrants.lessThan7Days}</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary small mb-1">
                    <span>7-30 Days</span>
                    <span className="text-warning fw-bold">{expiringGrants.sevenTo30Days}</span>
                  </div>
                  <div className="d-flex justify-content-between text-secondary small">
                    <span>&gt; 30 Days</span>
                    <span className="text-success fw-bold">{expiringGrants.moreThan30Days}</span>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* Charts Row */}
      <div className="row g-4 charts-row">
        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header">
              <h4 className="chart-title">Users by Role</h4>
              <i className="bi bi-person-badge"></i>
            </div>
            <div style={{ height: '300px' }}>
              <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header">
              <h4 className="chart-title">Entitlement Scope</h4>
              <i className="bi bi-pie-chart"></i>
            </div>
            <div style={{ height: '300px' }}>
              <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Policy Drift Section */}
      <div className="policy-drift-section">
        <h2 className="section-label">Policy Drift - Special Access Grants</h2>
        <p className="section-sublabel">Users with custom entitlements (not following default plan scope)</p>

        <div className="drift-card">
          <div className="table-responsive">
            <table className="drift-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Content Scope</th>
                  <th>Granted Date</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {driftData.map((user, idx) => (
                  <tr key={idx}>
                    <td className="user-name-cell">{user.name}</td>
                    <td className="email-cell">{user.email}</td>
                    <td>
                      <span className={`badge-mt badge-${user.contentScope}`}>
                        {user.contentScope}
                      </span>
                    </td>
                    <td className="date-cell">{user.grantedDate}</td>
                    <td className="date-cell">{user.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {driftData.length > 0 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Page {currentPage} of {totalPages || 1}
              </div>
              <div className="pagination-btns">
                <button
                  className="pag-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  className="pag-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};