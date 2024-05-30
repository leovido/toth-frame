import { votingSystem } from "./nominationAndVotingSystem";
import { Round } from "./types";

export async function createNomination(
	isValidCast: boolean,
	match: RegExpMatchArray | null | undefined,
	fid: number,
	isPowerBadgeUser: boolean,
	currentRound: Round | undefined
) {
	if (isValidCast && match) {
		const now = new Date();
		const hours = now.getUTCHours();
		const nominationEndTime = currentRound
			? new Date(currentRound.nominationEndTime)
			: now;

		const nominationEndHours = nominationEndTime.getUTCHours();

		if (hours < nominationEndHours) {
			const today = new Date().toISOString();
			const nomination = {
				username: match[1],
				castId: match[2],
				fid: fid,
				createdAt: today,
				weight: isPowerBadgeUser ? 3 : 1,
				roundId: currentRound ? currentRound.id : ""
			};
			try {
				await votingSystem.nominate(nomination);
				const newUserNomination = await votingSystem.fetchNominationsByFid(fid);

				return newUserNomination;
			} catch (e) {
				console.error(e);
				return [];
			}
		} else {
			return [];
		}
	} else {
		return [];
	}
}
