import { createClient } from '@supabase/supabase-js';
import { Registry, PackageMetadata } from '../types/registry';
require('dotenv').config();

export class RegistryManager {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async loadRegistry(): Promise<void> {
    // No longer needed as we're using Supabase
    return;
  }

  async getPackage(name: string): Promise<PackageMetadata | null> {
    const { data: pkg, error } = await this.supabase
      .from('packages')
      .select(`
        *,
        package_inputs (id, meta),
        package_aliases (alias),
        package_dependencies (dependency_name)
      `)
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching package:', error);
      return null;
    }

    if (!pkg) return null;

    // Transform the database result into PackageMetadata format
    const inputs = pkg.package_inputs?.map(input => input.meta) || [];
    
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      repository: pkg.repository,
      maintainer: pkg.maintainer,
      inputs: inputs,
      buildConfig: pkg.build_config,
      aliases: pkg.package_aliases?.map(a => a.alias) || [],
      dependencies: pkg.package_dependencies?.map(d => d.dependency_name) || []
    };
  }

  async listPackages(): Promise<PackageMetadata[]> {
    const { data: packages, error } = await this.supabase
      .from('packages')
      .select(`
        *,
        package_inputs (id, meta),
        package_aliases (alias),
        package_dependencies (dependency_name)
      `);

    if (error) {
      console.error('Error fetching packages:', error);
      return [];
    }

    return packages.map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      repository: pkg.repository,
      maintainer: pkg.maintainer,
      inputs: pkg.package_inputs?.map(input => input.meta) || [],
      buildConfig: pkg.build_config,
      aliases: pkg.package_aliases?.map(a => a.alias) || [],
      dependencies: pkg.package_dependencies?.map(d => d.dependency_name) || []
    }));
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

    // Apply input configurations
    if (pkg.buildConfig.configOptions) {
      for (const [key, flag] of Object.entries(pkg.buildConfig.configOptions)) {
        if (inputs[key]) {
          config.args.push(flag as string);
        }
      }
    }

    // Handle environment variables from inputs
    pkg.inputs.forEach(input => {
      if (inputs[input.name]) {
        config.env[input.name] = inputs[input.name];
      }
    });

    return config;
  }
}