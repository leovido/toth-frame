import { randomUUID } from "crypto";
import { IDatabaseService, Nomination, Vote } from "../voting";

export class MongoDBService implements IDatabaseService {
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

		await fetch(`${process.env.TOTH_API}/nominations` || "", {
			method: "POST",
			body: JSON.stringify(nomination),
			headers: {
				"Content-Type": "application/json"
			}
		}).catch((e) => {
			console.error(e, "error add nomination");
		});

		return Promise.resolve(nomination);
	}

	async recordVote(nominationId: string, fid: number): Promise<void> {
		const data: Vote = {
			nominationId,
			createdAt: new Date().toISOString(),
			fid,
			id: randomUUID()
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
