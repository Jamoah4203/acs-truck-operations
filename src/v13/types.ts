export type Role='admin'|'operations'|'accounts'|'driver';
export type Profile={id:string;full_name:string|null;phone:string|null;role:Role;active:boolean};
export type PageState={page:number;pageSize:number;search:string;sort:string;ascending:boolean;from?:string;to?:string};
export type PageResult<T>={rows:T[];count:number};
export type Option={id:string;name:string};
export type DashboardSummary={income:number;expenses:number;receivables:number;pending:number;completed:number;vehicles:number;maintenance:number;recent_deliveries:any[];recent_transactions:any[]};
export type PnlReport={current:{income:number;expenses:number;receivables:number};previous:{income:number;expenses:number;receivables:number};income_categories:{name:string;amount:number}[];expense_categories:{name:string;amount:number}[]};
