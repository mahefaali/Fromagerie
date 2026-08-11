export type MainTab = 'stock' | 'orders' | 'unsold' | 'loss';

export interface TabOption {
  id: MainTab;
  label: string;
}