export interface DiceSite {
  name: string;
  login(apiKey: string): Promise<boolean>;
  getBalance(apiKey: string): Promise<number>;
  placeBet(apiKey: string, amount: number, betRule: 'over' | 'under', betChance: number, clientSeed: string, serverSeed: string): Promise<{ success: boolean; win: boolean; profit: number; }>;
  withdraw(apiKey: string, amount: number, currency: string, address: string): Promise<{ success: boolean; message?: string; transactionId?: string; }>;
}