import { useState } from 'react';
import { templates, templateCategories, MiniSiteTemplate } from '@/data/templates';
import { motion } from 'framer-motion';
import { Check, Columns2, Columns3, LayoutList } from 'lucide-react';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (template: MiniSiteTemplate) => void;
}

const TemplateSelector = ({ selectedId, onSelect }: TemplateSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  const colIcon = (cols: number) => {
    if (cols === 1) return <LayoutList className="h-3 w-3" />;
    if (cols === 2) return <Columns2 className="h-3 w-3" />;
    return <Columns3 className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          🎯 All ({templates.length})
        </button>
        {templateCategories.map((cat) => {
          const count = templates.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((tmpl) => {
          const isSelected = tmpl.id === selectedId;
          return (
            <motion.button
              key={tmpl.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(tmpl)}
              className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'
              }`}
            >
              {/* Mini preview */}
              <div
                className="flex flex-col items-center gap-1.5 p-4"
                style={{ backgroundColor: tmpl.colors.bg }}
              >
                {/* Photo preview */}
                <div
                  className="h-8 w-8 flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: tmpl.colors.accent,
                    borderRadius: tmpl.style.photoShape === 'circle' ? '50%'
                      : tmpl.style.photoShape === 'rounded' ? '8px'
                      : tmpl.style.photoShape === 'hexagon' ? '30% 70% 70% 30% / 30% 30% 70% 70%'
                      : '2px',
                  }}
                >
                  <span className="text-xs" style={{ color: tmpl.colors.accentFg }}>A</span>
                </div>
                {/* Column layout lines */}
                <div className="flex w-full gap-1" style={{ color: tmpl.colors.textMuted }}>
                  {Array.from({ length: tmpl.columns }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full opacity-40"
                      style={{ backgroundColor: tmpl.colors.text }}
                    />
                  ))}
                </div>
                <div className="flex w-full gap-1">
                  {Array.from({ length: tmpl.columns }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full opacity-20"
                      style={{ backgroundColor: tmpl.colors.text }}
                    />
                  ))}
                </div>
                {/* Skill pills */}
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-1.5 w-4 rounded-full"
                      style={{ backgroundColor: tmpl.colors.skillBg }}
                    />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between bg-card px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{tmpl.preview}</span>
                  <span className="text-[10px] font-medium text-foreground truncate max-w-[80px]">
                    {tmpl.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {colIcon(tmpl.columns)}
                </div>
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
