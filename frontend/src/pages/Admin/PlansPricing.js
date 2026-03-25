import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './PlansPricing.css';

const formatActiveSubscribersChart = (apiData) => {
  const result = {};

  apiData.forEach(item => {
    const plan = item.planName;
    const cycle = item.billingCycle.toLowerCase(); // monthly | yearly

    if (!result[plan]) {
      result[plan] = { monthly: 0, yearly: 0, total: 0 };
    }

    result[plan][cycle] = item.count;
  });

  Object.keys(result).forEach(plan => {
    result[plan].total = result[plan].monthly + result[plan].yearly;
  });

  return result;
};


const normalizeMrrData = (apiData) => {
  const plans = new Set();
  const monthMap = {};

  apiData.forEach(row => {
    const { month, ...values } = row;
    if (!monthMap[month]) monthMap[month] = {};
    Object.entries(values).forEach(([plan, val]) => {
      plans.add(plan);
      monthMap[month][plan] = val;
    });
  });

  const sortedMonths = Object.keys(monthMap).sort();

  return sortedMonths.map(month => {
    const entry = { month };
    plans.forEach(plan => {
      entry[plan] = monthMap[month][plan] || 0;
    });
    return entry;
  });
};


export const PlansPricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null });
  const [chartData, setChartData] = useState([]);
  const [mrrData, setMrrData] = useState([]);

  const handleMouseEnter = (e, content) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        const [plansData, activeSubsData] = await Promise.all([
          adminService.getPlans(),
          adminService.getActiveSubscribersChart()
        ]);
        
        const formattedChartData = formatActiveSubscribersChart(activeSubsData);
        setPlans(plansData || []);
        setChartData(formattedChartData);
        
    const raw = await adminService.getMrrByPlan();
    const normalized = normalizeMrrData(raw);
    
    // Map to SVG coordinates
    const mapped = normalized.map((entry, i) => {
      const total = Object.entries(entry)
        .filter(([key]) => key !== 'month')
        .reduce((sum, [, val]) => sum + val, 0);
        
      return {
        label: entry.month,
        x: (i / (normalized.length - 1 || 1)) * 1000,
        val: total,
        basic: entry.Basic || 0,
        standard: entry.Standard || 0,
        premium: entry.Premium || 0
      };
    });
    setMrrData(mapped);


      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="dashboard-content">
      {/* Tooltip Component */}
      {tooltip.show && (
        <div 
          className="mt-tooltip" 
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Plans & Pricing</h1>
        <p className="page-subtitle">Subscription plan management and financial analytics</p>
      </div>

      <div className="inventory-card">
        <div className="inventory-header">
          <h4 className="inventory-title">Plan Inventory</h4>
          <button className="btn-add-plan">
             <i className="bi bi-plus"></i>
             Add
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="mt-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Billing Cycle</th>
                  <th>Status</th>
                  <th>Entitlements</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  {plans.map((plan) => {
    
    let ent = plan.entitlementsJSON;
    if (typeof ent === "string") {
      try {
        ent = JSON.parse(ent);
      } catch {
        ent = null;
      }
    }

    return (
      <tr key={plan.planId}>
        <td className="fw-bold">{plan.name}</td>
        <td>₹{plan.price}</td>
        <td>{plan.billingCycle}</td>
        <td>
          <span className="badge-purple">{plan.status}</span>
        </td>
        <td className="text-secondary small">
          {ent ? (
            <>
              {ent.allowedDevices} devices,{" "}
              {ent.downloads ? "downloads" : "no downloads"},{" "}
              {ent.ads ? "with ads" : "ad‑free"}
            </>
          ) : (
            "—"
          )}
        </td>
        <td>
          <a href="#" className="action-link">
            <i className="bi bi-pencil-square"></i> Edit
          </a>
          <a href="#" className="action-link delete ms-3">
            <i className="bi bi-trash"></i> Delete
          </a>
        </td>
      </tr>
    );
  })}

  {plans.length === 0 && !loading && (
    <tr>
      <td colSpan="6" className="text-center text-secondary py-4">
        No plans found.
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="row g-4 mt-2">
         {/* Chart 1: Active Subscriptions by Plan */}
         <div className="col-md-6">
            <div className="chart-card">
              <h4 className="chart-title">Active Subscriptions by Plan</h4>
              
              <div className="bar-chart-container">
                <div className="chart-grid">
                  <div className="grid-line"><span>40</span></div>
                  <div className="grid-line"><span>30</span></div>
                  <div className="grid-line"><span>20</span></div>
                  <div className="grid-line"><span>10</span></div>
                  <div className="grid-line"><span>0</span></div>
                </div>

                {Object.entries(chartData).map(([name, data]) => (
  <div key={name} className="bar-group">
    <div className="bars-wrapper">
      <div
        className="v-bar monthly"
        style={{ height: `${data.monthly * 20}%` }}
      />
      <div
        className="v-bar yearly"
        style={{ height: `${data.yearly * 20}%` }}
      />
    </div>
    <span className="bar-label">{name}</span>
  </div>
))}
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color monthly"></div>
                  <span>Monthly</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color yearly"></div>
                  <span>Yearly</span>
                </div>
              </div>
            </div>
         </div>
         
         {/* Chart 2: Billing Mix */}
         <div className="col-md-6">
            <div className="chart-card">
              <h4 className="chart-title">Billing Mix</h4>
              
              <div className="billing-mix-container">
                {Object.entries(chartData).map(([name, data]) => (
  <div key={name} className="billing-row">
    <div className="mix-label-row">
      <span className="fw-bold">{name}</span>
      <span className="mix-total">{data.total} total</span>
    </div>

    <div className="mix-bar">
      {/* Monthly segment */}
      {data.monthly > 0 && (
        <div
          className="mix-segment monthly"
          style={{ width: `${(data.monthly / data.total) * 100}%` }}
          onMouseEnter={(e) =>
            handleMouseEnter(e, <span>{data.monthly} Monthly Subscriptions</span>)
          }
          onMouseLeave={handleMouseLeave}
        >
          {data.monthly} Monthly
        </div>
      )}

      {/* Yearly segment */}
      {data.yearly > 0 && (
        <div
          className="mix-segment yearly"
          style={{ width: `${(data.yearly / data.total) * 100}%` }}
          onMouseEnter={(e) =>
            handleMouseEnter(e, <span>{data.yearly} Yearly Subscriptions</span>)
          }
          onMouseLeave={handleMouseLeave}
        >
          {data.yearly} Yearly
        </div>
      )}
    </div>
  </div>
))}
              </div>
            </div>
         </div>
      </div>

      {/* Chart 3: MRR by Plan (Last 6 Months) */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="chart-card">
            <h4 className="chart-title">MRR by Plan (Last 6 Months)</h4>
            
            <div className="area-chart-container">
              <svg className="area-chart-svg" viewBox="0 -25 1000 350" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
                  </linearGradient>
                  
                  <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <g transform="translate(0, 25)">

                <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
                  <line x1="0" y1="0" x2="1000" y2="0" />
                  <line x1="0" y1="75" x2="1000" y2="75" />
                  <line x1="0" y1="150" x2="1000" y2="150" />
                  <line x1="0" y1="225" x2="1000" y2="225" />
                </g>

                <g fontSize="12" fill="rgba(255,255,255,0.3)">
                  <text x="5" y="15">1200</text>
                  <text x="5" y="90">900</text>
                  <text x="5" y="165">600</text>
                  <text x="5" y="240">300</text>
                  <text x="5" y="295">0</text>
                </g>

                <g stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4">
                  {mrrData.map(d => (
                    <line key={d.label} x1={d.x} y1="0" x2={d.x} y2="300" />
                  ))}
                </g>

                <path 
                  d={`M ${mrrData.map(d => `${d.x} ${300 - (d.val / 4)}`).join(' L ')} L 1000 300 L 0 300 Z`}
                  fill="url(#areaGradient)" 
                />

                <path 
                  d={`M ${mrrData.map(d => `${d.x} ${300 - (d.val / 4)}`).join(' L ')}`}
                  fill="none" 
                  stroke="#C084FC" 
                  strokeWidth="3" 
                  filter="url(#lineGlow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Invisible Trigger Areas for MRR Chart */}
                {mrrData.map((d, i) => (
                  <rect
                    key={i}
                    x={d.x - 50}
                    y="0"
                    width="100"
                    height="300"
                    fill="transparent"
                    className="mrr-trigger-rect"
                    onMouseEnter={(e) => handleMouseEnter(e, (
                      <>
                        <span className="tooltip-title">{d.label}</span>
                        <div className="tooltip-row"><span>Total MRR:</span> <span>₹{d.val.toLocaleString()}</span></div>
                        <div className="tooltip-row"><small>Click for Details</small></div>
                      </>
                    ))}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}

                <g fontSize="13" fill="#FAFAFA" fontWeight="500">
                  {mrrData.map((d, i) => (
                    <text 
                      key={i} 
                      x={d.x} 
                      y="325" 
                      textAnchor={i === 0 ? 'start' : i === mrrData.length - 1 ? 'end' : 'middle'}
                    >
                      {d.label}
                    </text>
                  ))}
                </g>
                </g>
              </svg>
            </div>

            <div className="mrr-legend">
              <div className="mrr-legend-item">
                <div className="mrr-dot basic"></div>
                <span style={{ color: '#C084FC' }}>Basic</span>
              </div>
              <div className="mrr-legend-item">
                <div className="mrr-dot standard"></div>
                <span style={{ color: '#9333EA' }}>Standard</span>
              </div>
              <div className="mrr-legend-item">
                <div className="mrr-dot premium"></div>
                <span style={{ color: '#FAFAFA' }}>Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
