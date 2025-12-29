import SkillTree from '../components/skilltree/SkillTree';
import { useApp } from '../contexts/AppContext';

export default function SkillTreePage() {
  const { state } = useApp();
  const unlockedCount = state.skillTree?.nodes.filter(n => n.unlocked).length || 0;
  const totalCount = state.skillTree?.nodes.length || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Tree</h1>
        <p className="text-slate-400">
          {unlockedCount} of {totalCount} skills unlocked
        </p>
      </div>

      {/* Skill Tree Visualization */}
      <SkillTree />
    </div>
  );
}
