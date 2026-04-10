"use client";

import { useState } from "react";
import { highlightYaml } from "@/lib/generator";

interface Props {
  yaml: string;
}

export default function YamlPreview({ yaml }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!yaml) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="font-mono text-dark-200 text-sm mb-1">// output will appear here</p>
          <p className="text-xs text-dark-200">Add services to generate your compose file</p>
        </div>
      </div>
    );
  }

  const lineCount = yaml.split("\n").length;
  const highlighted = highlightYaml(yaml);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-300 bg-dark-400/50">
        <span className="text-[10px] font-mono text-dark-200">
          docker-compose.yml · {lineCount} lines
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-[11px] font-mono text-dark-100 hover:text-green-400 transition-colors"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 text-[11px] font-mono text-dark-100 hover:text-green-400 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="select-none px-3 py-4 text-right font-mono text-[11px] leading-5 text-dark-200 border-r border-dark-300 bg-dark-500/50 min-w-[42px]">
            {yaml.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Code content */}
          <pre
            className="flex-1 p-4 font-mono text-[11px] leading-5 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      </div>
    </div>
  );
}
