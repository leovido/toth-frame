import { MongoDBService } from "./implementation/MongoDBService";
import { IDatabaseService } from "./interface/voting";
import { Nomination } from "./types";

export class NominationAndVotingSystem {
	private db: IDatabaseService;
	public votes: Record<string, number> = {};
	public nominations: Nomination[] = [];
	public nominationOpen: boolean = false;
	public votingOpen: boolean = false;

	constructor(db: IDatabaseService = new MongoDBService()) {
		this.db = db;
		this.scheduleEvents();
	}

	private async scheduleEvents(): Promise<void> {
		const now = new Date();
		const hours = now.getUTCHours();

		if (hours > 0 && hours < 18) {
			this.startNominations();
		} else if (hours >= 18) {
			this.startVoting();
			this.nominationOpen = false;
		} else if (hours === 42 % 24) {
			this.endVoting();
		}

		this.nominations = await this.db.fetchNominations();
	}

	private startNominations(): void {
		this.nominationOpen = true;
		this.votingOpen = false;
		console.log("Nominations have started.");
	}

	private startVoting(): void {
		this.votes = {}; // Reset votes
		this.votingOpen = true;
		console.log("Voting has started.");
	}

	private endVoting(): void {
		this.votingOpen = false;
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

	public async vote(nominationId: string, fid: number) {
		if (this.votingOpen) {
			await this.db.recordVote(nominationId, fid);
			console.log(`Vote received for: ${nominationId} by ${fid}`);
		} else {
			console.log("Voting is closed.");
		}
	}

	public async fetchNominations() {
		try {
			console.warn("fetching...");
			const nominations = await this.db.fetchNominations();

			return nominations;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	public async getVoteResults(fid: number) {
		try {
			const votes = await this.db.getVotingResults(fid);

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
