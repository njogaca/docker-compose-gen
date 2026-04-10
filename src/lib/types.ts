export type FieldType = "string" | "number" | "boolean" | "select";

export interface ServiceField {
  key: string;
  label: string;
  type: FieldType;
  default: string | number | boolean;
  options?: string[];
  placeholder?: string;
  isEnvVar?: boolean; // renders as environment variable
  envKey?: string;    // the actual env var name
}

export interface ServiceTemplate {
  id: string;
  name: string;
  image: string;
  category: "database" | "cache" | "messaging" | "webserver" | "monitoring" | "devtools" | "python" | "ibm" | "security" | "testing";
  description: string;
  defaultPort: number;
  fields: ServiceField[];
  defaultVolumes?: string[];
  icon: string; // emoji or short label
}

export interface ServiceInstance {
  instanceId: string;
  templateId: string;
  serviceName: string;
  image: string;
  imageTag: string;
  ports: { host: string; container: string }[];
  environment: { key: string; value: string }[];
  volumes: { host: string; container: string }[];
  restart: "no" | "always" | "on-failure" | "unless-stopped";
  extraConfig: Record<string, string | number | boolean>;
}

export interface ComposeProject {
  name: string;
  version: string;
  services: ServiceInstance[];
  networks: string[];
  volumes: string[];
}
