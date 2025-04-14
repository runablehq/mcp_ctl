import { PackageMetadata } from '../types/registry';
require('dotenv').config();

export class RegistryManager {
  
  

  async getPackage(name: string): Promise<PackageMetadata | null> {
    try {
      
      const response = await fetch(`${process.env.BACKEND_URL || ''}/get-package?package_name=${name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const packages = data.packages;

      if (!packages || packages.length === 0) return null;
      const pkg = packages[0];

      return {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        repository: pkg.repository,
        maintainer: pkg.maintainer,
        inputs: pkg.inputs?.map(input => input.meta) || [],
        buildConfig: pkg.build_config,
        dependencies: pkg.dependencies?.map(d => d.dependency_name) || []
      };
    } catch (error) {
      console.error('Error fetching package:', error);
      return null;
    }
  }

  async listPackages(searchTerm?: string): Promise<PackageMetadata[]> {
    try {
      const response = await fetch(`${process.env.BACKEND_URL || ''}/get-package${searchTerm ? `?package_name=${searchTerm}` : ''}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const packages = data.packages;

      if (!packages) return [];

      return packages.map(pkg => ({
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        repository: pkg.repository,
        maintainer: pkg.maintainer,
        inputs: pkg.inputs?.map(input => input.meta) || [],
        buildConfig: pkg.build_config,
        dependencies: pkg.dependencies?.map(d => d.dependency_name) || []
      }));
    } catch (error) {
      console.error('Error fetching packages:', error);
      return [];
    }
  }

  async buildConfig(name: string, inputs: Record<string, any>): Promise<{
    command: string;
    args: string[];
    env: Record<string, string>;
  }> {
    const pkg = await this.getPackage(name);
    if (!pkg || !pkg.buildConfig) {
      throw new Error(`No build configuration found for package ${name}`);
    }

    const config = {
      command: pkg.buildConfig.command,
      args: [...pkg.buildConfig.args],
      env: {} as Record<string, string>
    };


    if (pkg.buildConfig.configOptions) {
      for (const [key, flag] of Object.entries(pkg.buildConfig.configOptions)) {
        if (inputs[key]) {
          config.args.push(flag as string);
        }
      }
    }


    pkg.inputs.forEach(input => {
      if (inputs[input.name]) {
        config.env[input.name] = inputs[input.name];
      }
    });

    return config;
  }
}