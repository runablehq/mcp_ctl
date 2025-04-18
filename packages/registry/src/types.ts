export interface Package {
  id: string;
  name: string;
  version: string;
  description?: string;
  repository?: string;
  maintainer?: string;
  build_config?: any;
  inputs?: PackageInput[];
  dependencies?: PackageDependency[];
}

export interface PackageInput {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  default_value?: any;
}

export interface PackageDependency {
  dependency_name: string;
}