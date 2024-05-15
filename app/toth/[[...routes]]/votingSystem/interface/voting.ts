import { Nomination, Vote, Round } from "../types";

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(data: Omit<Nomination, "id">): Promise<Nomination>;
	recordVote(nominationId: string, fid: number, roundId: string): Promise<Vote>;
	getVotingResults(fid: number, roundId: string): Promise<Vote | undefined>;
	getCurrentRounds(): Promise<Round[]>;
	fetchNominationsByRound(roundId: string): Promise<Nomination[]>;
	fetchNominationsByFid(fid: number): Promise<Nomination[]>;
	fetchNominationById(id: string): Promise<Nomination[]>;
}
