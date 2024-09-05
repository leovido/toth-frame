// import { randomUUID } from "crypto";
// import { IDatabaseService } from "../interface/voting";
// import { Nomination, Vote, Round } from "../types";
// import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";

// export class MongoDBServiceV2 implements IDatabaseService {
// 	public nominations: Nomination[] = [];
// 	public votes: Vote[] = [];

// 	constructor() {}

// 	async fetchSignerByPKey(publicKey: string) {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/signers/signers?publicKey=${publicKey}`
// 			: "";

// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 			}

// 			const signer: Signer = await fetchResponse.json();

// 			return signer;
// 		} catch (error) {
// 			console.error("Error fetching signer by public key:", error);
// 			throw error;
// 		}
// 	}

// 	async fetchHistory(fid: number): Promise<Nomination[]> {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/history/history?fid=${fid}`
// 			: "";

// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 			}

// 			const nominations: Nomination[] = await fetchResponse.json();

// 			return nominations;
// 		} catch (error) {
// 			console.error(`Error fetching history for ${fid}:`, error);
// 			throw error;
// 		}
// 	}

// 	async updateSigner(
// 		status: string,
// 		signerUUID: string,
// 		fid: number
// 	): Promise<Signer | undefined> {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/signers/updateSigner`
// 			: "";

// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json"
// 				},
// 				body: JSON.stringify({ status, signerUUID, fid })
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 			}

// 			if (fetchResponse.status === 201) {
// 				const updateSigner = await fetchResponse.json();

// 				return updateSigner;
// 			} else {
// 				return undefined;
// 			}
// 		} catch (error) {
// 			console.error("Error updating signer:", error);
// 			throw error;
// 		}
// 	}

// 	async fetchSigner(fid: number): Promise<Signer | undefined> {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/signers/signersByFid?fid=${fid}`
// 			: "";

// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 			}

// 			if (fetchResponse.status === 200) {
// 				const signer = await fetchResponse.json();

// 				return signer;
// 			} else {
// 				return undefined;
// 			}
// 		} catch (error) {
// 			console.error("Error fetching signer:", error);
// 			throw error;
// 		}
// 	}

// 	async storeSigner(data: Signer) {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/signers/signers`
// 			: "";

// 		const body = JSON.stringify({
// 			id: randomUUID(),
// 			createdAt: new Date().toISOString(),
// 			...data
// 		});
// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json"
// 				},
// 				body: body
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to store signer: ${fetchResponse.status}`);
// 			}

// 			return;
// 		} catch (error) {
// 			console.error("Error storing signer:", error);
// 			throw error;
// 		}
// 	}

// 	async fetchNominationsByRound(roundId: string): Promise<Nomination[]> {
// 		const fetchResponse = await fetch(
// 			`${process.env.TOTH_API}/nominations/nominationsByRound?roundId=${roundId}` ||
// 				"",
// 			{
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			}
// 		);

// 		if (!fetchResponse.ok) {
// 			throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 		}
// 		const json = await fetchResponse.json();
// 		const response = json.responseObject;

// 		return response;
// 	}

// 	async fetchNominationsByFid(fid: number): Promise<Nomination[]> {
// 		const fetchResponse = await fetch(
// 			`${process.env.TOTH_API}/nominations/nominationsByFid?fid=${fid}` || "",
// 			{
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			}
// 		);

// 		const nomination: Nomination[] = await fetchResponse.json();

// 		return nomination;
// 	}

// 	async fetchNominationById(id: string): Promise<Nomination[]> {
// 		const fetchResponse = await fetch(
// 			`${process.env.TOTH_API}/nominations/nominationsById?id=${id}` || "",
// 			{
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			}
// 		);

// 		const json = await fetchResponse.json();
// 		const response = json.responseObject;

// 		return response;
// 	}

// 	async getCurrentRounds(): Promise<Round[]> {
// 		try {
// 			const fetchResponse = await fetch(
// 				`${process.env.TOTH_API}/helpers/current-period` || "",
// 				{
// 					method: "GET",
// 					headers: {
// 						"Content-Type": "application/json"
// 					}
// 				}
// 			);

// 			const json = await fetchResponse.json();
// 			const response = json.responseObject;
// 			console.log("current rounds", response);

// 			return response;
// 		} catch (error) {
// 			console.error("Error fetching current rounds:", error);
// 			throw error;
// 		}
// 	}

// 	async fetchNominations(): Promise<Nomination[]> {
// 		const fetchResponse = await fetch(
// 			`${process.env.TOTH_API}/nominations/nominations` || "",
// 			{
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			}
// 		);

// 		const json = await fetchResponse.json();
// 		const response = json.responseObject;

// 		return response;
// 	}

// 	async addNomination(data: Omit<Nomination, "id">): Promise<Nomination> {
// 		const nomination = {
// 			...data,
// 			id: randomUUID()
// 		};

// 		await fetch(`${process.env.TOTH_API}/nominations/nominations` || "", {
// 			method: "POST",
// 			body: JSON.stringify(nomination),
// 			headers: {
// 				"Content-Type": "application/json"
// 			}
// 		}).catch((e) => {
// 			console.error(e, "error add nomination");
// 		});

// 		return nomination;
// 	}

// 	async recordVote(
// 		nominationId: string,
// 		fid: number,
// 		roundId: string
// 	): Promise<Vote> {
// 		const data: Vote = {
// 			nominationId,
// 			createdAt: new Date().toISOString(),
// 			fid,
// 			roundId,
// 			id: randomUUID()
// 		};
// 		const fetchResponse = await fetch(
// 			`${process.env.TOTH_API}/votes/votes` || "",
// 			{
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json"
// 				},
// 				body: JSON.stringify(data)
// 			}
// 		);
// 		const json = await fetchResponse.json();
// 		const response = json.responseObject;

// 		return response;
// 	}

// 	async getVotingResults(fid: number, roundId: string) {
// 		const apiUrl = process.env.TOTH_API
// 			? `${process.env.TOTH_API}/votes/votes?roundId=${roundId}`
// 			: "https://default-api-url/votes";

// 		try {
// 			const fetchResponse = await fetch(apiUrl, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json"
// 				}
// 			});

// 			if (!fetchResponse.ok) {
// 				throw new Error(`Failed to fetch results: ${fetchResponse.status}`);
// 			}

// 			const json = await fetchResponse.json();
// 			const response: Vote[] = json.responseObject;
// 			const userVote = response.find((vote) => {
// 				return vote.fid === fid;
// 			});
// 			return userVote;
// 		} catch (error) {
// 			console.error("Error fetching voting results:", error);
// 			throw error;
// 		}
// 	}
// }
