export const timeFormattedVoting = (dateToday: Date = new Date()) => {
	const now = dateToday;
	const hours = now.getUTCHours();

	if (hours >= 0 && hours < 18) {
		const sixPMUTC = new Date();
		sixPMUTC.setUTCHours(18, 0, 0, 0);

		const diffMs = sixPMUTC.getTime() - now.getTime();

		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
			.toString()
			.padStart(2, "0");

		return `${diffHours}h ${diffMinutes}m`;
	} else {
		const nextDaySixPM = new Date();
		nextDaySixPM.setUTCDate(nextDaySixPM.getUTCDate() + 1);
		nextDaySixPM.setUTCHours(18, 0, 0, 0);

		const diffMs = nextDaySixPM.getTime() - now.getTime();

		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
			.toString()
			.padStart(2, "0");

		return `${diffHours}h ${diffMinutes}m`;
	}
};

export const timeFormattedNomination = (dateToday: Date = new Date()) => {
	const now = dateToday;

	if (now.getUTCHours() > 17) {
		const nextMidnightUTC = new Date(
			Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate() + 1,
				0,
				0,
				0
			)
		);

		const diffMs = nextMidnightUTC.getTime() - now.getTime();

		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
			.toString()
			.padStart(2, "0");

		return `${diffHours}h ${diffMinutes}m`;
	} else {
		return "";
	}
};
