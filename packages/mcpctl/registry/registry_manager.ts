import { PackageMetadata } from "../types/registry";
interface RegistryOptions {
  baseUrl: string;
}

export class RegistryManager {
  baseUrl: string;

  constructor(options: RegistryOptions) {
    this.baseUrl = options.baseUrl;
  }

  async listPackages(
    searchTerm?: string,
    hard_search?: boolean
  ): Promise<PackageMetadata[]> {
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append("package_name", searchTerm);
      if (hard_search !== undefined)
        params.append("hard_search", String(hard_search));

      const url = `${this.baseUrl}/search?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const packages = data.packages;

      if (!packages) return [];

      return packages.map((pkg: any) => ({
        name: pkg.name,
        version: pkg.latest_version,
        description: pkg.description,
        repository: pkg.repository,
        maintainer: pkg.maintainer,
        inputs: pkg.manifest.inputs || [],
        buildConfig: pkg.manifest.buildConfig,
        dependencies: pkg.manifest.dependencies || [],
      }));
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  }

  async buildConfig(
    name: string,
    inputs: Record<string, any>
  ): Promise<{
    command: string;
    args: string[];
    env: Record<string, string>;
  }> {
    let all_packages = await this.listPackages(name, true);
    const pkg = all_packages[0];
    console.log("Install testing", pkg);
    if (!pkg || !pkg.buildConfig) {
      throw new Error(`No build configuration found for package ${name}`);
    }

    const config = {
      command: pkg.buildConfig.command,
      args: [...pkg.buildConfig.args],
      env: {} as Record<string, string>,
    };

    if (pkg.buildConfig.configOptions) {
      for (const [key, flag] of Object.entries(pkg.buildConfig.configOptions)) {
        if (inputs[key]) {
          config.args.push(flag as string);
        }
      }
    }

    pkg.inputs.forEach((input) => {
      if (inputs[input.name]) {
        config.env[input.name] = inputs[input.name];
      }
    });

    return config;
  }
}
