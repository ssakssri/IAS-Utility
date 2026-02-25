// Thin wrapper hook around the Zustand userSelectionStore.
// Provides a consistent hook interface matching the design spec,
// while the actual state lives in store/userSelectionStore.ts.
export { useUserSelectionStore as useUserSelection } from '../store/userSelectionStore';
