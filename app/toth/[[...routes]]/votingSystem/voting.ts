import { randomUUID } from "crypto";

export type Nomination = {
	id: string;
	username: string;
	castId: string;
	fid: number;
	createdAt: string;
	weight: number;
	votesCount?: number;
};

export type NominationTOTH = {
	user: string;
	castId: string;
	count: number;
};

type Vote = {
	nominationId: string;
	createdAt: string;
	fid: number;
	id: string;
};

export interface IDatabaseService {
	fetchNominations(): Promise<Nomination[]>;
	openVoting(): Promise<void>;
	closeVoting(): Promise<void>;
	addNomination(data: Omit<Nomination, "id">): Promise<Nomination>;
	recordVote(nominationId: string, fid: number): Promise<void>;
	getVotingResults(): Promise<unknown[]>;
}

class MongoDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	async fetchNominations(): Promise<Nomination[]> {
		const fetchResponse = await fetch(
			`${process.env.TOTH_API}/nominations` || "",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const json: Nomination[] = await fetchResponse.json();

		const nominations: Nomination[] = json.map((nom) => {
			return {
				username: nom.username,
				weight: nom.weight,
				castId: nom.castId,
				fid: nom.fid,
				id: nom.id,
				createdAt: nom.createdAt,
				votesCount: nom.votesCount
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
	async addNomination(data: Omit<Nomination, "id">): Promise<Nomination> {
		const nomination = {
			...data,
			id: randomUUID()
		};
		const response = await fetch(`${process.env.TOTH_API}/nominations` || "", {
			method: "POST",
			body: JSON.stringify(nomination),
			headers: {
				"Content-Type": "application/json"
			}
		}).catch((e) => {
			console.error(e, "error add nomination");
		});

		console.warn(response, "here!");
		return Promise.resolve(nomination);
	}

	async recordVote(nominationId: string, fid: number): Promise<void> {
		const data: Vote = {
			nominationId,
			createdAt: new Date().toISOString(),
			fid,
			id: "506ec866-883e-4d85-93d1-e83b36e1c01d"
		};
		const fetchResponse = await fetch(`${process.env.TOTH_API}/votes` || "", {
			method: "POST",
			headers: {
				"Content-Type": "application/json" // Set the content type to application/json
			},
			body: JSON.stringify(data)
		});
		const json = await fetchResponse.json();

		return Promise.resolve(json);
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

		if (hours > 0 && hours < 15) {
			this.startNominations();
		} else if (hours >= 15) {
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
