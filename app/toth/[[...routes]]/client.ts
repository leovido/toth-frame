import { NominationAndVotingSystem } from "./votingSystem/voting";

export interface FCUser {
	username: string;
	degenValue?: string;
	timestamp: string;
}

export const votingSystem = new NominationAndVotingSystem();
