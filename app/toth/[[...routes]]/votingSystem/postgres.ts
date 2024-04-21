import { Pool } from "pg";
import { IDatabaseService } from "./voting";

export class PostgresService implements IDatabaseService {
	private db: Pool;

	constructor(dbConfig: Pool) {
		this.db = dbConfig;
	}

	async openNominations(): Promise<void> {
		console.log("Nominations have opened.");
	}

	async checkNominations(): Promise<boolean> {
		const result = await this.db.query(
			"SELECT COUNT(*) FROM nominations WHERE nomination_date >= NOW() - INTERVAL '18 HOURS'"
		);
		return parseInt(result.rows[0].count) > 0;
	}

	async openVoting(): Promise<void> {
		console.log("Voting has started.");
	}

	async closeVoting(): Promise<void> {
		console.log("Voting has ended.");
	}

	async addNomination(user: string, castId: string): Promise<void> {
		const sql =
			"INSERT INTO nominations(user, cast_id, nomination_date) VALUES($1, $2, NOW())";
		await this.db.query(sql, [user, castId]);
	}

	async recordVote(castId: string): Promise<void> {
		const selectSql = "SELECT votes FROM votes WHERE cast_id = $1";
		const result = await this.db.query(selectSql, [castId]);

		if (result.rows.length > 0) {
			const updateSql = "UPDATE votes SET votes = votes + 1 WHERE cast_id = $1";
			await this.db.query(updateSql, [castId]);
		} else {
			const insertSql =
				"INSERT INTO votes(cast_id, votes, vote_date) VALUES($1, 1, NOW())";
			await this.db.query(insertSql, [castId]);
		}
	}

	async getVotingResults(): Promise<unknown[]> {
		const { rows } = await this.db.query(
			"SELECT cast_id, votes FROM votes ORDER BY votes DESC"
		);
		return rows;
	}
}
