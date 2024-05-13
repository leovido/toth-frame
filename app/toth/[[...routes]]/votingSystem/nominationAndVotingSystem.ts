import { MongoDBService } from "./implementation/MongoDBService";
import { IDatabaseService } from "./interface/voting";
import { Nomination, Round } from "./types";

export class NominationAndVotingSystem {
	private db: IDatabaseService;
	public votes: Record<string, number> = {};
	public nominations: Nomination[] = [];
	public rounds: Round[] = [];
	public nominationOpen: boolean = false;

	constructor(db: IDatabaseService = new MongoDBService()) {
		this.db = db;
		this.scheduleEvents();
	}

	private async scheduleEvents(): Promise<void> {
		const now = new Date();
		const hours = now.getUTCHours();

		// TODO: remove hardcoded values to use ROUND nomination/voting start and end times
		if (hours > 0 && hours < 18) {
			this.startNominations();
		}

		if (hours >= 18) {
			this.nominationOpen = false;
		} else if (hours === 42 % 24) {
			this.endVoting();
		}

		this.rounds = await this.db.getCurrentRounds();
		this.nominations = await this.db.fetchNominations();
	}

	private startNominations(): void {
		this.nominationOpen = true;
		console.log("Nominations have started.");
	}

	private startVoting(): void {
		this.votes = {}; // Reset votes
		console.log("Voting has started.");
	}

	private endVoting(): void {
		console.log("Voting has ended.");
		this.displayResults();
	}

	public async nominate(data: Omit<Nomination, "id">) {
		if (this.nominationOpen) {
			const newNomination = await this.db.addNomination(data);
			this.nominations.push(newNomination);
			console.log(`Nomination received: ${data.username}/${data.castId}`);
		} else {
			console.log("Nominations are closed.");
		}
	}

	public async getCurrentRounds() {
		const currentRound = await this.db.getCurrentRounds();

		return currentRound;
	}

	public async vote(nominationId: string, fid: number, roundId: string) {
		await this.db.recordVote(nominationId, fid, roundId);
		console.log(`Vote received for: ${nominationId} by ${fid}`);
	}

	public async fetchNominations() {
		try {
			const nominations = await this.db.fetchNominations();

			return nominations;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	public async fetchNominationsByRound(roundId: string) {
		const currentRound = await this.db.fetchNominationsByRound(roundId);

		return currentRound;
	}

	public async getVoteResults(fid: number, roundId: string) {
		try {
			const votes = await this.db.getVotingResults(fid, roundId);

			return votes;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	private displayResults(): void {
		console.log("Voting Results:");
		console.log(this.votes);
	}
}
