import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ReactECharts from 'echarts-for-react';
import './RolesPolicies.css';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'Editor', status: 'ACTIVE' };

export const RolesPolicies = () => {
  // ── Dashboard Stats ──
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminStats, setAdminStats] = useState(0);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [entitlementScopeData, setEntitlementScopeData] = useState([]);
  const [expiringGrants, setExpiringGrants] = useState({ lessThan7Days: 0, sevenTo30Days: 0, moreThan30Days: 0 });

  // ── Policy Drift Table ──
  const [driftData, setDriftData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // ── Users Table ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // ── Form / Modal ──
  const [showForm, setShowForm]         = useState(false);
  const [editingUser, setEditingUser]   = useState(null);   // null = Add mode, object = Edit mode
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ────────────────────── Data Fetching ──────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [userCount, stats, roles, entitlements, grants] = await Promise.all([
          adminService.getTotalUserCount(),
          adminService.getAdminStats(),
          adminService.getRoleDistribution(),
          adminService.getEntitlementDistribution(),
          adminService.getExpiringGrants(),
        ]);
        setTotalUsers(userCount || 0);
        setAdminStats(stats || 0);
        setRoleDistribution(
          roles && typeof roles === 'object' && !Array.isArray(roles)
            ? Object.entries(roles).map(([name, value]) => ({ name, value }))
            : roles || []
        );
        setEntitlementScopeData(
          entitlements && typeof entitlements === 'object' && !Array.isArray(entitlements)
            ? Object.entries(entitlements).map(([name, value]) => ({ name, value }))
            : entitlements || []
        );
        setExpiringGrants(grants || { lessThan7Days: 0, sevenTo30Days: 0, moreThan30Days: 0 });
      } catch (e) { console.error('Stats fetch error:', e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Users fetch error:', e); }
    finally { setUsersLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await adminService.getPolicyDrift(currentPage - 1, rowsPerPage);
        setDriftData(response.content || response || []);
        setTotalPages(response.totalPages || 0);
      } catch (e) { console.error('Drift fetch error:', e); }
      finally { setLoading(false); }
    })();
  }, [currentPage]);

  // ────────────────────── Form Handlers ──────────────────────

  const openAdd = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name:     user.name     || user.username || '',
      email:    user.email    || '',
      phone:    user.phone    || user.phoneNumber || '',
      password: '',
      role:     user.role     || 'Editor',
      status:   user.status   || (user.active ? 'ACTIVE' : 'INACTIVE') || 'ACTIVE',
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingUser(null); setFormError(''); };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.email) {
      setFormError('Name and email are required.');
      return;
    }
    if (!editingUser && !formData.password) {
      setFormError('Password is required for new users.');
      return;
    }
    try {
      setFormSubmitting(true);
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // skip empty password on edit
        await adminService.updateUser(editingUser.userId || editingUser.id, payload);
      } else {
        await adminService.createUser(formData);
      }
      closeForm();
      fetchUsers();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ────────────────────── Badge Helpers ──────────────────────

  const roleBadgeClass = (role) => {
    const map = { Admin: 'role-admin', AdOps: 'role-adops', Editor: 'role-editor', Operator: 'role-operator', Viewer: 'role-viewer' };
    return `role-badge ${map[role] || 'role-viewer'}`;
  };

  const isActive = (u) =>
    u.status === true || u.status === 'ACTIVE' || u.status === 'active' || u.active === true;

  // ────────────────────── ECharts ──────────────────────

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#888' } },
    yAxis: {
      type: 'category',
      data: roleDistribution.map(d => d.name).reverse(),
      axisLabel: { color: '#ccc', fontSize: 11 },
      axisLine: { lineStyle: { color: '#333' } },
    },
    series: [{ name: 'Users', type: 'bar', data: roleDistribution.map(d => d.value).reverse(), itemStyle: { color: '#9333EA', borderRadius: [0, 4, 4, 0] }, barWidth: '60%' }],
  };

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center', textStyle: { color: '#aaa' } },
    series: [{
      name: 'Entitlement Scope', type: 'pie', radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#06060c', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' } },
      data: entitlementScopeData.map((d, i) => ({ ...d, itemStyle: { color: i === 0 ? '#9333EA' : i === 1 ? '#C084FC' : '#E879F9' } })),
    }],
  };

  // ────────────────────── Render ──────────────────────

  return (
    <div className="dashboard-content">

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Roles &amp; Policies</h1>
        <p className="page-subtitle">RBAC Governance and Entitlements</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {loading ? (
          <div className="text-center w-100 mt-5"><div className="spinner-border text-light" role="status" /></div>
        ) : (
          <React.Fragment>
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1"><span>Admin Accounts</span><i className="bi bi-shield-lock" /></div>
                <div className="metric-value me-2">{adminStats}</div>
                <div className="metric-sub mt-2">Total</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1"><span>Total Users</span><i className="bi bi-people" /></div>
                <div className="metric-value total-users">{totalUsers.toLocaleString()}</div>
                <div className="metric-sub mt-2">Platform population</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="metric-card">
                <div className="metric-header text-secondary mb-1"><span>Expiring Special Grants</span><i className="bi bi-hourglass-split" /></div>
                <div className="mt-2">
                  <div className="d-flex justify-content-between text-secondary small mb-1"><span>&lt; 7 Days</span><span className="text-danger fw-bold">{expiringGrants.lessThan7Days}</span></div>
                  <div className="d-flex justify-content-between text-secondary small mb-1"><span>7–30 Days</span><span className="text-warning fw-bold">{expiringGrants.sevenTo30Days}</span></div>
                  <div className="d-flex justify-content-between text-secondary small"><span>&gt; 30 Days</span><span className="text-success fw-bold">{expiringGrants.moreThan30Days}</span></div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* ── User Management Table ── */}
      <div className="users-section">
        <div className="users-section-header">
          <div>
            <h2 className="section-label">User Management</h2>
            <p className="section-sublabel">Manage platform users and their assigned roles</p>
          </div>
          <button className="add-user-btn" onClick={openAdd}>
            <i className="bi bi-plus-lg"></i>
            <span>Add</span>
          </button>
        </div>

        <div className="drift-card">
          {usersLoading ? (
            <div className="text-center py-4"><div className="spinner-border text-light" role="status" /></div>
          ) : (
            <div className="table-responsive">
              <table className="drift-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-secondary py-4">No users found.</td></tr>
                  ) : (
                    users.map((u, idx) => (
                      <tr key={u.userId || idx}>
                        <td className="user-name-cell">
                          <div className="user-avatar-row">
                            <div className="user-mini-avatar">{(u.name || u.username || '?').charAt(0).toUpperCase()}</div>
                            {u.name || u.username || '—'}
                          </div>
                        </td>
                        <td className="email-cell">{u.email || '—'}</td>
                        <td><span className={roleBadgeClass(u.role)}>{u.role || '—'}</span></td>
                        <td>
                          <span className={`status-badge ${isActive(u) ? 'status-active' : 'status-inactive'}`}>
                            {isActive(u) ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button className="edit-row-btn" onClick={() => openEdit(u)}>
                            <i className="bi bi-pencil-square" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 charts-row">
        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header"><h4 className="chart-title">Users by Role</h4><i className="bi bi-person-badge" /></div>
            <div style={{ height: '300px' }}><ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} /></div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-container-card">
            <div className="chart-header"><h4 className="chart-title">Entitlement Scope</h4><i className="bi bi-pie-chart" /></div>
            <div style={{ height: '300px' }}><ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} /></div>
          </div>
        </div>
      </div>

      {/* Policy Drift */}
      <div className="policy-drift-section">
        <h2 className="section-label">Policy Drift — Special Access Grants</h2>
        <p className="section-sublabel">Users with custom entitlements (not following default plan scope)</p>
        <div className="drift-card">
          <div className="table-responsive">
            <table className="drift-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Content Scope</th><th>Granted Date</th><th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {driftData.map((user, idx) => (
                  <tr key={idx}>
                    <td className="user-name-cell">{user.name}</td>
                    <td className="email-cell">{user.email}</td>
                    <td><span className={`badge-mt badge-${user.contentScope}`}>{user.contentScope}</span></td>
                    <td className="date-cell">{user.grantedDate}</td>
                    <td className="date-cell">{user.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {driftData.length > 0 && (
            <div className="table-pagination">
              <div className="pagination-info">Page {currentPage} of {totalPages || 1}</div>
              <div className="pagination-btns">
                <button className="pag-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><i className="bi bi-chevron-left" /></button>
                <button className="pag-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}><i className="bi bi-chevron-right" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit User Form (centered overlay) ── */}
      {showForm && (
        <div className="rp-modal-overlay" onClick={closeForm}>
          <div className="rp-modal-box" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="rp-modal-header">
              <div>
                <h3 className="rp-modal-title">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="rp-modal-subtitle">
                  {editingUser
                    ? 'Update the user\'s details below'
                    : 'Fill in the details to create a new platform user'}
                </p>
              </div>
              <button className="rp-modal-close" onClick={closeForm}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="rp-modal-form">
              <div className="rp-modal-grid">

                <div className="rp-field">
                  <label>Full Name <span className="req">*</span></label>
                  <input
                    type="text" name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                <div className="rp-field">
                  <label>Email Address <span className="req">*</span></label>
                  <input
                    type="email" name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                <div className="rp-field">
                  <label>Phone Number</label>
                  <input
                    type="tel" name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="rp-field">
                  <label>
                    Password {!editingUser && <span className="req">*</span>}
                    {editingUser && <span className="optional-hint">(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password" name="password"
                    placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Enter password'}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="rp-field">
                  <label>Role <span className="req">*</span></label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="Admin">Admin</option>
                    <option value="AdOps">AdOps</option>
                    <option value="Editor">Editor</option>
                    <option value="Operator">Operator</option>
                  </select>
                </div>

                <div className="rp-field">
                  <label>Status <span className="req">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

              </div>

              {formError && (
                <div className="rp-error">
                  <i className="bi bi-exclamation-circle-fill" />
                  {formError}
                </div>
              )}

              <div className="rp-modal-actions">
                <button type="button" className="rp-cancel-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="rp-submit-btn" disabled={formSubmitting}>
                  {formSubmitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />{editingUser ? 'Saving...' : 'Creating...'}</>
                    : editingUser
                      ? <><i className="bi bi-check2 me-2" />Save Changes</>
                      : <><i className="bi bi-person-plus me-2" />Add User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
