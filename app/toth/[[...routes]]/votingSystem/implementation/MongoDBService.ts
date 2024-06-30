import { randomUUID } from "crypto";
import { IDatabaseService } from "../interface/voting";
import { Nomination, Vote, Round } from "../types";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
export class MongoDBService implements IDatabaseService {
	public nominations: Nomination[] = [];
	public votes: Vote[] = [];

	constructor() {}

	async fetchSignerByPKey(publicKey: string) {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/signers?publicKey=${publicKey}`
			: "";

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

			const signer: Signer = await fetchResponse.json();

			return signer;
		} catch (error) {
			console.error("Error fetching signer:", error);
			throw error;
		}
	}

	async fetchHistory(fid: number): Promise<Nomination[]> {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/history?fid=${fid}`
			: "";

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

			const nominations: Nomination[] = await fetchResponse.json();

			return nominations;
		} catch (error) {
			console.error(`Error fetching history for ${fid}:`, error);
			throw error;
		}
	}

	async updateSigner(publicKey: string): Promise<Signer | undefined> {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/updateSigner`
			: "";

		try {
			const fetchResponse = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ publicKey })
			});

			if (!fetchResponse.ok) {
				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
			}

			if (fetchResponse.status === 201) {
				const updateSigner = await fetchResponse.json();

				return updateSigner;
			} else {
				return undefined;
			}
		} catch (error) {
			console.error("Error fetching signer:", error);
			throw error;
		}
	}

	async fetchSigner(fid: number): Promise<Signer | undefined> {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/signers?fid=${fid}`
			: "";

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

			if (fetchResponse.status === 200) {
				const signer = await fetchResponse.json();

				return signer;
			} else {
				return undefined;
			}
		} catch (error) {
			console.error("Error fetching signer:", error);
			throw error;
		}
	}

	async storeSigner(data: Signer) {
		const apiUrl = process.env.TOTH_API
			? `${process.env.TOTH_API}/signers`
			: "";

		try {
			const fetchResponse = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					id: randomUUID(),
					createdAt: new Date().toISOString(),
					...data
				})
			});

			if (!fetchResponse.ok) {
				throw new Error(`Failed to store signer: ${fetchResponse.status}`);
			}

			return;
		} catch (error) {
			console.error("Error storing signer:", error);
			throw error;
		}
	}

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

		if (!fetchResponse.ok) {
			throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
		}
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
