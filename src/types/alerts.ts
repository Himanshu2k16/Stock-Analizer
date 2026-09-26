export type AlertOperator = ">=" | "<=";

export interface AlertRule {
  id: string;
  symbol: string;
  operator: AlertOperator;
  threshold: number;
  active: boolean;
  createdBy: "USER" | "AGENT";
  createdAt: string;
}
