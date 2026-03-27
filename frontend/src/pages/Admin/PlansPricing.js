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
  const [mrrData, setMrrData] = useState({ data: [], plans: [], maxVal: 1000 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    billingCycle: 'Monthly',
    status: 'Active',
    videoQuality: 'SD (480p)',
    allowedDevices: '',
    accessibleCategories: ['News', 'Sports', 'Movies'],
    download: true,
    ads: false
  });

  const handleMouseEnter = (e, content) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'accessibleCategories') {
      let categories = [...newPlan.accessibleCategories];
      if (checked) {
        categories.push(value);
      } else {
        categories = categories.filter(c => c !== value);
      }
      setNewPlan(prev => ({ ...prev, accessibleCategories: categories }));
    } else if (type === 'checkbox') {
      setNewPlan(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewPlan(prev => ({ ...prev, [name]: value }));
    }
  };

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

      // Extract all unique plans from normalized
      const allPlans = new Set();
      normalized.forEach(entry => {
        Object.keys(entry).forEach(k => {
          if (k !== 'month') allPlans.add(k);
        });
      });
      const plansArr = Array.from(allPlans);

      let maxVal = 0;
      normalized.forEach(entry => {
        plansArr.forEach(plan => {
          if (entry[plan] > maxVal) maxVal = entry[plan];
        });
      });
      maxVal = Math.ceil((maxVal || 10) / 1000) * 1000;
      if (maxVal === 0) maxVal = 1000;

      const mapped = normalized.map((entry, i) => {
        const item = {
          label: entry.month,
          x: 40 + (i / (normalized.length - 1 || 1)) * 920,
          values: {}
        };
        plansArr.forEach(plan => {
          item.values[plan] = entry[plan] || 0;
        });
        return item;
      });
      
      setMrrData({ data: mapped, plans: plansArr, maxVal });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newPlan.name,
        price: newPlan.price,
        billingCycle: newPlan.billingCycle,
        status: newPlan.status,
        entitlements: JSON.stringify({
          videoQuality: newPlan.videoQuality,
          allowedDevices: parseInt(newPlan.allowedDevices) || 1,
          download: newPlan.download,
          ads: newPlan.ads,
          accessibleCategories: newPlan.accessibleCategories
        })
      };

      if (editingPlanId) {
        await adminService.updatePlan(editingPlanId, payload);
      } else {
        await adminService.addPlan(payload);
      }

      setShowAddForm(false);
      setEditingPlanId(null);
      setNewPlan({
        name: '',
        price: '',
        billingCycle: 'Monthly',
        status: 'Active',
        videoQuality: 'SD (480p)',
        allowedDevices: '',
        accessibleCategories: ['News', 'Sports', 'Movies'],
        download: true,
        ads: false
      });
      await fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (plan) => {
    let ent = {
      videoQuality: 'SD (480p)',
      allowedDevices: '',
      accessibleCategories: ['News', 'Sports', 'Movies'],
      download: true,
      ads: false
    };
    try {
      if (typeof plan.entitlementsJSON === "string") {
        ent = JSON.parse(plan.entitlementsJSON);
      } else if (plan.entitlementsJSON) {
        ent = plan.entitlementsJSON;
      }
    } catch (e) { console.error('Error parsing entitlements', e); }

    setNewPlan({
      name: plan.name || '',
      price: plan.price || '',
      billingCycle: plan.billingCycle || 'Monthly',
      status: plan.status || 'Active',
      videoQuality: ent.videoQuality || 'SD (480p)',
      allowedDevices: ent.allowedDevices || '',
      accessibleCategories: ent.accessibleCategories || [],
      download: ent.download === undefined ? true : ent.download,
      ads: ent.ads === undefined ? false : ent.ads
    });
    setEditingPlanId(plan.planId);
    setShowAddForm(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await adminService.deletePlan(planId);
        await fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("Failed to delete plan. Please check the console for details.");
      }
    }
  };

  useEffect(() => {
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
          <button className="btn-add-plan" onClick={() => {
            setEditingPlanId(null);
            setNewPlan({
              name: '',
              price: '',
              billingCycle: 'Monthly',
              status: 'Active',
              videoQuality: 'SD (480p)',
              allowedDevices: '',
              accessibleCategories: ['News', 'Sports', 'Movies'],
              download: true,
              ads: false
            });
            setShowAddForm(true);
          }}>
            <i className="bi bi-plus"></i>
            Add
          </button>
        </div>

        {showAddForm && (
          <div className="add-plan-overlay">
            <div className="add-plan-modal">
              <div className="add-plan-header">
                <h5 className="mb-0">{editingPlanId ? "Edit Subscription Plan" : "Add New Subscription Plan"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowAddForm(false); setEditingPlanId(null); }} aria-label="Close"></button>
              </div>

              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Plan Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newPlan.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={newPlan.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 4499"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Billing Cycle</label>
                    <select
                      className="form-select"
                      name="billingCycle"
                      value={newPlan.billingCycle}
                      onChange={handleInputChange}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="col-md-4 mt-4">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={newPlan.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-4 mt-4">
                    <label className="form-label">Video Quality</label>
                    <select
                      className="form-select"
                      name="videoQuality"
                      value={newPlan.videoQuality}
                      onChange={handleInputChange}
                    >
                      <option value="SD (480p)">SD (480p)</option>
                      <option value="HD (720p)">HD (720p)</option>
                      <option value="Full HD (1080p)">Full HD (1080p)</option>
                      <option value="4K (2160p)">4K (2160p)</option>
                    </select>
                  </div>
                  <div className="col-md-4 mt-4">
                    <label className="form-label">Allowed Devices</label>
                    <input
                      type="number"
                      className="form-control"
                      name="allowedDevices"
                      value={newPlan.allowedDevices}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <label className="form-label d-block">Accessible Categories</label>
                    <div className="d-flex gap-4">
                      {['News', 'Sports', 'Movies'].map(cat => (
                        <div className="form-check" key={cat}>
                          <input
                            className="form-check-input mt-checkbox"
                            type="checkbox"
                            name="accessibleCategories"
                            value={cat}
                            id={`cat-${cat}`}
                            checked={newPlan.accessibleCategories.includes(cat)}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor={`cat-${cat}`}>
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 mt-3 mb-4 d-flex gap-5">
                    <div className="form-check form-switch px-0 d-flex align-items-center gap-2">
                      <label className="form-check-label m-0 order-2" htmlFor="flexSwitchDownload">Downloads</label>
                      <input
                        className="form-check-input m-0 float-none mx-switch order-1"
                        type="checkbox"
                        role="switch"
                        name="download"
                        checked={newPlan.download}
                        onChange={handleInputChange}
                        id="flexSwitchDownload"
                      />
                    </div>
                    <div className="form-check form-switch px-0 d-flex align-items-center gap-2">
                      <label className="form-check-label m-0 order-2" htmlFor="flexSwitchAds">Show Ads</label>
                      <input
                        className="form-check-input m-0 float-none mx-switch mx-switch-blue order-1"
                        type="checkbox"
                        role="switch"
                        name="ads"
                        checked={newPlan.ads}
                        onChange={handleInputChange}
                        id="flexSwitchAds"
                      />
                    </div>
                  </div>

                  <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-1">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ width: 'auto', flex: 'none' }}
                      onClick={() => { setShowAddForm(false); setEditingPlanId(null); }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: 'auto', flex: 'none' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

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
                        <button className="action-link border-0 bg-transparent p-0" onClick={() => handleEdit(plan)}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          className="action-link delete ms-3 border-0 bg-transparent p-0"
                          onClick={() => handleDelete(plan.planId)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
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
                      onMouseEnter={(e) => handleMouseEnter(e, (
                        <>
                          <span className="tooltip-title">{name} - Monthly</span>
                          <div className="tooltip-row"><span>Count:</span> <span>{data.monthly}</span></div>
                        </>
                      ))}
                      onMouseLeave={handleMouseLeave}
                    />
                    <div
                      className="v-bar yearly"
                      style={{ height: `${data.yearly * 20}%` }}
                      onMouseEnter={(e) => handleMouseEnter(e, (
                        <>
                          <span className="tooltip-title">{name} - Yearly</span>
                          <div className="tooltip-row"><span>Count:</span> <span>{data.yearly}</span></div>
                        </>
                      ))}
                      onMouseLeave={handleMouseLeave}
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
              <svg className="area-chart-svg" viewBox="0 -25 1000 380" preserveAspectRatio="none">
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
                    <text x="5" y="15">{mrrData.maxVal}</text>
                    <text x="5" y="90">{mrrData.maxVal * 0.75}</text>
                    <text x="5" y="165">{mrrData.maxVal * 0.5}</text>
                    <text x="5" y="240">{mrrData.maxVal * 0.25}</text>
                    <text x="5" y="295">0</text>
                  </g>

                  <g stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4">
                    {mrrData.data.map(d => (
                      <line key={d.label} x1={d.x} y1="0" x2={d.x} y2="300" />
                    ))}
                  </g>

                  {mrrData.plans.map((plan, i) => {
                    const color = ['#C084FC', '#9333EA', '#FAFAFA', '#60A5FA', '#34D399'][i % 5];
                    const pathD = `M ${mrrData.data.map(d => `${d.x} ${300 - ((d.values[plan] || 0) / mrrData.maxVal) * 300}`).join(' L ')}`;
                    
                    return (
                      <g key={plan}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                          filter="url(#lineGlow)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {mrrData.data.map((d, index) => (
                          <circle
                            key={`${plan}-${index}`}
                            cx={d.x}
                            cy={300 - ((d.values[plan] || 0) / mrrData.maxVal) * 300}
                            r="5"
                            fill={color}
                            stroke="#12121A"
                            strokeWidth="2"
                            style={{ pointerEvents: 'none' }}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* Invisible Trigger Areas for general X-axis MRR Chart sweep (optional background capture) */}
                  {mrrData.data.map((d, i) => (
                    <rect
                      key={i}
                      x={d.x - 40}
                      y="0"
                      width="80"
                      height="330"
                      fill="transparent"
                      className="mrr-trigger-rect"
                      onMouseEnter={(e) => handleMouseEnter(e, (
                        <>
                          <span className="tooltip-title">{d.label}</span>
                          {mrrData.plans.map((plan, j) => {
                            const color = ['#C084FC', '#9333EA', '#FAFAFA', '#60A5FA', '#34D399'][j % 5];
                            return (
                              <div key={plan} className="tooltip-row" style={{ color }}>
                                <span>{plan}:</span> 
                                <span style={{ color: '#FAFAFA' }}>₹{(d.values[plan] || 0).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </>
                      ))}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}

                  <g fontSize="13" fill="#FAFAFA" fontWeight="500">
                    {mrrData.data.map((d, i) => (
                      <text
                        key={i}
                        x={d.x}
                        y="340"
                        textAnchor={i === 0 ? 'start' : i === mrrData.data.length - 1 ? 'end' : 'middle'}
                      >
                        {d.label}
                      </text>
                    ))}
                  </g>
                </g>
              </svg>
            </div>

            <div className="mrr-legend">
              {mrrData.plans.map((plan, i) => {
                const color = ['#C084FC', '#9333EA', '#FAFAFA', '#60A5FA', '#34D399'][i % 5];
                return (
                  <div key={plan} className="mrr-legend-item">
                    <div className="mrr-dot" style={{ backgroundColor: color }}></div>
                    <span style={{ color }}>{plan}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
