import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TestSuite, MindMapNode, TestCaseScenario } from '../types';

interface MindMapProps {
  data: TestSuite;
  onSelectScenario: (scenario: TestCaseScenario) => void;
}

export const MindMap: React.FC<MindMapProps> = ({ data, onSelectScenario }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Transform flat data to hierarchical data
    const rootData: MindMapNode = {
      name: data.featureName || "功能",
      type: 'root',
      children: data.scenarios.map(s => ({
        name: s.scenarioName,
        type: 'scenario',
        data: s
      }))
    };

    const root = d3.hierarchy(rootData);
    
    // Create a tree layout
    const treeLayout = d3.tree<MindMapNode>().size([innerHeight, innerWidth]);
    treeLayout(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any
      )
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2);

    // Nodes
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", (d) => `node cursor-pointer transition-all duration-300 ${d.depth === 0 ? 'root-node' : 'leaf-node'}`)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
         if (d.data.type === 'scenario' && d.data.data) {
           onSelectScenario(d.data.data);
         }
      });

    // Node Circles
    nodes.append("circle")
      .attr("r", (d) => d.depth === 0 ? 8 : 6)
      .attr("fill", (d) => d.depth === 0 ? "#3b82f6" : "#ffffff")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    // Node Labels
    nodes.append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => d.children ? -15 : 15)
      .style("text-anchor", (d) => d.children ? "end" : "start")
      .text((d) => {
        const text = d.data.name;
        return text.length > 25 ? text.substring(0, 25) + '...' : text;
      })
      .attr("class", "text-sm font-medium fill-slate-700 select-none")
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  }, [data, dimensions, onSelectScenario]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative shadow-inner">
      <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-500 pointer-events-none border border-slate-200">
        滚轮缩放，拖拽平移。点击节点查看详情。
      </div>
      <svg ref={svgRef} width="100%" height="100%" className="touch-none"></svg>
    </div>
  );
};