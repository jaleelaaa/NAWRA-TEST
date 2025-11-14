/**
 * Preservation Records Types
 * Type definitions for artifact preservation and conservation tracking
 */

export enum ConditionStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

export enum RestorationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DamageType {
  WATER = 'water',
  MOLD = 'mold',
  PEST = 'pest',
  PHYSICAL = 'physical',
  CHEMICAL = 'chemical',
  FIRE = 'fire',
  UV = 'uv',
  WEAR = 'wear',
}

export enum LightExposure {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export enum InspectionFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum DamageSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}

export interface ConservationHistoryEntry {
  date: string;
  action: string;
  conservator: string;
  cost?: number;
  notes?: string;
}

export interface PreservationRecord {
  id: string;
  book_id: string;
  condition_status: ConditionStatus;
  condition_notes: string | null;
  conservation_history: ConservationHistoryEntry[];
  last_conservation_date: string | null;
  conservator_name: string | null;
  restoration_needed: boolean;
  restoration_priority: RestorationPriority | null;
  restoration_notes: string | null;
  estimated_cost: number | null;
  last_inspection_date: string;
  next_inspection_date: string | null;
  inspection_frequency: InspectionFrequency | null;
  storage_temperature: number | null;
  storage_humidity: number | null;
  light_exposure: LightExposure | null;
  damage_types: DamageType[];
  damage_severity: DamageSeverity | null;
  damage_photos: string[];
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
  book_title?: string;
  book_title_ar?: string;
}

export interface PreservationCreate {
  book_id: string;
  condition_status: ConditionStatus;
  condition_notes?: string;
  conservation_history?: ConservationHistoryEntry[];
  last_conservation_date?: string;
  conservator_name?: string;
  restoration_needed: boolean;
  restoration_priority?: RestorationPriority;
  restoration_notes?: string;
  estimated_cost?: number;
  last_inspection_date: string;
  next_inspection_date?: string;
  inspection_frequency?: InspectionFrequency;
  storage_temperature?: number;
  storage_humidity?: number;
  light_exposure?: LightExposure;
  damage_types?: DamageType[];
  damage_severity?: DamageSeverity;
  damage_photos?: string[];
}

export interface PreservationUpdate {
  condition_status?: ConditionStatus;
  condition_notes?: string;
  conservation_history?: ConservationHistoryEntry[];
  last_conservation_date?: string;
  conservator_name?: string;
  restoration_needed?: boolean;
  restoration_priority?: RestorationPriority;
  restoration_notes?: string;
  estimated_cost?: number;
  last_inspection_date?: string;
  next_inspection_date?: string;
  inspection_frequency?: InspectionFrequency;
  storage_temperature?: number;
  storage_humidity?: number;
  light_exposure?: LightExposure;
  damage_types?: DamageType[];
  damage_severity?: DamageSeverity;
  damage_photos?: string[];
}

export interface PreservationFilters {
  page?: number;
  page_size?: number;
  condition_status?: ConditionStatus;
  restoration_needed?: boolean;
  overdue_inspection?: boolean;
}

export interface PreservationResponse {
  data: PreservationRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PreservationStatistics {
  total_records: number;
  by_condition: Record<string, number>;
  needs_restoration: number;
  urgent_restoration: number;
  upcoming_inspections: number;
  overdue_inspections: number;
  average_condition_score: number;
}

// Helper type for form data
export type PreservationFormData = Omit<PreservationCreate, 'book_id'> & {
  book_id?: string;
};

// Helper functions for display
export const getConditionColor = (status: ConditionStatus): string => {
  const colors = {
    [ConditionStatus.EXCELLENT]: 'text-green-600 bg-green-50',
    [ConditionStatus.GOOD]: 'text-blue-600 bg-blue-50',
    [ConditionStatus.FAIR]: 'text-yellow-600 bg-yellow-50',
    [ConditionStatus.POOR]: 'text-orange-600 bg-orange-50',
    [ConditionStatus.CRITICAL]: 'text-red-600 bg-red-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

export const getPriorityColor = (priority: RestorationPriority): string => {
  const colors = {
    [RestorationPriority.LOW]: 'text-gray-600 bg-gray-50',
    [RestorationPriority.MEDIUM]: 'text-yellow-600 bg-yellow-50',
    [RestorationPriority.HIGH]: 'text-orange-600 bg-orange-50',
    [RestorationPriority.URGENT]: 'text-red-600 bg-red-50',
  };
  return colors[priority] || 'text-gray-600 bg-gray-50';
};

export const getConditionScore = (status: ConditionStatus): number => {
  const scores = {
    [ConditionStatus.EXCELLENT]: 100,
    [ConditionStatus.GOOD]: 75,
    [ConditionStatus.FAIR]: 50,
    [ConditionStatus.POOR]: 25,
    [ConditionStatus.CRITICAL]: 0,
  };
  return scores[status] || 0;
};
