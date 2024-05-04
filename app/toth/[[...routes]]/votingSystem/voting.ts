import { dbClient, run } from "@/app/database";

type Nomination = {
	id: string;
	username: string;
	castId: string;
	fid: number;
	timestamp: string;
	weight: number;
};

export type NominationTOTH = {
	user: string;
	castId: string;
	count: number;
};

type Vote = {
	nomination: Nomination;
	timestamp: number;
	count: number;
};

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(user: string, castId: string, fid: number): Promise<Nomination>;
	recordVote(castId: string): Promise<void>;
	getVotingResults(): Promise<unknown[]>;
}

const dbName = "tipothehat";
const nomCollection = "nominations";
const voteCollection = "votes";

class MongoDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	async fetchNominations(): Promise<Nomination[]> {
		const startToday = new Date();
		startToday.setUTCHours(0);
		startToday.setUTCMinutes(0);
		startToday.setUTCSeconds(0);
		startToday.setUTCMilliseconds(0);

		const endToday = new Date();
		endToday.setUTCHours(18);
		endToday.setUTCMinutes(0);
		endToday.setUTCSeconds(0);
		endToday.setUTCMilliseconds(0);

		const _nominations = await dbClient
			.db(dbName)
			.collection(nomCollection)
			.find({
				timestamp: {
					$gte: startToday,
					$lte: endToday
				}
			})
			.sort({
				weight: -1
			})
			.limit(5)
			.toArray();

		const nominations: Nomination[] = _nominations.map((nom) => {
			return {
				username: nom.username,
				weight: nom.weight,
				castId: nom.castId,
				fid: nom.fid,
				id: nom.id,
				timestamp: nom.timestamp
			};
		});

		this.nominations = nominations;

		return nominations;
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
		throw new Error("Method not implemented.");
	}

	recordVote(castId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getVotingResults(): Promise<unknown[]> {
		throw new Error("Method not implemented.");
	}
}

class MockDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	fetchNominations(): Promise<Nomination[]> {
		const nominations: Nomination[] = [
			{
				user: "sum",
				castId: "0x8f3e2c44",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "sum",
				castId: "0x8f3e2c44",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "sum",
				castId: "0x8f3e2c44",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "edit",
				castId: "0xd87fd8f8",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "0xen",
				castId: "0xf02aab72",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "edit",
				castId: "0xd87fd8f8",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "0xen",
				castId: "0xf02aab72",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "edit",
				castId: "0xd87fd8f8",
				fid: 123,
				isPowerBadgeUser: true
			},
			{
				user: "0xen",
				castId: "0xf02aab72",
				fid: 123,
				isPowerBadgeUser: true
			}
		];
		this.votes = nominations.map((nom) => {
			return {
				nomination: nom,
				timestamp: 0,
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

	recordVote(castId: string): Promise<void> {
		let found = false;
		const updatedVotes = this.votes.map((vote) => {
			if (vote.nomination.castId === castId) {
				found = true;
				return {
					...vote,
					timestamp: new Date().getTime(),
					count: vote.count + 1
				};
			}
			return vote;
		});

		if (!found) {
			updatedVotes.push({
				nomination: { castId, user: "mock", fid: 0, isPowerBadgeUser: true },
				timestamp: new Date().getTime(),
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
			this.db.recordVote(castId);
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
