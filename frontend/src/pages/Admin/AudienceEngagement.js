import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { adminService } from '../../services/adminService';
import './AudienceEngagement.css';

export const AudienceEngagement = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    avgDau: 0,
    avgMau: 0,
    avgWatchTime: 0,
    avgCompletion: 0
  });
  const [dauMauTrend, setDauMauTrend] = useState([]);
  const [watchTimeTrend, setWatchTimeTrend] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpis, trends, watchTrends] = await Promise.all([
          adminService.getEngagementKPIs(),
          adminService.getAudienceTrends(),
          adminService.getWatchTimeTrends()
        ]);
        
        setMetrics({
          avgDau: kpis?.avgDau || 0,
          avgMau: kpis?.avgMau || 0,
          avgWatchTime: kpis?.avgWatchTime || 0,
          avgCompletion: kpis?.avgCompletion || 0
        });
        setDauMauTrend(trends || []);
        setWatchTimeTrend(watchTrends || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Common styles for tooltips
  const tooltipBase = {
    backgroundColor: 'rgba(13, 13, 13, 0.95)',
    borderColor: 'rgba(147, 51, 234, 0.4)',
    borderWidth: 1,
    textStyle: { color: '#fff', fontSize: 13 }
  };

  const dauMauOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      ...tooltipBase,
      formatter: (params) => {
        let res = `<div style="padding: 4px; font-family: Inter;"><b>${params[0].name}</b><br/>`;
        params.forEach(p => {
          res += `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>${p.value.toLocaleString()}</b><br/>`;
        });
        return res + '</div>';
      }
    },
    legend: {
      data: ['Daily Active Users', 'Monthly Active Users'],
      bottom: 0,
      textStyle: { color: '#888' },
      icon: 'circle'
    },
    grid: { top: '10%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dauMauTrend.map(d => d.date),
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#666', fontSize: 10, interval: 14 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      min: 0, max: 60000, interval: 15000,
      axisLine: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
    },
    series: [
      {
        name: 'Daily Active Users', type: 'line', data: dauMauTrend.map(d => d.dau),
        symbol: 'circle', symbolSize: 4, itemStyle: { color: '#E879F9' }, lineStyle: { width: 2 }
      },
      {
        name: 'Monthly Active Users', type: 'line', data: dauMauTrend.map(d => d.mau),
        symbol: 'circle', symbolSize: 4, itemStyle: { color: '#9333EA' }, lineStyle: { width: 2 }
      }
    ]
  };

  const watchTimeOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      ...tooltipBase,
      formatter: (params) => {
        const p = params[0];
        return `
          <div style="padding: 10px; border: 1px solid rgba(147, 51, 234, 0.3); background: rgba(22, 22, 30, 0.95); border-radius: 4px;">
            <div style="color: #666; margin-bottom: 8px; font-size: 12px;">${p.name}</div>
            <div style="color: #9333EA; font-weight: 500;">Watch Time (min) : ${p.value.toLocaleString()} min</div>
          </div>
        `;
      }
    },
    grid: { top: '10%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: watchTimeTrend.map(d => d.date),
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#666', fontSize: 10, interval: 4 },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      min: 0, max: 160000, interval: 40000,
      axisLine: { show: false },
      axisLabel: { color: '#666' },
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
    },
    series: [{
      name: 'Watch Time', type: 'line', data: watchTimeTrend.map(d => d.value),
      symbol: 'circle', symbolSize: 6,
      itemStyle: { color: '#fff', borderColor: '#9333EA', borderWidth: 2 },
      lineStyle: { width: 3, color: '#9333EA' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(147, 51, 234, 0.15)' },
            { offset: 1, color: 'rgba(147, 51, 234, 0)' }
          ]
        }
      }
    }]
  };

  return (
    <div className="dashboard-content">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
           <h1 className="page-title">Audience & Engagement</h1>
           <p className="page-subtitle">Executive view of platform engagement</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
            <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Avg DAU (90d)</span>
              <i className="bi bi-people"></i>
            </div>
            <div className="metric-value">{metrics.avgDau.toLocaleString()}</div>
            <div className="metric-sub mt-2">Daily active reach</div>
          </div>
        </div>
        <div className="col-md-3">
            <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Avg MAU (90d)</span>
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="metric-value">{metrics.avgMau.toLocaleString()}</div>
            <div className="metric-sub mt-2">Monthly active reach</div>
          </div>
        </div>
        <div className="col-md-3">
            <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Avg Watch Time (30d)</span>
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="metric-value">{metrics.avgWatchTime.toLocaleString()}</div>
            <div className="metric-sub mt-1">minutes</div>
          </div>
        </div>
        <div className="col-md-3">
            <div className="metric-card">
            <div className="metric-header text-secondary mb-1">
              <span>Avg Completion (30d)</span>
              <i className="bi bi-check2-circle"></i>
            </div>
            <div className="metric-value">{metrics.avgCompletion}%</div>
            <div className="metric-sub mt-2">Content finish rate</div>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>
      ) : (
        <React.Fragment>
          <div className="full-width-chart-card">
            <div className="chart-header">
              <h4 className="chart-title">DAU & MAU (Last 90 Days)</h4>
              <i className="bi bi-graph-up text-secondary"></i>
            </div>
            <div style={{ height: '350px' }}>
              <ReactECharts option={dauMauOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div className="full-width-chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Total Watch Time (Last 30 Days)</h4>
              <i className="bi bi-clock-history text-secondary"></i>
            </div>
            <div style={{ height: '350px' }}>
              <ReactECharts option={watchTimeOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
