import {
	type CastParentAuthorAllOf,
	type CastWithInteractions
} from "@neynar/nodejs-sdk/build/neynar-api/v1";

export interface CastWithTimestamp {
	author: CastParentAuthorAllOf;
	text: string;
	timestamp: string;
}

export const isWithinTimeRange = (
	today: Date = new Date(),
	timestamp: string
) => {
	const date = new Date(timestamp);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const hours = today.getUTCHours().toString().padStart(2, "0");
	const minutes = today.getUTCMinutes().toString().padStart(2, "0");
	const formattedTime = `${hours}${minutes}`;
	const deadlineNumber = Number(formattedTime);

	if (deadlineNumber < 735) {
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setUTCHours(7, 35, 0, 0);

		const todayEnd = new Date(today);
		todayEnd.setUTCHours(7, 34, 59, 999);

		return date >= yesterday && date <= todayEnd;
	} else {
		const todayStart = new Date(today);
		todayStart.setUTCHours(7, 35, 0, 0);

		const todayEnd = new Date(tomorrow);
		todayEnd.setUTCHours(7, 34, 59, 999);

		const isTodayInRange = date >= todayStart && date <= todayEnd;
		const nextDayStart = new Date(tomorrow);
		nextDayStart.setUTCHours(0, 0, 0, 0);
		const nextDayEnd = new Date(tomorrow);
		nextDayEnd.setUTCHours(7, 34, 59, 999);
		const isNextDayInRange = date >= nextDayStart && date <= nextDayEnd;

		return isTodayInRange || isNextDayInRange;
	}
};

export const isWithinTimeRangeLP = (
	today: Date = new Date(),
	timestamp: string
) => {
	const date = new Date(timestamp);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const hours = today.getUTCHours().toString().padStart(2, "0");
	const minutes = today.getUTCMinutes().toString().padStart(2, "0");
	const formattedTime = `${hours}${minutes}`;
	const deadlineNumber = Number(formattedTime);

	if (deadlineNumber < 430) {
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setUTCHours(4, 30, 0, 0);

		const todayEnd = new Date();
		todayEnd.setUTCHours(4, 29, 59, 999);

		return date >= yesterday && date <= todayEnd;
	} else {
		const todayStart = new Date(today);
		todayStart.setUTCHours(4, 30, 0, 0);

		const todayEnd = new Date(tomorrow);
		todayEnd.setUTCHours(4, 29, 59, 999);

		const isTodayInRange = date >= todayStart && date <= todayEnd;
		const nextDayStart = new Date(tomorrow);
		nextDayStart.setUTCHours(0, 0, 0, 0);
		const nextDayEnd = new Date(tomorrow);
		nextDayEnd.setUTCHours(4, 29, 59, 999);
		const isNextDayInRange = date >= nextDayStart && date <= nextDayEnd;

		return isTodayInRange || isNextDayInRange;
	}
};

export function findMatches(text: string) {
	const pattern = /(🍖+)(?:\s*x\s*(\d+))?/;

	const matches = text.match(pattern);

	if (matches) {
		// Extract the matched emoji group
		const emojis = matches[1];
		// Extract the number if present; it'll be `undefined` if not
		const number = matches[2];

		return [emojis, number]; // Returns the format [emojis, 'number'] or [emojis, undefined]
	}
	return []; // Return an empty array if no match is found
}
export const calculateHamAmount = (text: string) => {
	const pattern = /(🍖+)(?:\s*x\s*(\d+))?/;
	const match = text.match(pattern);

	if (match !== null) {
		if (match[1]) {
			const amount: number = Array(match[1]).reduce((acc, item) => {
				if (item === "🍖") {
					return acc + 1;
				} else {
					return acc;
				}
			}, 0);

			if (match[2]) {
				const hamMultiplier = Number(match[2]);
				const totalMultiplied = hamMultiplier * 10;

				return totalMultiplied + amount - 1;
			} else {
				return amount;
			}
		}
	}
};

export const castWithTimeFormatting = (
	cast: CastWithInteractions
): CastWithTimestamp => {
	const castDate = new Date(cast.timestamp);
	const hours = castDate.getUTCHours();
	const minutes = castDate.getUTCMinutes();

	const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

	return {
		author: cast.parentAuthor,
		text: cast.text,
		timestamp: `${formattedTime}`
	};
};
