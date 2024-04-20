// fetch_cast_info.js

// Import necessary modules from the Neynar Node.js SDK
import { NeynarAPIClient, CastParamType } from "@neynar/nodejs-sdk";
import { CastWorthModel, DegenCast } from "./types";
import { channelMap } from "./boostedChannels";

// Initialize Neynar API client with your API key
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");

// Function to fetch cast information from a Warpcast URL
async function fetchCastInfo(warpcastUrl: string) {
	try {
		// Fetch the cast information from the Warpcast URL
		return await client.lookUpCastByHashOrWarpcastUrl(
			warpcastUrl,
			CastParamType.Url
		);
	} catch (error) {
		// Handle any errors
		console.error("Error fetching cast information:", error);
		throw error;
	}
}

// Modified function to fetch all casts in a thread using thread hash
async function fetchAllCastsInThread(threadHash: string) {
	const apiKey = process.env.NEYNAR_API_KEY; // Use your actual API key
	const url = `https://api.neynar.com/v1/farcaster/all-casts-in-thread?threadHash=${threadHash}&api_key=${apiKey}`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			throw new Error(
				`Error fetching all casts in thread: ${response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching all casts in thread:", error);
		throw error;
	}
}

export const castNetworth = async (
	warpcastURL: string
): Promise<CastWorthModel> => {
	try {
		// Fetch cast information from the provided Warpcast URL
		const castInfo = await fetchCastInfo(warpcastURL);

		const castIdFid = castInfo.cast.author.fid;
		const channelURL = castInfo.cast.parent_url || "";
		const multiplier = channelMap.get(channelURL) !== undefined ? 1.5 : 1;

		// Fetch all casts in the thread using the thread hash
		const allCastsInThread = await fetchAllCastsInThread(
			castInfo.cast.thread_hash || ""
		);

		// Filter and process casts that mention an amount of $DEGEN
		const degenCasts: DegenCast[] = allCastsInThread.result.casts
			.filter(
				(cast) => /(\d+)\s*\$degen/i.test(cast.text) // Regular expression to match the pattern
			)
			.map((cast) => {
				const match = cast.text.match(/(\d+)\s*\$degen/i); // Extract the amount

				if (match !== null) {
					return {
						username: cast.author.username, // Extract the username
						amount: parseInt(match[1], 10) // Extract the matched amount and convert to integer
					};
				}
			});

		const topThree = degenCasts.sort((a, b) => b.amount - a.amount).slice(0, 3);

		// Calculate the total amount of $DEGEN
		const totalAmount: number =
			degenCasts.reduce((acc, cast) => acc + cast.amount, 0) * multiplier;

		const totalAmountFormatted = totalAmount.toLocaleString("en-US");

		// TODO: make this dynamic to fetch real-time market value
		const unitPrice = 0.034;
		const dollarValue = totalAmount * unitPrice;

		// Print the total amount and its dollar value
		console.log(`Total $DEGEN amount: ${totalAmount}`);
		console.log(`Dollar value today: $${dollarValue.toFixed(2)}`);

		return {
			totalAmount,
			totalAmountFormatted,
			dollarValue: dollarValue.toFixed(2),
			topThree,
			isBoosted: multiplier === 1.5,
			castIdFid
		};
	} catch (error) {
		console.error("An error occurred:", error);

		return {
			totalAmount: 0,
			totalAmountFormatted: "0",
			dollarValue: "$0.00",
			topThree: [],
			isBoosted: false,
			castIdFid: 1
		};
	}
};
