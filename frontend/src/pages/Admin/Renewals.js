import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { adminService } from '../../services/adminService';
import './Renewals.css';

export const Renewals = () => {
  const [loading, setLoading] = useState(true);
  const [renewals, setRenewals] = useState([]);
  const [metrics, setMetrics] = useState({
     renewalsDue: 0,
     statusMix: [],
     graceOutcomes: { returned: 0, lapsed: 0 }
  });
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Initial fetch for renewal metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsData = await adminService.getRenewalMetrics();
        setMetrics({
          renewalsDue: metricsData?.renewalsDue || 0,
          statusMix: metricsData?.statusMix || [],
          graceOutcomes: metricsData?.graceOutcomes || { returned: 0, lapsed: 0 }
        });
      } catch (e) {
        console.error("Error fetching renewal metrics:", e);
      }
    };
    fetchMetrics();
  }, []);

  // Fetch paginated renewals
  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUpcomingRenewals(currentPage - 1, rowsPerPage);
        // Expecting { content: [], totalPages: 0 } from backend
        setRenewals(response.content || response || []);
        setTotalPages(response.totalPages || 0);
      } catch (e) {
        console.error("Error fetching renewals:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRenewals();
  }, [currentPage]);

  const statusMixOption = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c}%',
      backgroundColor: 'rgba(13, 13, 13, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#888' },
      icon: 'circle'
    },
    series: [
      {
        name: 'Status Mix',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: false } },
        data: metrics?.statusMix || [],
        itemStyle: {
          borderRadius: 2
        },
        color: ['#10B981', '#F59E0B', '#9333EA', '#EF4444']
      }
    ]
  };

  return (
    <div className="dashboard-content">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
           <h1 className="page-title">Renewals & Lifecycle</h1>
           <p className="page-subtitle">Subscription lifecycle and upcoming renewals</p>
        </div>
      </div>

      {loading ? (
          <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
      ) : (
          <React.Fragment>
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                  <div className="metric-card" style={{ height: 'auto' }}>
                    <div className="metric-header">
                      <span>Renewals Due</span>
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <div className="metric-value">{metrics.renewalsDue}</div>
                    <div className="metric-sub text-secondary">Next 30 Days</div>
                  </div>
              </div>
              
              <div className="col-md-5">
                  <div className="metric-card" style={{ height: 'auto' }}>
                    <div className="metric-header mb-0">
                      <span>Status Mix</span>
                      <i className="bi bi-pie-chart"></i>
                    </div>
                    <div style={{ height: '140px' }}>
                       <ReactECharts option={statusMixOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
              </div>

              <div className="col-md-4">
                  <div className="metric-card" style={{ height: 'auto' }}>
                    <div className="metric-header mb-3">
                      <span>Grace Outcomes</span>
                      <i className="bi bi-arrow-left-right"></i>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small">Returned to Active</span>
                        <span className="fw-bold text-success">{metrics.graceOutcomes.returned}%</span>
                    </div>
                    <div className="progress mb-3" style={{ height: '6px', backgroundColor: 'var(--mt-bg-dark)' }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: `${metrics.graceOutcomes.returned}%`}}></div>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small">Churned (Lapsed)</span>
                        <span className="fw-bold text-danger">{metrics.graceOutcomes.lapsed}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px', backgroundColor: 'var(--mt-bg-dark)' }}>
                        <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${metrics.graceOutcomes.lapsed}%`}}></div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12">
                <div className="metric-card p-4" style={{ height: 'auto' }}>
                  <div className="metric-header mb-4">
                    <span>Upcoming Renewals (Next 30 Days)</span>
                    <i className="bi bi-table"></i>
                  </div>
                  
                  <div className="renewals-table-container">
                    <table className="renewals-table">
                      <thead>
                        <tr>
                          <th>Plan Name</th>
                          <th>User Email</th>
                          <th>Billing Cycle</th>
                          <th>End Date</th>
                          <th>Days Until</th>
                          <th>Status</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renewals.map((r) => (
                          <tr key={r.id}>
                            <td className="plan-name">{r.plan}</td>
                            <td className="user-email">{r.email}</td>
                            <td>{r.cycle}</td>
                            <td className="date-col">{r.endDate}</td>
                            <td>
                              <span className="days-until-badge">{r.days}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${r.status}`}>{r.status}</span>
                            </td>
                            <td className="price-col">{r.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {renewals.length > 0 && (
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
          </React.Fragment>
      )}
    </div>
  );
};
