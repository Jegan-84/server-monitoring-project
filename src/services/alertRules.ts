import { AlertRule } from "@/types/alertRules";
import { supabase } from "@/utils/supabase";

export const alertRulesService = {
  async getAll() {
    const { data, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("is_delete", false)
      .order("created_date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(rule: Partial<AlertRule>) {
    const user = (await supabase.auth.getUser()).data.user;
    console.log("user", user);
    const { data, error } = await supabase
      .from("alert_rules")
      .insert([
        {
          ...rule,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id: string, rule: Partial<AlertRule>) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from("alert_rules")
      .update({
        ...rule,
        // updated_by: user?.id,
        // updated_date: new Date().toISOString(),
      })
      .eq("alert_rule_id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase
      .from("alert_rules")
      .update({
        is_delete: true,
        // updated_by: user?.id,
        updated_date: new Date().toISOString(),
      })
      .eq("alert_rule_id", id);

    if (error) throw error;
  },
  async getByConditionType(conditionType: string) {
    const { data, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("is_delete", false)
      .eq("condition_type", conditionType)
      .order("created_date", { ascending: false });

    if (error) throw error;
    return data;
  },
};
