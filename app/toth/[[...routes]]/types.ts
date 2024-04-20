export interface DegenResponse {
	snapshot_date: string;
	user_rank: string;
	wallet_address: string;
	avatar_url: string;
	display_name: string;
	tip_allowance: string;
	remaining_allowance: string;
}

export interface DegenCast {
	username: string;
	amount: number;
}

export interface CastWorthModel {
	totalAmount: number;
	dollarValue: string;
	topThree: DegenCast[];
	isBoosted: boolean;
}
