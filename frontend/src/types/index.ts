// Document Interfaces
export type ProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  organization?: string | null;
  upload_date: string;
  file_type: string;
  file_size: number;
  processing_status: ProcessingStatus;
  page_count?: number | null;
}

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  processing_status: ProcessingStatus;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  total: number;
}

export interface DocumentStatusResponse {
  id: string;
  processing_status: ProcessingStatus;
  page_count?: number | null;
}

// Requirement Interfaces
export type RequirementCategory =
  | 'Clinical'
  | 'Technical'
  | 'Security'
  | 'Compliance'
  | 'Financial'
  | 'Legal'
  | 'Operational'
  | 'General';

export type RequirementPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RequirementType = 'Mandatory' | 'Optional' | 'Informational';
export type RequirementStatus = 'IDENTIFIED' | 'ANALYZED' | 'RESPONDED' | 'REVIEWED';

export interface RequirementItem {
  id: string;
  document_id: string;
  requirement_text: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  requirement_type: RequirementType;
  page_number?: number | null;
  section?: string | null;
  status: RequirementStatus;
}

export interface RequirementListResponse {
  requirements: RequirementItem[];
  total: number;
}

// Search Interfaces
export interface SearchRequest {
  query: string;
  document_id?: string;
  category?: string;
  priority?: string;
  top_k?: number;
}

export interface SearchResultItem {
  requirement_id: string;
  requirement_text: string;
  document_id: string;
  similarity_score: number;
  category: RequirementCategory;
  priority: RequirementPriority;
  page_number?: number | null;
  section?: string | null;
  source_text?: string | null;
}

export interface SearchResponse {
  results: SearchResultItem[];
  query: string;
  total: number;
}

// Responses / RAG Interfaces
export interface SourceReference {
  document_id: string;
  document_name: string;
  page?: number | null;
  section?: string | null;
  excerpt?: string | null;
}

export interface DraftResponseItem {
  id: string;
  requirement_id: string;
  requirement_text: string;
  draft_response: string;
  sources: SourceReference[];
  created_at: string;
  updated_at: string;
}

export interface DraftResponseListResponse {
  responses: DraftResponseItem[];
  total: number;
}

export interface GenerateResponseRequest {
  requirement_id: string;
}

export interface UpdateResponseRequest {
  response_text: string;
}

// Compliance Interfaces
export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Missing' | 'Needs Review';

export interface ComplianceItem {
  requirement_id: string;
  requirement_text: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  status: ComplianceStatus;
  evidence?: string | null;
  reason: string;
  source?: string | null;
  recommended_action: string;
}

export interface ComplianceReport {
  document_id: string;
  compliance_score: number;
  total_requirements: number;
  compliant: number;
  partially_compliant: number;
  missing: number;
  needs_review: number;
  items: ComplianceItem[];
  scoring_methodology: string;
}

export interface MissingRequirementItem {
  requirement_id: string;
  requirement_text: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  status: ComplianceStatus;
  reason: string;
  recommended_action: string;
}

export interface MissingRequirementsResponse {
  requirements: MissingRequirementItem[];
  total: number;
}

// Dashboard Interfaces
export interface DashboardSummary {
  total_documents: number;
  total_requirements: number;
  critical_requirements: number;
  missing_requirements: number;
  draft_responses: number;
  compliance_score?: number | null;
}

export interface CategoryCount {
  category: RequirementCategory;
  count: number;
}

export interface PriorityCount {
  priority: RequirementPriority;
  count: number;
}

export interface ComplianceOverview {
  compliant: number;
  partially_compliant: number;
  missing: number;
  needs_review: number;
  compliance_score?: number | null;
}

// API Error format
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
