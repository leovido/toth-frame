type Nomination = {
	user: string;
	castId: string;
	fid: number;
};

export type NominationTOTH = {
	user: string;
	castId: string;
	count: number;
};

type Vote = {
	nomination: Nomination;
	fid: number;
	timestamp: number;
};

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(user: string, castId: string, fid: number): Promise<Nomination>;
	recordVote(castId: string): Promise<void>;
	getVotingResults(): Promise<unknown[]>;
}

class MockDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	fetchNominations(): Promise<Nomination[]> {
		const nominations: Nomination[] = [
			{
				user: "sum",
				castId: "0xn48n323",
				fid: 123
			},
			{
				user: "edit",
				castId: "0x34n3y2n",
				fid: 123
			},
			{
				user: "0xen",
				castId: "0xn3y4n3",
				fid: 123
			},
			{
				user: "edit",
				castId: "0x34n3y2n",
				fid: 123
			},
			{
				user: "0xen",
				castId: "0xn3y4n3",
				fid: 123
			},
			{
				user: "edit",
				castId: "0x34n3y2n",
				fid: 123
			},
			{
				user: "0xen",
				castId: "0xn3y4n3",
				fid: 123
			}
		];
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
			fid: fid
		};
		return Promise.resolve(nomination);
	}

	recordVote(castId: string): Promise<void> {
		const findCast = this.votes.find((vote) => {
			return vote.nomination.castId === castId;
		});
		if (findCast) {
			findCast.count += 1;
		}
		return Promise.resolve();
	}
	getVotingResults(): Promise<unknown[]> {
		const votingResults = this.votes.sort((a, b) => {
			return b.count - a.count;
		});
		return Promise.resolve(votingResults);
	}
}

export class NominationAndVotingSystem {
	private db: IDatabaseService;
	public nominations: Nomination[] = [];
	private votes: Record<string, number> = {};
	public nominationOpen: boolean = false;
	public votingOpen: boolean = false;

	constructor(db: IDatabaseService = new MockDBService()) {
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
		// this.nominationOpen = false;
		this.votingOpen = true;
		console.log("Voting has started.");
	}

	private endVoting(): void {
		this.votingOpen = false;
		console.log("Voting has ended.");
		this.displayResults();
	}

	public nominate(cast: Nomination): void {
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
