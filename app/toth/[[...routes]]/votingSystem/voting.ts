import { Pool } from "pg";

type Cast = {
	user: string;
	castId: string;
};

class NominationAndVotingSystem {
	private db: Pool;
	private nominationOpen: boolean = false;
	private votingOpen: boolean = false;

	constructor(dbConfig: Pool) {
		this.db = dbConfig;
		this.scheduleEvents();
	}

	private scheduleEvents(): void {
		setInterval(() => {
			const now = new Date();
			const hours = now.getHours();

			if (hours > 0 && hours < 18) {
				// Start nominations at midnight
				this.startNominations();
			}
			if (hours >= 18) {
				// Start voting at 6pm if there are nominations
				this.checkNominationsAndStartVoting();
			}
			if (hours === 24) {
				// End voting 24 hours after it starts
				this.endVoting();
			}
		}, 3600000); // Check every hour
	}

	private startNominations(): void {
		this.nominationOpen = true;
		console.log("Nominations have opened.");
	}

	private async checkNominationsAndStartVoting(): Promise<void> {
		const result = await this.db.query(
			"SELECT COUNT(*) FROM nominations WHERE nomination_date >= NOW() - INTERVAL '1 DAY'"
		);
		if (parseInt(result.rows[0].count) > 0) {
			this.startVoting();
		}
	}

	private startVoting(): void {
		this.votingOpen = true;
		console.log("Voting has started.");
	}

	private endVoting(): void {
		this.votingOpen = false;
		this.displayResults();
		console.log("Voting has ended.");
	}

	public async nominate(cast: Cast): Promise<void> {
		if (this.nominationOpen) {
			const sql =
				"INSERT INTO nominations(user, cast_id, nomination_date) VALUES($1, $2, NOW())";
			await this.db.query(sql, [cast.user, cast.castId]);
			console.log(`Nomination received for: ${cast.user}/${cast.castId}`);
		} else {
			console.log("Nominations are closed.");
		}
	}

	public async vote(castId: string): Promise<void> {
		if (this.votingOpen) {
			const selectSql = "SELECT votes FROM votes WHERE cast_id = $1";
			const result = await this.db.query(selectSql, [castId]);

			if (result.rows.length > 0) {
				const updateSql =
					"UPDATE votes SET votes = votes + 1 WHERE cast_id = $1";
				await this.db.query(updateSql, [castId]);
			} else {
				const insertSql =
					"INSERT INTO votes(cast_id, votes, vote_date) VALUES($1, 1, NOW())";
				await this.db.query(insertSql, [castId]);
			}
			console.log(`Vote received for: ${castId}`);
		} else {
			console.log("Voting is closed.");
		}
	}

	private async displayResults(): Promise<void> {
		const { rows } = await this.db.query(
			"SELECT cast_id, votes FROM votes ORDER BY votes DESC"
		);
		console.log("Voting Results:");
		console.log(rows);
	}
}

// Example usage
const pool = new Pool({
	user: "yourUsername",
	host: "localhost",
	database: "yourDatabaseName",
	password: "yourPassword",
	port: 5432
});

const system = new NominationAndVotingSystem(pool);
