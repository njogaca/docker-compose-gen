"use client";

import { useState, useMemo, useCallback } from "react";
import { SERVICE_CATALOG, CATEGORIES } from "@/lib/catalog";
import { generateYaml, newId } from "@/lib/generator";
import ServiceCard from "@/components/ServiceCard";
import ServiceConfigurator from "@/components/ServiceConfigurator";
import YamlPreview from "@/components/YamlPreview";
import ResizeDivider from "@/components/ResizeDivider";
import type { ServiceTemplate, ServiceInstance, ComposeProject } from "@/lib/types";

function buildInstance(template: ServiceTemplate): ServiceInstance {
  const envVars = template.fields
    .filter((f) => f.isEnvVar)
    .map((f) => ({ key: f.key, value: String(f.default) }));

  const rawVolumes = template.defaultVolumes ?? [];
  const volumes = rawVolumes.map((v) => {
    const [host, container, ...rest] = v.split(":");
    return { host, container: container + (rest.length ? ":" + rest.join(":") : "") };
  });

  return {
    instanceId: newId(),
    templateId: template.id,
    serviceName: template.id,
    image: template.image,
    imageTag: "latest",
    ports: [{ host: String(template.defaultPort), container: String(template.defaultPort) }],
    environment: envVars,
    volumes,
    restart: "unless-stopped",
    extraConfig: {},
  };
}

export default function Home() {
  const [projectName, setProjectName] = useState("my-project");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [instances, setInstances] = useState<ServiceInstance[]>([]);
  const [activePanel, setActivePanel] = useState<"catalog" | "config" | "output">("catalog");
  const [configWidth, setConfigWidth] = useState(320); // px — resizable

  const onResizeConfig = useCallback((delta: number) => {
    setConfigWidth((w) => Math.max(220, Math.min(600, w + delta)));
  }, []);

  const filtered = useMemo(() => {
    return SERVICE_CATALOG.filter((t) => {
      const matchesCat = category === "all" || t.category === category;
      const q = search.toLowerCase();
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [search, category]);

  // When showing all, group by category
  const grouped = useMemo(() => {
    if (category !== "all" || search) return null;
    const groups: Record<string, typeof filtered> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return groups;
  }, [filtered, category, search]);

  const addService = (template: ServiceTemplate) => {
    setInstances((prev) => [...prev, buildInstance(template)]);
    setActivePanel("config");
  };

  const project: ComposeProject = {
    name: projectName,
    version: "3.8",
    services: instances,
    networks: [],
    volumes: [],
  };

  const yaml = useMemo(() => {
    if (instances.length === 0) return "";
    return generateYaml(project);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, projectName]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-300 bg-dark-500/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            <h1 className="font-mono text-sm font-bold text-dark-50">
              Docker<span className="text-green-400">Compose</span>
              <span className="text-dark-100 font-normal">.gen</span>
            </h1>
          </div>
          <span className="text-[10px] font-mono text-dark-200 hidden sm:inline">
            Visual docker-compose.yml generator
          </span>
        </div>

        <div className="flex items-center gap-3">
          {instances.length > 0 && (
            <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {instances.length} service{instances.length !== 1 ? "s" : ""}
            </span>
          )}
          <a
            href="https://github.com/njogaca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-200 hover:text-dark-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </a>
        </div>
      </header>

      {/* Project name bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-dark-300 bg-dark-500/30 shrink-0">
        <span className="text-[10px] font-mono text-dark-200">Project name:</span>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-dark-400 border border-dark-300 rounded px-2 py-0.5 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50 w-48"
        />
      </div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden border-b border-dark-300 shrink-0">
        {(["catalog", "config", "output"] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`flex-1 py-2 text-xs font-mono text-center transition-colors capitalize ${
              activePanel === panel
                ? "text-green-400 border-b-2 border-green-400"
                : "text-dark-100"
            }`}
          >
            {panel === "config" ? `Services (${instances.length})` : panel}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Catalog */}
        <div className={`${activePanel === "catalog" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-72 xl:w-80 border-r border-dark-300 bg-dark-500/20 shrink-0`}>
          {/* Search + filter */}
          <div className="p-3 border-b border-dark-300 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-dark-400 border border-dark-300 rounded px-2 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dark-200 shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="bg-transparent text-xs font-mono text-dark-50 placeholder:text-dark-200 focus:outline-none flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    category === cat.id
                      ? "border-green-500/50 text-green-400 bg-green-500/10"
                      : "border-dark-300 text-dark-100 hover:border-dark-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service cards */}
          <div className="flex-1 overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <p className="text-xs font-mono text-dark-200 text-center py-8">No services found</p>
            ) : grouped ? (
              // Grouped by category (when "All" is selected)
              <div className="flex flex-col gap-4">
                {CATEGORIES.filter((c) => c.id !== "all" && grouped[c.id]?.length).map((cat) => (
                  <div key={cat.id}>
                    <p className="text-[10px] font-mono text-dark-200 uppercase tracking-widest mb-1.5 px-0.5">
                      {cat.label} <span className="text-dark-300">({grouped[cat.id].length})</span>
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grouped[cat.id].map((t) => (
                        <ServiceCard key={t.id} template={t} onAdd={addService} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single category or search results — 2-col grid
              <div className="grid grid-cols-2 gap-1.5">
                {filtered.map((t) => (
                  <ServiceCard key={t.id} template={t} onAdd={addService} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Configurator — resizable */}
        <div
          className={`${activePanel === "config" ? "flex" : "hidden"} lg:flex flex-col border-l-2 border-dark-400 bg-dark-500/30 shrink-0`}
          style={{ width: `${configWidth}px` }}
        >
          <div className="terminal-header shrink-0">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">services.config</span>
            <span className="ml-auto text-[10px] text-dark-200">{instances.length} added</span>
          </div>
          <ServiceConfigurator instances={instances} onChange={setInstances} />
        </div>

        {/* Drag handle between config and YAML (desktop only) */}
        <div className="hidden lg:flex">
          <ResizeDivider onResize={onResizeConfig} />
        </div>

        {/* Right: YAML output */}
        <div className={`${activePanel === "output" ? "flex" : "hidden"} lg:flex flex-col flex-1 bg-dark-500/10`}>
          <div className="terminal-header shrink-0">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">docker-compose.yml</span>
          </div>
          <YamlPreview yaml={yaml} />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-1.5 border-t border-dark-300 bg-dark-500/50 shrink-0">
        <span className="text-[10px] font-mono text-dark-200">
          Docker Compose Generator — by Johan Garcia
        </span>
        <span className="text-[10px] font-mono text-dark-200">
          {instances.length} services · {yaml.split("\n").length} lines
        </span>
      </footer>
    </div>
  );
}
