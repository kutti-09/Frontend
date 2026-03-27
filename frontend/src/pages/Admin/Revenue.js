import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { adminService } from '../../services/adminService';

export const Revenue = () => {
   const [metrics, setMetrics] = useState({
      mrr: 0, arr: 0, arpu: 0, netAdds: 0,
      adRev: 0, ecpm: 0, ctr: '0%', fillRate: '0%'
   });
   const [loading, setLoading] = useState(true);

   const [revenueHistory, setRevenueHistory] = useState([]);
   const [arpuByPlan, setArpuByPlan] = useState([]);
   const [adYieldTrends, setAdYieldTrends] = useState([]);
   const [ctrFillRate, setCtrFillRate] = useState([]);

   useEffect(() => {
      const fetchRevenue = async () => {
         try {
            setLoading(true);
            const [
               revenueData,
               arpuData,
               adYieldData,
               ctrFillData,
               mrr, arr, arpu, adRev
            ] = await Promise.all([
               adminService.getRevenueBreakdown(),
               adminService.getARPUByPlan(),
               adminService.getAdYieldTrends(),
               adminService.getPlatformCTR(),
               adminService.getMRR(),
               adminService.getARR(),
               adminService.getARPU(),
               adminService.getMonthlyAdRevenue()
            ]);

            setRevenueHistory(revenueData || []);
            setArpuByPlan(arpuData || []);
            setAdYieldTrends(adYieldData || []);
            setCtrFillRate(ctrFillData || []);

            setMetrics({
               mrr: mrr || 0,
               arr: arr || 0,
               arpu: arpu || 0,
               netAdds: 0,
               adRev: adRev || 0,
               ctr: ctrFillData?.[0]?.ctr || '0%',
               fillRate: ctrFillData?.[0]?.fillRate || '0%',
               ecpm: adYieldData?.[0]?.ecpm || 0
            });

            console.log(metrics);

         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
      };
      fetchRevenue();
   }, []);

   const tooltipBase = {
      backgroundColor: 'rgba(13, 13, 13, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
   };

   const breakdownOption = {
      backgroundColor: 'transparent',
      tooltip: {
         trigger: 'axis',
         axisPointer: { type: 'shadow' },
         ...tooltipBase,
         formatter: (params) => {
            let res = `<div style="padding: 4px;"><b>${params[0].name}</b><br/>`;
            let total = 0;
            params.forEach(p => {
               res += `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>₹${p.value.toLocaleString()}</b><br/>`;
               total += p.value;
            });
            res += `<hr style="margin: 5px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.1)"/>`;
            res += `Total: <b>₹${total.toLocaleString()}</b></div>`;
            return res;
         }
      },
      legend: {
         data: ['Subscriptions', 'Ads'],
         bottom: 0,
         textStyle: { color: '#888' },
         icon: 'circle'
      },
      grid: { top: '8%', left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
         type: 'category',
         data: revenueHistory.map(d => d.month),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666' }
      },
      yAxis: {
         type: 'value',
         axisLine: { show: false },
         axisLabel: { color: '#666', formatter: (v) => `₹${v / 1000}k` },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [
         {
            name: 'Subscriptions', type: 'bar', stack: 'total',
            data: revenueHistory.map(d => d.subs),
            itemStyle: { color: '#9333EA' }
         },
         {
            name: 'Ads', type: 'bar', stack: 'total',
            data: revenueHistory.map(d => d.ads),
            itemStyle: { color: '#b49cceff', borderRadius: [4, 4, 0, 0] }
         }
      ]
   };

   const arpuOption = {
      backgroundColor: 'transparent',
      tooltip: {
         trigger: 'axis',
         axisPointer: { type: 'shadow' },
         ...tooltipBase,
         formatter: (params) => {
            const p = params[0];
            return `<div style="padding: 4px;"><b>${p.name} Plan</b><br/>ARPU: <b>₹${p.value.toFixed(2)}</b></div>`;
         }
      },
      grid: { top: '10%', left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
         type: 'category',
         data: arpuByPlan.map(d => d.name),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666' }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 20, interval: 5,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [{
         name: 'ARPU', type: 'bar', barWidth: '60%',
         data: arpuByPlan.map(d => d.value),
         itemStyle: { color: '#9333EA', borderRadius: [4, 4, 0, 0] }
      }]
   };

   const ecpmOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', ...tooltipBase },
      grid: { top: '15%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
         type: 'category',
         data: adYieldTrends.map(d => d.date),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666', fontSize: 10, interval: 2 },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 20, interval: 5,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [{
         name: 'eCPM', type: 'line', data: adYieldTrends.map(d => d.ecpm),
         symbol: 'circle', symbolSize: 6, itemStyle: { color: '#fff', borderColor: '#9333EA', borderWidth: 2 },
         lineStyle: { width: 2, color: '#9333EA' }
      }]
   };

   const ctrFillOption = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipBase },
      legend: {
         data: ['CTR (%)', 'Fill Rate (%)'],
         bottom: 0, textStyle: { color: '#888' }, icon: 'rect'
      },
      grid: { top: '15%', left: '3%', right: '4%', bottom: '20%', containLabel: true },
      xAxis: {
         type: 'category',
         data: ctrFillRate.map(d => d.date),
         axisLine: { lineStyle: { color: '#333' } },
         axisLabel: { color: '#666', fontSize: 10, interval: 2 },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
      },
      yAxis: {
         type: 'value',
         min: 0, max: 100, interval: 25,
         axisLine: { show: false }, axisLabel: { color: '#666' },
         splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
      },
      series: [
         {
            name: 'CTR (%)', type: 'bar', data: ctrFillRate.map(d => d.ctr),
            itemStyle: { color: '#9333EA', borderRadius: [2, 2, 0, 0] }
         },
         {
            name: 'Fill Rate (%)', type: 'bar', data: ctrFillRate.map(d => d.fill),
            itemStyle: { color: '#A78BFA', borderRadius: [2, 2, 0, 0] }
         }
      ]
   };

   return (
      <div className="dashboard-content">
         <div className="page-header d-flex justify-content-between align-items-center">
            <div>
               <h1 className="page-title">Revenue</h1>
               <p className="page-subtitle">Subscriptions and Ads revenue overview</p>
            </div>
         </div>

         {loading ? (
            <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
         ) : (
            <React.Fragment>
               <h4 className="mb-3 text-secondary">Subscription Revenue</h4>
               <div className="row g-4 mb-5">
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>MRR</span>
                           <i className="bi bi-currency-rupee"></i>
                        </div>
                        <div className="metric-value">₹{metrics.mrr.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                        <div className="metric-sub text-success">+4.2% vs last month</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>ARR</span>
                           <i className="bi bi-graph-up"></i>
                        </div>
                        <div className="metric-value">₹{metrics.arr.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                        <div className="metric-sub text-success">+4.2% projected</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Net Adds</span>
                           <i className="bi bi-person-plus"></i>
                        </div>
                        <div className="metric-value">{metrics.netAdds}</div>
                        <div className="metric-sub text-secondary">New Activations - Lapsed</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>ARPU</span>
                           <i className="bi bi-bullseye"></i>
                        </div>
                        <div className="metric-value">₹{metrics.arpu.toFixed(2)}</div>
                        <div className="metric-sub text-secondary">Average per user</div>
                     </div>
                  </div>
               </div>

               <h4 className="mb-3 text-secondary">Ad Revenue</h4>
               <div className="row g-4 mb-5">
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Total Ad Revenue</span>
                           <i className="bi bi-cash-stack"></i>
                        </div>
                        <div className="metric-value">₹{metrics.adRev.toFixed(0)}</div>
                        <div className="metric-sub text-success">+12.5% vs last month</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Avg eCPM</span>
                           <i className="bi bi-tag"></i>
                        </div>
                        <div className="metric-value">₹{metrics.ecpm.toFixed(2)}</div>
                        <div className="metric-sub text-secondary">Platform average</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Platform CTR</span>
                           <i className="bi bi-cursor"></i>
                        </div>
                        <div className="metric-value">{metrics.ctr}</div>
                        <div className="metric-sub text-secondary">Weighted by impressions</div>
                     </div>
                  </div>
                  <div className="col-md-3">
                     <div className="metric-card">
                        <div className="metric-header">
                           <span>Fill Rate</span>
                           <i className="bi bi-boxes"></i>
                        </div>
                        <div className="metric-value">{metrics.fillRate}</div>
                        <div className="metric-sub text-success">Healthy inventory usage</div>
                     </div>
                  </div>
               </div>

               <div className="row g-4">
                  <div className="col-12">
                     <div className="metric-card p-4 mb-4" style={{ height: 'auto' }}>
                        <div className="metric-header mb-3">
                           <span>Revenue Breakdown: Subs vs Ads</span>
                           <i className="bi bi-bar-chart-steps"></i>
                        </div>
                        <div style={{ height: '220px' }}>
                           <ReactECharts option={breakdownOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                     </div>

                     <div className="metric-card p-4 mb-4" style={{ height: 'auto' }}>
                        <div className="metric-header mb-3">
                           <span>ARPU by Plan (Current Month)</span>
                           <i className="bi bi-bar-chart-line"></i>
                        </div>
                        <div style={{ height: '220px' }}>
                           <ReactECharts option={arpuOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                     </div>

                     <div className="row g-4">
                        <div className="col-md-6">
                           <div className="metric-card p-4" style={{ minHeight: '400px' }}>
                              <div className="metric-header mb-4">
                                 <span>Ad Yield Trend - eCPM (Weekly)</span>
                                 <i className="bi bi-lightning-charge"></i>
                              </div>
                              <div style={{ height: '300px' }}>
                                 <ReactECharts option={ecpmOption} style={{ height: '100%', width: '100%' }} />
                              </div>
                           </div>
                        </div>
                        <div className="col-md-6">
                           <div className="metric-card p-4" style={{ minHeight: '400px' }}>
                              <div className="metric-header mb-4">
                                 <span>Platform CTR & Fill Rate (Weekly)</span>
                                 <i className="bi bi-toggles"></i>
                              </div>
                              <div style={{ height: '300px' }}>
                                 <ReactECharts option={ctrFillOption} style={{ height: '100%', width: '100%' }} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </React.Fragment>
         )}
      </div>
   );
};