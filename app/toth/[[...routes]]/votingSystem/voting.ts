type Cast = {
	user: string;
	castId: string;
};

export class NominationAndVotingSystem {
	private nominations: Cast[] = [];
	private votes: Record<string, number> = {};
	private nominationOpen: boolean = false;
	private votingOpen: boolean = false;

	constructor() {
		this.scheduleEvents();
	}

	private scheduleEvents(): void {
		setInterval(() => {
			const now = new Date();
			const hours = now.getHours();

			if (hours === 0) {
				// Midnight, start nominations
				this.startNominations();
			} else if (hours === 18) {
				// 18:00, start voting
				this.startVoting();
			} else if (hours === 42 % 24) {
				// 42 hours from midnight (18:00 next day), end voting
				this.endVoting();
			}
		}, 3600000); // Check every hour
	}

	private startNominations(): void {
		this.nominations = []; // Reset nominations
		this.nominationOpen = true;
		this.votingOpen = false;
		console.log("Nominations have started.");
	}

	private startVoting(): void {
		this.votes = {}; // Reset votes
		this.nominationOpen = false;
		this.votingOpen = true;
		console.log("Voting has started.");
	}

	private endVoting(): void {
		this.votingOpen = false;
		console.log("Voting has ended.");
		this.displayResults();
	}

	public nominate(cast: Cast): void {
		if (this.nominationOpen) {
			this.nominations.push(cast);
			console.log(`Nomination received: ${cast.user}/${cast.castId}`);
		} else {
			console.log("Nominations are closed.");
		}
	}

	public vote(castId: string): void {
		if (this.votingOpen) {
			if (this.votes[castId]) {
				this.votes[castId]++;
			} else {
				this.votes[castId] = 1;
			}
			console.log(`Vote received for: ${castId}`);
		} else {
			console.log("Voting is closed.");
		}
	}

	private displayResults(): void {
		console.log("Voting Results:");
		console.log(this.votes);
	}
}
