import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Activity,
  Bug,
  Sprout,
  Calendar,
  Layers,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CropPestHistoricalTrendPoint } from '../types';
import { getSynchronized30DayTrend } from '../data/trendData30Days';

interface CropPestTrendD3ChartProps {
  currentCropHealth?: number;
  currentPestSeverity?: number;
}

type TimeRangeFilter = '30d' | '14d' | '7d';
type MetricFilter = 'both' | 'cropOnly' | 'pestOnly';

interface TooltipData {
  point: CropPestHistoricalTrendPoint;
  x: number;
  yCrop: number;
  yPest: number;
}

export const CropPestTrendD3Chart: React.FC<CropPestTrendD3ChartProps> = ({
  currentCropHealth,
  currentPestSeverity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('both');
  const [hoveredData, setHoveredData] = useState<TooltipData | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Synchronize full 30-day baseline with latest live values
  const allPoints = useMemo(() => {
    return getSynchronized30DayTrend(currentCropHealth, currentPestSeverity);
  }, [currentCropHealth, currentPestSeverity]);

  // Filter based on selected time window
  const visiblePoints = useMemo(() => {
    if (timeRange === '7d') return allPoints.slice(-7);
    if (timeRange === '14d') return allPoints.slice(-14);
    return allPoints;
  }, [allPoints, timeRange]);

  // Key summary statistics over the selected period
  const stats = useMemo(() => {
    if (!visiblePoints.length) return null;
    const avgHealth = Math.round(
      visiblePoints.reduce((acc, p) => acc + p.cropHealthScore, 0) / visiblePoints.length
    );
    const avgPest = Math.round(
      visiblePoints.reduce((acc, p) => acc + p.pestSeverityIndex, 0) / visiblePoints.length
    );
    const maxPestPoint = [...visiblePoints].sort((a, b) => b.pestSeverityIndex - a.pestSeverityIndex)[0];
    const firstPoint = visiblePoints[0];
    const lastPoint = visiblePoints[visiblePoints.length - 1];
    const healthDelta = lastPoint.cropHealthScore - firstPoint.cropHealthScore;

    return {
      avgHealth,
      avgPest,
      maxPestPoint,
      healthDelta,
      currentHealth: lastPoint.cropHealthScore,
      currentPest: lastPoint.pestSeverityIndex,
    };
  }, [visiblePoints]);

  // Observe container size dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setContainerWidth(width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Primary D3 Render Effect
  useEffect(() => {
    if (!svgRef.current || !visiblePoints.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerWidth;
    const height = 340;
    const margin = { top: 28, right: 28, bottom: 45, left: 45 };
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    // Defs for gradients and shadow glow
    const defs = svg.append('defs');

    // Crop Health Area Gradient (Emerald)
    const cropGradient = defs
      .append('linearGradient')
      .attr('id', 'crop-health-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    cropGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.28);
    cropGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10B981').attr('stop-opacity', 0.0);

    // Pest Severity Area Gradient (Rose/Crimson)
    const pestGradient = defs
      .append('linearGradient')
      .attr('id', 'pest-severity-gradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    pestGradient.append('stop').attr('offset', '0%').attr('stop-color', '#EF4444').attr('stop-opacity', 0.28);
    pestGradient.append('stop').attr('offset', '100%').attr('stop-color', '#EF4444').attr('stop-opacity', 0.0);

    // Main Chart Group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(visiblePoints.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Horizontal Grid Lines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .call((group) => group.select('.domain').remove())
      .call((group) =>
        group
          .selectAll('line')
          .attr('stroke', '#E5E7EB')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-opacity', 0.8)
      );

    // Reference Threshold: Optimum Health Benchmark (80%)
    if (metricFilter !== 'pestOnly') {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(80))
        .attr('y2', yScale(80))
        .attr('stroke', '#10B981')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.6);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', yScale(80) - 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#059669')
        .attr('font-size', '9.5px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text('80% Optimum Health Target');
    }

    // Reference Threshold: Pest Action Threshold (50%)
    if (metricFilter !== 'cropOnly') {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(50))
        .attr('y2', yScale(50))
        .attr('stroke', '#EF4444')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.6);

      g.append('text')
        .attr('x', 8)
        .attr('y', yScale(50) - 4)
        .attr('fill', '#DC2626')
        .attr('font-size', '9.5px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text('50% IPM Action Threshold');
    }

    // Lines and Area Generators
    const cropLineGen = d3
      .line<CropPestHistoricalTrendPoint>()
      .x((d) => xScale(d.date) || 0)
      .y((d) => yScale(d.cropHealthScore))
      .curve(d3.curveMonotoneX);

    const cropAreaGen = d3
      .area<CropPestHistoricalTrendPoint>()
      .x((d) => xScale(d.date) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.cropHealthScore))
      .curve(d3.curveMonotoneX);

    const pestLineGen = d3
      .line<CropPestHistoricalTrendPoint>()
      .x((d) => xScale(d.date) || 0)
      .y((d) => yScale(d.pestSeverityIndex))
      .curve(d3.curveMonotoneX);

    const pestAreaGen = d3
      .area<CropPestHistoricalTrendPoint>()
      .x((d) => xScale(d.date) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.pestSeverityIndex))
      .curve(d3.curveMonotoneX);

    // Render Pest Area & Line
    if (metricFilter === 'both' || metricFilter === 'pestOnly') {
      g.append('path')
        .datum(visiblePoints)
        .attr('fill', 'url(#pest-severity-gradient)')
        .attr('d', pestAreaGen);

      const pestPath = g
        .append('path')
        .datum(visiblePoints)
        .attr('fill', 'none')
        .attr('stroke', '#EF4444')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', pestLineGen);

      // Smooth path entrance animation
      const totalPestLen = (pestPath.node() as SVGPathElement)?.getTotalLength() || 1000;
      pestPath
        .attr('stroke-dasharray', `${totalPestLen} ${totalPestLen}`)
        .attr('stroke-dashoffset', totalPestLen)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Render Crop Area & Line
    if (metricFilter === 'both' || metricFilter === 'cropOnly') {
      g.append('path')
        .datum(visiblePoints)
        .attr('fill', 'url(#crop-health-gradient)')
        .attr('d', cropAreaGen);

      const cropPath = g
        .append('path')
        .datum(visiblePoints)
        .attr('fill', 'none')
        .attr('stroke', '#10B981')
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', cropLineGen);

      // Smooth path entrance animation
      const totalCropLen = (cropPath.node() as SVGPathElement)?.getTotalLength() || 1000;
      cropPath
        .attr('stroke-dasharray', `${totalCropLen} ${totalCropLen}`)
        .attr('stroke-dashoffset', totalCropLen)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Significant Agronomic Event Marker Pins along the timeline
    visiblePoints.forEach((pt) => {
      if (!pt.eventNote) return;
      const cx = xScale(pt.date);
      if (cx === undefined) return;

      const markerG = g.append('g').attr('transform', `translate(${cx}, ${innerHeight + 16})`);

      markerG
        .append('circle')
        .attr('r', 3.5)
        .attr('fill', '#1B4332')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5);
    });

    // X Axis
    const tickInterval = visiblePoints.length > 20 ? 3 : visiblePoints.length > 10 ? 2 : 1;
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(visiblePoints.filter((_, idx) => idx % tickInterval === 0).map((d) => d.date))
      .tickSize(6);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) => group.select('.domain').attr('stroke', '#D1D5DB'))
      .call((group) =>
        group
          .selectAll('.tick line')
          .attr('stroke', '#D1D5DB')
      )
      .call((group) =>
        group
          .selectAll('.tick text')
          .attr('fill', '#6B7280')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('dy', '1em')
      );

    // Y Axis (Percentage 0 - 100%)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .call(yAxis)
      .call((group) => group.select('.domain').remove())
      .call((group) => group.selectAll('.tick line').remove())
      .call((group) =>
        group
          .selectAll('.tick text')
          .attr('fill', '#9CA3AF')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('dx', '-0.4em')
      );

    // Invisible Overlay for Interactive Mouse Tracking
    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mousemove', function (event) {
        const [pointerX] = d3.pointer(event);
        // Find closest date in scalePoint
        const domain = visiblePoints.map((d) => d.date);
        const eachBand = innerWidth / (domain.length - 1 || 1);
        const index = Math.min(domain.length - 1, Math.max(0, Math.round(pointerX / eachBand)));
        const point = visiblePoints[index];
        if (!point) return;

        const xPos = xScale(point.date) ?? 0;
        const yCrop = yScale(point.cropHealthScore);
        const yPest = yScale(point.pestSeverityIndex);

        setHoveredData({
          point,
          x: xPos + margin.left,
          yCrop: yCrop + margin.top,
          yPest: yPest + margin.top,
        });
      })
      .on('mouseleave', function () {
        setHoveredData(null);
      });
  }, [visiblePoints, metricFilter, containerWidth]);

  // Export CSV helper
  const handleExportCsv = () => {
    const headers = ['Day', 'Date', 'ISO_Date', 'Crop_Health_Score', 'Pest_Severity_Index', 'NDVI', 'Rainfall_mm', 'Temp_C', 'Event_Note'];
    const rows = visiblePoints.map((p) => [
      p.dayNumber,
      p.date,
      p.isoDate,
      p.cropHealthScore,
      p.pestSeverityIndex,
      p.ndvi,
      p.rainfallMm ?? 0,
      p.temperatureC ?? 0,
      `"${(p.eventNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crop_pest_telemetry_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="d3-crop-pest-trend-chart"
      className="relative rounded-2xl bg-white border border-gray-200/80 p-5 shadow-sm text-gray-900 transition-all hover:border-[#1B4332]/40"
    >
      {/* Chart Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F1F3F0] border border-gray-200 flex items-center justify-center text-[#1B4332]">
              <TrendingUp className="w-4 h-4 text-[#1B4332]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
                30-Day AgTech Vision Dynamics
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F3F0] border border-gray-200 font-mono text-[#1B4332] font-semibold">
                  D3.js Line Engine
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Temporal correlation: Crop Health Score vs. Pest Severity Index
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-xs font-mono">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === '30d' ? 'bg-white text-[#1B4332] font-bold shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === '14d' ? 'bg-white text-[#1B4332] font-bold shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeRange === '7d' ? 'bg-white text-[#1B4332] font-bold shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Metric Visibility Toggle */}
          <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-xs font-mono">
            <button
              onClick={() => setMetricFilter('both')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                metricFilter === 'both' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Both</span>
            </button>
            <button
              onClick={() => setMetricFilter('cropOnly')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                metricFilter === 'cropOnly' ? 'bg-white text-green-700 font-bold shadow-xs' : 'text-gray-600 hover:text-green-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Crop</span>
            </button>
            <button
              onClick={() => setMetricFilter('pestOnly')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                metricFilter === 'pestOnly' ? 'bg-white text-red-700 font-bold shadow-xs' : 'text-gray-600 hover:text-red-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Pest</span>
            </button>
          </div>

          {/* Export CSV Data Button */}
          <button
            onClick={handleExportCsv}
            title="Download CSV of 30-day telemetry series"
            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-[#1B4332] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Avg Crop Health</div>
              <div className="text-base font-bold text-green-700 font-mono">{stats.avgHealth}%</div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Avg Pest Index</div>
              <div className="text-base font-bold text-red-600 font-mono">{stats.avgPest}%</div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Bug className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Peak Outbreak</div>
              <div className="text-base font-bold text-amber-700 font-mono">
                {stats.maxPestPoint.pestSeverityIndex}% <span className="text-[11px] font-normal text-gray-500">({stats.maxPestPoint.date})</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Net Trajectory</div>
              <div className={`text-base font-bold font-mono ${stats.healthDelta >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {stats.healthDelta >= 0 ? `+${stats.healthDelta}%` : `${stats.healthDelta}%`}
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[340px] select-none"
          style={{ overflow: 'visible' }}
        />

        {/* Hover Crosshair guideline and Marker Dots */}
        {hoveredData && (
          <>
            {/* Vertical Guideline */}
            <div
              className="absolute top-[28px] bottom-[45px] w-px bg-gray-400 pointer-events-none"
              style={{
                left: `${hoveredData.x}px`,
                borderLeft: '1px dashed #6B7280',
              }}
            />

            {/* Crop Health Marker Dot */}
            {(metricFilter === 'both' || metricFilter === 'cropOnly') && (
              <div
                className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none transition-all duration-75"
                style={{
                  left: `${hoveredData.x}px`,
                  top: `${hoveredData.yCrop}px`,
                }}
              />
            )}

            {/* Pest Severity Marker Dot */}
            {(metricFilter === 'both' || metricFilter === 'pestOnly') && (
              <div
                className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-rose-500 border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none transition-all duration-75"
                style={{
                  left: `${hoveredData.x}px`,
                  top: `${hoveredData.yPest}px`,
                }}
              />
            )}

            {/* Floating Detailed Telemetry Card */}
            <div
              className="absolute z-30 pointer-events-none rounded-xl bg-gray-950/92 backdrop-blur-md border border-gray-700/80 p-3 text-white text-xs shadow-xl min-w-[210px] transition-transform duration-75"
              style={{
                left: `${Math.min(containerWidth - 230, Math.max(10, hoveredData.x + 14))}px`,
                top: `${Math.max(10, Math.min(200, hoveredData.yCrop - 40))}px`,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-800 mb-2">
                <span className="font-mono font-bold text-gray-200">
                  {hoveredData.point.date} ({hoveredData.point.isoDate})
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  Day {hoveredData.point.dayNumber}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                {(metricFilter === 'both' || metricFilter === 'cropOnly') && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Crop Health:
                    </span>
                    <strong className="text-white font-bold">
                      {hoveredData.point.cropHealthScore}%
                    </strong>
                  </div>
                )}

                {(metricFilter === 'both' || metricFilter === 'pestOnly') && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Pest Severity:
                    </span>
                    <strong className="text-white font-bold">
                      {hoveredData.point.pestSeverityIndex}%
                    </strong>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800/80">
                  <span>NDVI Vigor:</span>
                  <span className="text-gray-200 font-semibold">{hoveredData.point.ndvi}</span>
                </div>

                {hoveredData.point.temperatureC && (
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Temp / Rain:</span>
                    <span className="text-gray-200">
                      {hoveredData.point.temperatureC}°C | {hoveredData.point.rainfallMm ?? 0}mm
                    </span>
                  </div>
                )}

                {hoveredData.point.eventNote && (
                  <div className="mt-2 pt-1.5 border-t border-gray-800 text-[10px] text-amber-300 flex items-start gap-1 font-sans">
                    <Info className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                    <span>{hoveredData.point.eventNote}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chart Legend & Agronomic Insights Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 text-xs font-mono text-gray-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-emerald-500" />
            <span className="text-gray-800 font-semibold">Crop Health Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500" />
            <span className="text-gray-800 font-semibold">Pest Severity Index</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
            <span>Agronomic Event Pins</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          Showing {visiblePoints.length} Daily Optical & Sensor Inferences
        </div>
      </div>
    </div>
  );
};
