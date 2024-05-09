export type Nomination = {
	id: string;
	username: string;
	castId: string;
	fid: number;
	createdAt: string;
	weight: number;
	votesCount?: number;
};

export type NominationTOTH = {
	user: string;
	castId: string;
	count: number;
};

export type Vote = {
	nominationId: string;
	createdAt: string;
	fid: number;
	id: string;
};