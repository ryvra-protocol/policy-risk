export interface RiskSignalProvider {
  getAccountRiskScore(accountId: string): Promise<number>;
  getAbuseSignalLevel(accountId: string): Promise<"LOW" | "MEDIUM" | "HIGH">;
}
