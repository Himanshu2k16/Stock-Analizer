/**
 * DTO contracts for the Meridian REST API (v1).
 * Mirrors docs/Meridian_TRD_v1.0.pdf section 9 - keep both in sync.
 */

export type RiskLevel = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
export type InvestmentHorizon = "SHORT" | "MEDIUM" | "LONG";
export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH" | "TELEGRAM";
export type TriggerMode = "ONE_TIME" | "RECURRING" | "PERSISTENT";
export type RuleCreator = "USER" | "AGENT";

export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  timezone: string;
  currency: string;
}

export interface UserPreferencesDto {
  riskLevel: RiskLevel;
  horizon: InvestmentHorizon;
  monthlyBudget: number;
  maxPositionWeight: number;
  channels: NotificationChannel[];
}

export interface HoldingDto {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  thesis: string;
}

export interface PortfolioSummaryDto {
  totalValue: number;
  totalCost: number;
  unrealizedPnl: number;
  dayPnl: number;
}

export type ConditionType =
  | "PRICE"
  | "PERCENT_MOVE"
  | "VOLUME"
  | "PORTFOLIO_WEIGHT"
  | "FUNDAMENTAL"
  | "NEWS"
  | "PERIODIC"
  | "AND"
  | "OR";

/**
 * JSONB condition tree from the TRD rule engine (section 6). Leaf nodes carry
 * operator/value; AND/OR nodes carry children. Kept open so the backend can add
 * rule families without breaking the frontend.
 */
export interface ConditionNode {
  type: ConditionType;
  symbol?: string;
  operator?: ">=" | "<=" | ">" | "<" | "==";
  value?: number;
  metric?: string;
  eventType?: string;
  sentiment?: "POSITIVE" | "NEGATIVE" | "ANY";
  cron?: string;
  children?: ConditionNode[];
}

export interface AlertRuleDto {
  id: string;
  assetType: string;
  symbol: string;
  conditionTree: ConditionNode;
  triggerMode: TriggerMode;
  cooldownMinutes: number;
  notificationChannels: NotificationChannel[];
  active: boolean;
  createdBy: RuleCreator;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface NotificationDto {
  id: string;
  ruleId?: string;
  title: string;
  body: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  channel: NotificationChannel;
  status: "PENDING" | "SENT" | "FAILED";
  createdAt: string;
}

/** RFC 7807 problem details, the API error envelope. */
export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  traceId?: string;
}
