import { BookOpen, ExternalLink } from 'lucide-react';
import { EXERCISES, SKILL_LABELS, SKILL_COLORS } from '../exercises';

const CORE_PRINCIPLES = [
  {
    title: 'Neuroplasticity',
    description: 'The brain physically restructures itself in response to experience. Every time you learn something new or practice a skill, neurons form new connections (synaptogenesis) and strengthen existing ones (long-term potentiation). This process continues throughout life, not just in childhood.',
    ref: 'Draganski, B., et al. (2004). Neuroplasticity: Changes in grey matter induced by training. Nature, 427, 311-312.',
  },
  {
    title: 'Spaced Repetition',
    description: 'Distributing practice over time produces stronger, more durable memories than massed practice ("cramming"). The spacing effect works because each retrieval event strengthens the memory trace and slows forgetting. This app schedules exercise variety to leverage spacing.',
    ref: 'Cepeda, N.J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354.',
  },
  {
    title: 'Desirable Difficulty',
    description: 'Training is most effective when the challenge is just beyond your current ability. The adaptive difficulty system targets this "sweet spot" using an ELO-like algorithm. Too easy means no growth; too hard means frustration and disengagement.',
    ref: 'Bjork, R.A. (1994). Memory and metamemory considerations in the training of human beings. In J. Metcalfe & A. Shimamura (Eds.), Metacognition. MIT Press.',
  },
  {
    title: 'Interleaving',
    description: 'Mixing different types of problems or exercises within a single practice session produces better learning than focusing on one type at a time (blocking). Sessions in this app interleave different cognitive domains for maximum neural engagement.',
    ref: 'Rohrer, D. & Taylor, K. (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35, 481-498.',
  },
  {
    title: 'Transfer Effects',
    description: 'The key question in cognitive training is whether improvements transfer to untrained tasks. While "far transfer" (general intelligence gains) remains debated, near transfer to related cognitive tasks is well-supported, and this app targets multiple cognitive domains.',
    ref: 'Simons, D.J., et al. (2016). Do "Brain-Training" programs work? Psychological Science in the Public Interest, 17(3), 103-186.',
  },
  {
    title: 'Myelination & Processing Speed',
    description: 'Myelin is the insulating sheath around neural axons that determines signal speed. Repeated practice of a circuit promotes myelination, making that circuit faster and more efficient. This is why processing speed exercises get measurably faster with training.',
    ref: 'Fields, R.D. (2008). White matter in learning, cognition and psychiatric disorders. Trends in Neurosciences, 31(7), 361-370.',
  },
];

export default function SciencePage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        The Science Behind NeuroForge
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Every exercise and algorithm in this app is grounded in peer-reviewed neuroscience and
        cognitive psychology research. Here is the evidence base.
      </p>

      {/* Core Principles */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="var(--accent-primary)" />
        Core Principles
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {CORE_PRINCIPLES.map((p, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
              {p.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {p.description}
            </p>
            <div style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}>
              {p.ref}
            </div>
          </div>
        ))}
      </div>

      {/* Exercise-Specific Science */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen size={20} color="var(--accent-secondary)" />
        Exercise Science
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {EXERCISES.map(ex => {
          const color = SKILL_COLORS[ex.skill];
          return (
            <div key={ex.id} style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{ex.name}</h3>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  background: color + '20',
                  color,
                  fontWeight: 600,
                }}>
                  {SKILL_LABELS[ex.skill]}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {ex.scienceNote}
              </p>
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}>
                {ex.scienceRef}
              </div>
            </div>
          );
        })}
      </div>

      {/* Further Reading */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Further Reading</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { text: 'The Brain That Changes Itself - Norman Doidge (2007)', url: 'https://en.wikipedia.org/wiki/The_Brain_That_Changes_Itself' },
            { text: 'Thinking, Fast and Slow - Daniel Kahneman (2011)', url: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow' },
            { text: 'Nature Reviews Neuroscience - Neuroplasticity reviews', url: 'https://www.nature.com/nrn/' },
            { text: 'ACTIVE Study - Largest cognitive training RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/12425707/' },
          ].map((link, i) => (
            <li key={i}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--accent-primary)',
                  fontSize: '0.9rem',
                  padding: '0.5rem 0',
                }}
              >
                <ExternalLink size={14} />
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(248,113,113,0.08)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        border: '1px solid rgba(248,113,113,0.2)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--accent-danger)' }}>Important Disclaimer:</strong> This app is an educational tool, not a medical device.
        While the exercises are grounded in peer-reviewed research, cognitive training apps have not been proven to prevent
        or treat neurological conditions. The "brain training" industry has been subject to legitimate scientific criticism
        (see Simons et al., 2016). This app aims to provide genuine cognitive exercise with transparent scientific sourcing.
        Consult healthcare professionals for medical concerns.
      </div>
    </div>
  );
}
