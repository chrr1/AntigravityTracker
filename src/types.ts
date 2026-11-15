export type Model = { id: string; name: string; resetAt: number | null };
export type Account = { id: string; name: string; models: Model[] };
export type Ev = { at: number; acc: string; model: string; ms: number };
export type State = { accounts: Account[]; log: { t: string; at: number }[]; ev: Ev[] };
