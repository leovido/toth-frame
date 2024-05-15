import { randomUUID } from "crypto";
import { IDatabaseService } from "../interface/voting";
import { Nomination, Vote, Round } from "../types";

export class MongoDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	async fetchNominationsByRound(roundId: string): Promise<Nomination[]> {
		const fetchResponse = await fetch(
			`${process.env.TOTH_API}/nominationsByRound?roundId=${roundId}` || "",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const json: Nomination[] = await fetchResponse.json();

		return json;
	}

	async fetchNominationsByFid(fid: number): Promise<Nomination[]> {
		const fetchResponse = await fetch(
			`${process.env.TOTH_API}/nominationsByFid?fid=${fid}` || "",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const nomination: Nomination[] = await fetchResponse.json();

		return nomination;
	}

	async fetchNominationById(id: string): Promise<Nomination[]> {
		const fetchResponse = await fetch(
			`${process.env.TOTH_API}/nominationsById?id=${id}` || "",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const nomination: Nomination[] = await fetchResponse.json();

		return nomination;
	}

	async getCurrentRounds(): Promise<Round[]> {
		const fetchResponse = await fetch(
			`${process.env.TOTH_API}/current-period` || "",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const json: Round[] = await fetchResponse.json();

		return json;
	}

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

		return json;
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

		return nomination;
	}

	async recordVote(
		nominationId: string,
		fid: number,
		roundId: string
	): Promise<Vote> {
		const data: Vote = {
			nominationId,
			createdAt: new Date().toISOString(),
			fid,
			roundId,
			id: randomUUID()
		};
		const fetchResponse = await fetch(`${process.env.TOTH_API}/votes` || "", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		});
		const json: Vote = await fetchResponse.json();

		return json;
	}

	async getVotingResults(fid: number, roundId: string) {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/votes?roundId=${roundId}`
			: "https://default-api-url/votes";

		try {
			const fetchResponse = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			});

			if (!fetchResponse.ok) {
				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
			}

			const json: Vote[] = await fetchResponse.json();
			const userVote = json.find((vote) => {
				return vote.fid === fid;
			});
			return userVote;
		} catch (error) {
			console.error("Error fetching voting results:", error);
			throw error;
		}
	}
}
