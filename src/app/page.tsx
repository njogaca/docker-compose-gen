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
  const [showHelp, setShowHelp] = useState(false);

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

        <div className="flex items-center gap-2">
          {instances.length > 0 && (
            <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {instances.length} service{instances.length !== 1 ? "s" : ""}
            </span>
          )}
          <a
            href="https://github.com/njogaca/docker-compose-gen"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="text-dark-200 hover:text-dark-50 transition-colors p-1"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <button
            onClick={() => setShowHelp(true)}
            className="text-[11px] font-mono text-green-400 hover:text-green-300 border border-green-500/30 rounded px-2 py-1 hover:border-green-400/50 transition-all"
          >
            How to use this tool?
          </button>
          <a
            href="https://johangarcia.dev"
            target="_blank"
            rel="noopener noreferrer"
            title="Portfolio — Johan Garcia"
            className="ml-1 flex items-center justify-center w-7 h-7 rounded font-mono text-[11px] font-bold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition-all shrink-0"
          >
            JG
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

      {/* Help modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-dark-500 border border-dark-300 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-300 sticky top-0 bg-dark-500">
              <h2 className="font-mono text-sm font-semibold text-dark-50">How to use · Docker Compose Generator</h2>
              <button onClick={() => setShowHelp(false)} className="text-dark-200 hover:text-dark-50 text-lg leading-none">✕</button>
            </div>
            <div className="p-5 space-y-5 text-[12px] font-mono leading-relaxed">

              <section>
                <h3 className="text-green-400 font-semibold mb-1.5">1 · Browse the catalog</h3>
                <p className="text-dark-100">The left panel lists all available services grouped by category. Use the search box to find a service by name, or filter by category using the tag buttons.</p>
                <ul className="mt-2 space-y-1 text-dark-200 list-disc list-inside">
                  <li>Databases, cache, messaging, monitoring, web servers</li>
                  <li>IBM (MQ, ACE, DataPower, Db2)</li>
                  <li>Security, testing & QA, Python tools</li>
                </ul>
              </section>

              <section>
                <h3 className="text-green-400 font-semibold mb-1.5">2 · Add services</h3>
                <p className="text-dark-100">Click <span className="text-dark-50 bg-dark-400 px-1 rounded">+ Add</span> on any service card. It will appear in the center <span className="text-dark-50">services.config</span> panel. You can add as many services as you need.</p>
              </section>

              <section>
                <h3 className="text-green-400 font-semibold mb-1.5">3 · Configure each service</h3>
                <p className="text-dark-100">In the center panel, expand a service to configure it:</p>
                <ul className="mt-2 space-y-1 text-dark-200 list-disc list-inside">
                  <li>Service name and image tag</li>
                  <li>Port mappings (host:container)</li>
                  <li>Environment variables</li>
                  <li>Volume mounts</li>
                  <li>Restart policy</li>
                </ul>
                <p className="mt-2 text-dark-200">Drag the divider between the config and YAML panels to resize them.</p>
              </section>

              <section>
                <h3 className="text-green-400 font-semibold mb-1.5">4 · Export your compose file</h3>
                <p className="text-dark-100">The right panel shows the generated <span className="text-dark-50">docker-compose.yml</span> in real time. Use the <span className="text-dark-50">Copy</span> or <span className="text-dark-50">Download</span> buttons to export it.</p>
              </section>

              <section>
                <h3 className="text-green-400 font-semibold mb-1.5">Project name</h3>
                <p className="text-dark-100">Set the project name in the bar below the header — it becomes the top-level <span className="text-yellow-300">name:</span> field in the compose file.</p>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
