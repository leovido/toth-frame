import { MongoDBService } from "./implementation/MongoDBService";
import { IDatabaseService, Nomination } from "./voting";

export class NominationAndVotingSystem {
	private db: IDatabaseService;
	public nominations: Nomination[] = [];
	public votes: Record<string, number> = {};
	public nominationOpen: boolean = false;
	public votingOpen: boolean = false;

	constructor(db: IDatabaseService = new MongoDBService()) {
		this.db = db;
		this.scheduleEvents();
	}

	private async scheduleEvents(): Promise<void> {
		const now = new Date();
		const hours = now.getUTCHours();

		this.nominations = await this.db.fetchNominations();

		if (hours > 0 && hours < 18) {
			this.startNominations();
		} else if (hours >= 18) {
			this.startVoting();
			this.nominationOpen = false;
		} else if (hours === 42 % 24) {
			this.endVoting();
		}
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
			const nomination = await this.db.addNomination(data);
			this.nominations.push(nomination);
			console.log(`Nomination received: ${data.username}/${data.castId}`);
		} else {
			console.log("Nominations are closed.");
		}
	}

	public vote(nominationId: string, fid: number): void {
		if (this.votingOpen) {
			this.db.recordVote(nominationId, fid);
			console.log(`Vote received for: ${nominationId} by ${fid}`);
		} else {
			console.log("Voting is closed.");
		}
	}

	private displayResults(): void {
		console.log("Voting Results:");
		console.log(this.votes);
	}
}
