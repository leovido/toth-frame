import { randomUUID } from "crypto";
import { IDatabaseService, Nomination, Vote } from "./voting";

export class MockDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	fetchNominations(): Promise<Nomination[]> {
		const date = new Date().toISOString();
		const nominations: Nomination[] = [
			{
				username: "sum",
				castId: "0x8f3e2c44",
				fid: 123,
				weight: 1,
				createdAt: date,
				id: randomUUID()
			}
		];
		this.votes = nominations.map((nom) => {
			return {
				nomination: nom,
				createdAt: 0,
				count: 0
			};
		});
		return Promise.all(nominations);
	}
	openVoting(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	closeVoting(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	addNomination(
		user: string,
		castId: string,
		fid: number
	): Promise<Nomination> {
		const nomination: Nomination = {
			user: user,
			castId: castId,
			fid: fid,
			isPowerBadgeUser: true
		};
		return Promise.resolve(nomination);
	}

	recordVote(nominationId: string, fid: number): Promise<void> {
		let found = false;
		const updatedVotes = this.votes.map((vote) => {
			if (vote.nomination.castId === castId) {
				found = true;
				return {
					...vote,
					createdAt: new Date().getTime(),
					count: vote.count + 1
				};
			}
			return vote;
		});

		if (!found) {
			updatedVotes.push({
				nomination: { castId, user: "mock", fid: 0, isPowerBadgeUser: true },
				createdAt: new Date().getTime(),
				count: 1
			});
		}

		this.votes = updatedVotes;
		return Promise.resolve();
	}
	getVotingResults(): Promise<unknown[]> {
		const votingResults = this.votes.sort((a, b) => {
			return b.count - a.count;
		});
		return Promise.resolve(votingResults);
	}
}
