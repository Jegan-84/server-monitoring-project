export interface ReportTemplate {
  report_templates_id: string;
  template_name: string;
  description: string | null;
  created_by: string | null;
  last_modified: string | null;
  schedule_status: boolean;
  last_generated: string | null;
  created_date: string;
  updated_date: string;
  is_delete: boolean;
}
