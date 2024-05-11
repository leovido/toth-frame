import { Nomination, Vote, Round } from "../types";

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(data: Omit<Nomination, "id">): Promise<Nomination>;
	recordVote(nominationId: string, fid: number): Promise<void>;
	getVotingResults(fid: number): Promise<Vote | undefined>;
	getCurrentRounds(): Promise<Round[]>;
}
