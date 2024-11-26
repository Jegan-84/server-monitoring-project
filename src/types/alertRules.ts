export interface AlertRule {
  alert_rule_id: string;
  rule_name: string;
  monitored_entity: "SERVER" | "SERVICE";
  condition_type:
    | "CPU_USAGE"
    | "MEMORY_USAGE"
    | "DISK_USAGE"
    | "SERVICE_DOWN"
    | "CUSTOM";
  threshold_value: number;
  duration: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  color: string;
  notification_email: boolean;
  notification_sms: boolean;
  notification_webhook: boolean;
  notification_slack: boolean;
  created_date: string;
  updated_date: string;
  created_by: string;
  updated_by: string;
  is_delete: boolean;
}
