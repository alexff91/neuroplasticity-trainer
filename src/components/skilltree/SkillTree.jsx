import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Lock, Check, Star } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function SkillTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { state } = useApp();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: Math.max(600, containerRef.current.offsetHeight),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // D3 visualization
  useEffect(() => {
    if (!state.skillTree || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const { nodes, edges } = state.skillTree;

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2 - 400}, 20)`);

    // Define gradients
    const defs = svg.append('defs');

    // Gradient for unlocked skills
    const unlockedGradient = defs.append('linearGradient')
      .attr('id', 'unlocked-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    unlockedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#6366f1');
    unlockedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6');

    // Gradient for locked skills
    const lockedGradient = defs.append('linearGradient')
      .attr('id', 'locked-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    lockedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#374151');
    lockedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#1f2937');

    // Gradient for completed skills
    const completedGradient = defs.append('linearGradient')
      .attr('id', 'completed-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    completedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    completedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const isActive = source.unlocked && target.unlocked;
      const isPartial = source.unlocked && !target.unlocked;

      g.append('line')
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke', isActive ? '#6366f1' : isPartial ? '#4b5563' : '#1f2937')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', isPartial ? '5,5' : 'none')
        .style('opacity', isActive ? 0.8 : 0.4);
    });

    // Draw nodes
    const nodeGroups = g.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'skill-node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedSkill(d);
      });

    // Node circles
    nodeGroups.append('circle')
      .attr('r', d => d.level === 0 ? 45 : 35)
      .attr('fill', d => {
        if (d.xp >= d.maxXp) return 'url(#completed-gradient)';
        if (d.unlocked) return 'url(#unlocked-gradient)';
        return 'url(#locked-gradient)';
      })
      .attr('stroke', d => {
        if (d.xp >= d.maxXp) return '#10b981';
        if (d.unlocked) return '#6366f1';
        return '#374151';
      })
      .attr('stroke-width', 3)
      .attr('filter', d => d.unlocked ? 'url(#glow)' : 'none');

    // Progress ring for unlocked skills
    nodeGroups.each(function(d) {
      if (d.unlocked && d.xp < d.maxXp) {
        const progress = d.xp / d.maxXp;
        const radius = d.level === 0 ? 45 : 35;
        const circumference = 2 * Math.PI * radius;

        d3.select(this).append('circle')
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 4)
          .attr('stroke-dasharray', `${circumference * progress} ${circumference}`)
          .attr('stroke-linecap', 'round')
          .attr('transform', 'rotate(-90)');
      }
    });

    // Node icons (emoji)
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.level === 0 ? '24px' : '20px')
      .text(d => d.icon);

    // Node labels
    nodeGroups.append('text')
      .attr('y', d => (d.level === 0 ? 45 : 35) + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.unlocked ? '#e5e7eb' : '#6b7280')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text(d => d.name);

    // Lock icon for locked skills
    nodeGroups.filter(d => !d.unlocked)
      .append('text')
      .attr('x', 20)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('🔒');

    // Check mark for completed skills
    nodeGroups.filter(d => d.xp >= d.maxXp)
      .append('text')
      .attr('x', 20)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .text('✓');

  }, [state.skillTree, dimensions]);

  if (!state.skillTree) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Loading skill tree...</p>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* SVG Container */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="bg-slate-900/50"
        />
      </div>

      {/* Skill Detail Panel */}
      {selectedSkill && (
        <div className="absolute top-4 right-4 w-72 glass-card rounded-xl p-4 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedSkill.unlocked
                  ? 'bg-indigo-500/20'
                  : 'bg-slate-700/50'
              }`}>
                {selectedSkill.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSkill.name}</h3>
                <p className="text-sm text-slate-400">Level {selectedSkill.level}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center gap-2">
              {selectedSkill.xp >= selectedSkill.maxXp ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Completed</span>
                </>
              ) : selectedSkill.unlocked ? (
                <>
                  <Star className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-400 text-sm font-medium">In Progress</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500 text-sm font-medium">Locked</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{selectedSkill.xp} / {selectedSkill.maxXp} XP</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(selectedSkill.xp / selectedSkill.maxXp) * 100}%` }}
                />
              </div>
            </div>

            {/* Category */}
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs">
                {selectedSkill.category}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card rounded-xl p-3">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <span className="text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            <span className="text-slate-300">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-600 to-slate-700" />
            <span className="text-slate-300">Locked</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 glass-card rounded-xl p-2 flex items-center gap-2">
        <span className="text-xs text-slate-400 px-2">Scroll to zoom, drag to pan</span>
      </div>
    </div>
  );
}
