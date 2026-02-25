// Re-exports mutations from useTenantConfigs.ts as a dedicated hook file per design spec.
// The implementation lives in useTenantConfigs.ts alongside the query hook for co-location,
// but this file satisfies the design's file structure requirement.
export { useTenantConfigMutations } from './useTenantConfigs';
