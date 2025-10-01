// Domain types for credit and billing-related entities

export interface UserCredits {
  user_id: string;
  panel_balance: number;
  last_purchased_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditPurchase {
  purchase_id: string;
  user_id: string;
  stripe_charge_id: string;
  amount_dollars: number;
  panels_purchased: number;
  created_at: string;
}

export interface PanelUsageLog {
  usage_id: string;
  user_id: string;
  comic_id?: string;
  panel_id?: string;
  credits_consumed: number;
  created_at: string;
}

export interface StripeEventRecord {
  event_id: string;
  stripe_event_id: string;
  event_type: string;
  related_charge_id?: string;
  processed_at: string;
  metadata?: Record<string, unknown>;
}
