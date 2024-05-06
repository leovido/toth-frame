import { randomUUID } from "crypto";

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

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(data: Omit<Nomination, "id">): Promise<Nomination>;
	recordVote(nominationId: string, fid: number): Promise<void>;
	getVotingResults(): Promise<unknown[]>;
}
