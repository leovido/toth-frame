import { neynarClient } from "@/app/client";
import { castWithTimeFormatting, isWithinTimeRange } from "@/app/helper";

export interface FCUser {
	username: string;
	degenValue?: string;
	timestamp: string;
}

export const client = async (fid: number, date: Date) => {
	if (process.env.CONFIG === "DEV") {
		console.log("making a request...");
	}
	const allCasts = await neynarClient.fetchAllCastsCreatedByUser(fid, {
		limit: 100
	});
	const filteredCasts = allCasts.result.casts
		.filter((cast) => {
			return isWithinTimeRange(date, cast.timestamp);
		})
		.map((cast) => castWithTimeFormatting(cast))
		.map((cast) => {
			const pattern = /\b\d+ \$DEGEN\b/;
			const match = cast.text.match(pattern);

			if (match !== null) {
				return {
					degenValue: match[0] || "",
					author: cast.author.fid || "",
					timestamp: cast.timestamp
				};
			}
		})
		.filter((value) => {
			return value !== undefined;
		})
		.map(async (value) => {
			if (value) {
				const response = await neynarClient.fetchBulkUsers([
					Number(value.author)
				]);

				const user = response.users.find((user) => {
					return user.username;
				});

				const val: FCUser = {
					username: user?.username || "",
					degenValue: value?.degenValue,
					timestamp: value?.timestamp
				};

				return val;
			}
		})
		.map(async (user) => {
			const u: FCUser | undefined = await user;

			return u;
		});

	const requestUser = await Promise.all(filteredCasts);

	return requestUser;
};
