import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { client } from "../fetch";
import { MongoDBService } from "./implementation/MongoDBService";
import { IDatabaseService } from "./interface/voting";
import { Nomination, Round } from "./types";

export class NominationAndVotingSystem {
	private db: IDatabaseService;
	public votes: Record<string, number> = {};
	public nominations: Nomination[] = [];
	public rounds: Round[] = [];
	public nominationOpen: boolean = false;

	constructor(db: IDatabaseService = new MongoDBService()) {
		this.db = db;
		this.scheduleEvents();
	}

	private async scheduleEvents(): Promise<void> {
		const now = new Date();
		const hours = now.getUTCHours();

		this.nominationOpen = hours >= 0 && hours < 18;
		this.rounds = await this.db.getCurrentRounds();
		this.nominations = await this.db.fetchNominations();
	}

	public async nominate(data: Omit<Nomination, "id">) {
		if (this.nominationOpen) {
			await this.db.addNomination(data);
		} else {
			throw new Error("Nominations are closed");
		}
	}

	public async fetchSigner(fid: number) {
		try {
			const signer = await this.db.fetchSigner(fid);

			return signer;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	public async storeSigner(fid: number, data: Signer) {
		await this.db.storeSigner(fid, data);
	}

	public async getCurrentRounds() {
		const currentRound = await this.db.getCurrentRounds();

		return currentRound;
	}

	public async vote(nominationId: string, fid: number, roundId: string) {
		const vote = await this.db.recordVote(nominationId, fid, roundId);
		console.log(`Vote received for: ${nominationId} by ${fid}`);

		return vote;
	}

	public async fetchNominations() {
		try {
			const nominations = await this.db.fetchNominations();

			return nominations;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	public async fetchNominationsByFid(fid: number) {
		try {
			const nomination = await this.db.fetchNominationsByFid(fid);

			return nomination;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	public async fetchNominationById(id: string) {
		try {
			const nomination = await this.db.fetchNominationById(id);

			return nomination;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}
	public async fetchNominationsByRound(roundId: string) {
		const currentRound = await this.db.fetchNominationsByRound(roundId);

		return currentRound;
	}

	public async getVoteResults(fid: number, roundId: string) {
		try {
			const votes = await this.db.getVotingResults(fid, roundId);

			return votes;
		} catch (error) {
			throw new Error(`${error}`);
		}
	}

	public async verifyCastURL(url: string): Promise<boolean> {
		try {
			await client.lookUpCastByHashOrWarpcastUrl(url, "url");
			return true;
		} catch (error) {
			return false;
		}
	}
}
