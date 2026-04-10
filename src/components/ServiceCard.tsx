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
  ibm:       "text-blue-300 border-blue-300/30 bg-blue-300/5",
  security:  "text-red-400 border-red-400/30 bg-red-400/5",
  testing:   "text-pink-400 border-pink-400/30 bg-pink-400/5",
  python:    "text-yellow-300 border-yellow-300/30 bg-yellow-300/5",
};

export default function ServiceCard({ template, onAdd }: Props) {
  const catColor = categoryColors[template.category] ?? "text-dark-100 border-dark-300 bg-dark-400";

  return (
    <div
      className="group relative flex items-center gap-2 px-2.5 py-2 rounded border border-dark-300 bg-dark-500 hover:border-green-500/40 hover:bg-dark-400 transition-all cursor-default"
      title={template.description}
    >
      {/* Icon */}
      <span className="text-base leading-none shrink-0">{template.icon}</span>

      {/* Name + port */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-dark-50 truncate leading-tight">
          {template.name}
        </p>
        <p className="text-[10px] font-mono text-dark-200 leading-tight">
          :{template.defaultPort}
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(template)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-dark-300 text-dark-200 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/10 transition-all"
        title={`Add ${template.name}`}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute left-full top-0 ml-2 z-50 w-52 p-2.5 rounded border border-dark-300 bg-dark-400 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
        <p className="text-[10px] font-mono mb-1">
          <span className={`px-1 py-0.5 rounded border text-[9px] ${catColor}`}>
            {template.category}
          </span>
        </p>
        <p className="text-[11px] text-dark-50 leading-relaxed">
          {template.description}
        </p>
      </div>
    </div>
  );
}
