"use client";

import { useState } from "react";
import type { ServiceInstance } from "@/lib/types";
import { SERVICE_CATALOG } from "@/lib/catalog";

interface Props {
  instances: ServiceInstance[];
  onChange: (instances: ServiceInstance[]) => void;
}

export default function ServiceConfigurator({ instances, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<ServiceInstance>) => {
    onChange(instances.map((s) => (s.instanceId === id ? { ...s, ...patch } : s)));
  };

  const remove = (id: string) => {
    onChange(instances.filter((s) => s.instanceId !== id));
    if (openId === id) setOpenId(null);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...instances];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === instances.length - 1) return;
    const arr = [...instances];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onChange(arr);
  };

  if (instances.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="font-mono text-dark-200 text-sm mb-1">// no services added yet</p>
          <p className="text-xs text-dark-200">Pick services from the catalog on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
      {instances.map((svc, idx) => {
        const template = SERVICE_CATALOG.find((t) => t.id === svc.templateId);
        const isOpen = openId === svc.instanceId;

        return (
          <div key={svc.instanceId} className="terminal-window">
            {/* Row header */}
            <div
              className="terminal-body py-2 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setOpenId(isOpen ? null : svc.instanceId)}
            >
              <span className="text-base leading-none">{template?.icon ?? "📦"}</span>
              <span className="text-green-400 font-mono text-xs font-semibold flex-1 truncate">
                {svc.serviceName}
              </span>
              <span className="text-[10px] font-mono text-dark-200 shrink-0">
                {svc.image}:{svc.imageTag}
              </span>
              <div className="flex items-center gap-1 ml-1">
                <button onClick={(e) => { e.stopPropagation(); moveUp(idx); }} className="text-dark-200 hover:text-dark-50 p-0.5" title="Move up">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); moveDown(idx); }} className="text-dark-200 hover:text-dark-50 p-0.5" title="Move down">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); remove(svc.instanceId); }} className="text-dark-200 hover:text-red-400 p-0.5 ml-1" title="Remove">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* Expanded config */}
            {isOpen && (
              <div className="border-t border-dark-300 p-3 flex flex-col gap-3">
                {/* Service name + image tag */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-dark-200">Service name</span>
                    <input
                      type="text"
                      value={svc.serviceName}
                      onChange={(e) => update(svc.instanceId, { serviceName: e.target.value })}
                      className="bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-dark-200">Image tag</span>
                    <input
                      type="text"
                      value={svc.imageTag}
                      onChange={(e) => update(svc.instanceId, { imageTag: e.target.value })}
                      className="bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                    />
                  </label>
                </div>

                {/* Restart policy */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-dark-200">Restart policy</span>
                  <select
                    value={svc.restart}
                    onChange={(e) => update(svc.instanceId, { restart: e.target.value as ServiceInstance["restart"] })}
                    className="bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                  >
                    <option value="no">no</option>
                    <option value="always">always</option>
                    <option value="on-failure">on-failure</option>
                    <option value="unless-stopped">unless-stopped</option>
                  </select>
                </label>

                {/* Ports */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-dark-200">Ports</span>
                    <button
                      onClick={() => update(svc.instanceId, {
                        ports: [...svc.ports, { host: "", container: "" }],
                      })}
                      className="text-[10px] font-mono text-green-400 hover:underline"
                    >
                      + Add port
                    </button>
                  </div>
                  {svc.ports.map((p, pi) => (
                    <div key={pi} className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={p.host}
                        placeholder="host"
                        onChange={(e) => {
                          const ports = [...svc.ports];
                          ports[pi] = { ...ports[pi], host: e.target.value };
                          update(svc.instanceId, { ports });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <span className="text-dark-200 font-mono text-xs">:</span>
                      <input
                        type="text"
                        value={p.container}
                        placeholder="container"
                        onChange={(e) => {
                          const ports = [...svc.ports];
                          ports[pi] = { ...ports[pi], container: e.target.value };
                          update(svc.instanceId, { ports });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <button
                        onClick={() => update(svc.instanceId, { ports: svc.ports.filter((_, i) => i !== pi) })}
                        className="text-dark-200 hover:text-red-400"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Environment variables */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-dark-200">Environment variables</span>
                    <button
                      onClick={() => update(svc.instanceId, {
                        environment: [...svc.environment, { key: "", value: "" }],
                      })}
                      className="text-[10px] font-mono text-green-400 hover:underline"
                    >
                      + Add env var
                    </button>
                  </div>
                  {svc.environment.map((env, ei) => (
                    <div key={ei} className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={env.key}
                        placeholder="KEY"
                        onChange={(e) => {
                          const environment = [...svc.environment];
                          environment[ei] = { ...environment[ei], key: e.target.value };
                          update(svc.instanceId, { environment });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <span className="text-dark-200 font-mono text-xs">=</span>
                      <input
                        type="text"
                        value={env.value}
                        placeholder="value"
                        onChange={(e) => {
                          const environment = [...svc.environment];
                          environment[ei] = { ...environment[ei], value: e.target.value };
                          update(svc.instanceId, { environment });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <button
                        onClick={() => update(svc.instanceId, { environment: svc.environment.filter((_, i) => i !== ei) })}
                        className="text-dark-200 hover:text-red-400"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Volumes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-dark-200">Volumes</span>
                    <button
                      onClick={() => update(svc.instanceId, {
                        volumes: [...svc.volumes, { host: "", container: "" }],
                      })}
                      className="text-[10px] font-mono text-green-400 hover:underline"
                    >
                      + Add volume
                    </button>
                  </div>
                  {svc.volumes.map((v, vi) => (
                    <div key={vi} className="flex items-center gap-1 mb-1">
                      <input
                        type="text"
                        value={v.host}
                        placeholder="name or ./path"
                        onChange={(e) => {
                          const volumes = [...svc.volumes];
                          volumes[vi] = { ...volumes[vi], host: e.target.value };
                          update(svc.instanceId, { volumes });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <span className="text-dark-200 font-mono text-xs">:</span>
                      <input
                        type="text"
                        value={v.container}
                        placeholder="/container/path"
                        onChange={(e) => {
                          const volumes = [...svc.volumes];
                          volumes[vi] = { ...volumes[vi], container: e.target.value };
                          update(svc.instanceId, { volumes });
                        }}
                        className="flex-1 bg-dark-400 border border-dark-300 rounded px-2 py-1 text-xs font-mono text-dark-50 focus:outline-none focus:border-green-500/50"
                      />
                      <button
                        onClick={() => update(svc.instanceId, { volumes: svc.volumes.filter((_, i) => i !== vi) })}
                        className="text-dark-200 hover:text-red-400"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
