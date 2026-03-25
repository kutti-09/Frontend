import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// Category Styles as a global constant for robust scoping
const categoryStyles = {
  'Subscription': { color: '#10B981', icon: 'bi-credit-card-2-front' },
  'Content': { color: '#8B5CF6', icon: 'bi-play-circle' },
  'Delivery': { color: '#EF4444', icon: 'bi-hdd-network' },
  'AdOps': { color: '#3B82F6', icon: 'bi-broadcast' }
};

const getCategoryColor = (cat) => categoryStyles[cat]?.color || '#94A3B8';
const getCategoryIcon = (cat) => categoryStyles[cat]?.icon || 'bi-bell';

export const Notifications = () => {
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchNotifs = async () => {
         try {
            setLoading(true);
            const data = await adminService.getNotifications();

            setNotifications(data || []);
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchNotifs();
   }, []);

   const unread = notifications.filter(n => n.status === 'Unread');

   // Group by category to ensure all 4 are represented
   const categories = ['Subscription', 'Content', 'Delivery', 'AdOps'];
   const catCount = unread.reduce((acc, curr) => {
      if (categories.includes(curr.category)) {
         acc[curr.category] = (acc[curr.category] || 0) + 1;
      }
      return acc;
   }, { Subscription: 0, Content: 0, Delivery: 0, AdOps: 0 });
   
   const totalUnread = unread.length || 1; // prevent div by zero

   // Alert Aging
   const now = new Date();
   const aging = { '<24h': 0, '24-72h': 0, '>72h': 0 };
   unread.forEach(n => {
      const diffHrs = (now - new Date(n.createdDate)) / (1000 * 60 * 60);
      if (diffHrs < 24) aging['<24h']++;
      else if (diffHrs <= 72) aging['24-72h']++;
      else aging['>72h']++;
   });

   return (
      <div className="dashboard-content">
         <div className="page-header">
            <h1 className="page-title">Notifications & Alerts</h1>
            <p className="page-subtitle">High-priority platform alerts</p>
         </div>

         <div className="d-flex justify-content-end mb-4" style={{ marginTop: '-1rem' }}>
            <button className="btn btn-outline-purple btn-sm" style={{
               borderRadius: '8px',
               borderColor: 'rgba(147, 51, 234, 0.4)',
               background: 'rgba(147, 51, 234, 0.05)',
               color: '#fff',
               fontSize: '0.8rem',
               padding: '0.4rem 1.2rem',
               transition: 'all 0.3s ease',
               boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
               <i className="bi bi-check2-all me-2"></i>Mark all as read
            </button>
         </div>

         {loading ? (
            <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
         ) : (
            <div className="row g-4">
               <div className="col-md-4">
                  <div className="metric-card mb-4" style={{ height: 'auto', padding: '1.25rem' }}>
                     <div className="metric-header mb-3">
                        <span>Unread by Category</span>
                        <i className="bi bi-pie-chart"></i>
                     </div>
                     <div className="d-flex w-100 mb-2" style={{ borderRadius: '4px', overflow: 'hidden' }}>
                        {Object.entries(catCount).map(([cat, count]) => (
                           <div key={cat} style={{ width: `${(count / totalUnread) * 100}%`, height: '8px', backgroundColor: getCategoryColor(cat) }} title={cat}></div>
                        ))}
                     </div>
                     <div className="d-flex justify-content-between text-secondary small mt-2 flex-wrap gap-2" style={{ fontSize: '0.75rem' }}>
                        {Object.entries(catCount).map(([cat, count]) => (
                           <span key={cat}><i className="bi bi-circle-fill" style={{ color: getCategoryColor(cat), fontSize: '6px' }}></i> {cat} ({count})</span>
                        ))}
                     </div>
                  </div>

                  <div className="metric-card" style={{ height: 'auto', padding: '1.25rem' }}>
                     <div className="metric-header mb-3">
                        <span>Alert Aging (Unread)</span>
                        <i className="bi bi-bar-chart-steps"></i>
                     </div>
                     <div className="pe-2">
                        <div className="mb-2">
                           <div className="d-flex justify-content-between mb-1 small" style={{ fontSize: '0.75rem' }}>
                              <span>&lt; 24h</span>
                              <span className="text-secondary fw-bold">{aging['<24h']}</span>
                           </div>
                           <div className="progress" style={{ height: '6px', backgroundColor: 'var(--mt-bg-dark)' }}>
                              <div className="progress-bar" role="progressbar" style={{ width: `${(aging['<24h'] / totalUnread) * 100}%`, backgroundColor: 'var(--mt-purple-primary)' }}></div>
                           </div>
                        </div>
                        <div className="mb-2">
                           <div className="d-flex justify-content-between mb-1 small" style={{ fontSize: '0.75rem' }}>
                              <span>24 - 72h</span>
                              <span className="text-secondary fw-bold">{aging['24-72h']}</span>
                           </div>
                           <div className="progress" style={{ height: '6px', backgroundColor: 'var(--mt-bg-dark)' }}>
                              <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${(aging['24-72h'] / totalUnread) * 100}%` }}></div>
                           </div>
                        </div>
                        <div className="mb-0">
                           <div className="d-flex justify-content-between mb-1 small" style={{ fontSize: '0.75rem' }}>
                              <span>&gt; 72h</span>
                              <span className="text-secondary fw-bold">{aging['>72h']}</span>
                           </div>
                           <div className="progress" style={{ height: '6px', backgroundColor: 'var(--mt-bg-dark)' }}>
                              <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${(aging['>72h'] / totalUnread) * 100}%` }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="col-md-8">
                  <div className="metric-card" style={{ height: 'auto' }}>
                     <div className="metric-header border-bottom border-secondary pb-3 mb-2">
                        <span>Recent Notifications</span>
                        <i className="bi bi-list"></i>
                     </div>
                     <div className="list-group list-group-flush bg-transparent">
                        {notifications.slice(0, 10).map((notif, idx) => {
                           const timeAgo = Math.floor((new Date() - new Date(notif.createdDate)) / (1000 * 60 * 60));
                           let timeStr = timeAgo < 1 ? 'Just now' : (timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo / 24)}d ago`);
                           return (
                              <div key={notif.id} className="list-group-item bg-transparent text-light border-secondary px-0 py-2 d-flex align-items-start">
                                 <div className="me-3 mt-1" style={{ color: getCategoryColor(notif.category) }}>
                                    <i className={`bi ${getCategoryIcon(notif.category)} fs-5`}></i>
                                 </div>
                                 <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between w-100">
                                       <h6 className={`mb-0 ${notif.status === 'Unread' ? 'fw-bold' : 'text-secondary fw-normal'}`} style={{ fontSize: '0.9rem' }}>{notif.message}</h6>
                                       <small className="text-secondary ms-2 text-nowrap" style={{ fontSize: '0.7rem' }}>{timeStr}</small>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                       <small style={{ color: getCategoryColor(notif.category), fontSize: '0.75rem' }}>{notif.category}</small>
                                       {notif.status === 'Unread' && <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.6em' }}>New</span>}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
