export interface ComplianceProvider {
  getKycKybStatus(accountId: string): Promise<"VERIFIED" | "PENDING" | "FAILED">;
  screenSanctions(subjectId: string): Promise<{ match: boolean; reference?: string }>;
  checkJurisdictionRestrictions(input: {
    origin?: string;
    destination?: string;
    assetId: string;
  }): Promise<{ restricted: boolean; reason?: string }>;
}
