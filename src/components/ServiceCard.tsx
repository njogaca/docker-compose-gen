"use client";

import type { ServiceTemplate } from "@/lib/types";

interface Props {
  template: ServiceTemplate;
  onAdd: (template: ServiceTemplate) => void;
}

const categoryColors: Record<string, string> = {
  database:  "text-blue-400 border-blue-400/30 bg-blue-400/5",
  cache:     "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  messaging: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  webserver: "text-green-400 border-green-400/30 bg-green-400/5",
  monitoring:"text-orange-400 border-orange-400/30 bg-orange-400/5",
  devtools:  "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
};

export default function ServiceCard({ template, onAdd }: Props) {
  const catColor = categoryColors[template.category] ?? "text-dark-100 border-dark-300 bg-dark-400";

  return (
    <div className="terminal-window group hover:border-green-500/40 transition-all flex flex-col">
      <div className="terminal-body flex flex-col gap-2 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{template.icon}</span>
            <span className="font-semibold text-dark-50 text-sm">{template.name}</span>
          </div>
          <span className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${catColor}`}>
            {template.category}
          </span>
        </div>

        <p className="text-xs text-dark-100 leading-relaxed flex-1">
          {template.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-dark-300">
          <span className="text-[10px] font-mono text-dark-200">
            :{template.defaultPort}
          </span>
          <button
            onClick={() => onAdd(template)}
            className="flex items-center gap-1 text-[11px] font-mono text-green-400 hover:text-green-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
