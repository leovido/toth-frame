import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { castNetworth } from "./fetch";
import { getSignedKey } from "@/utils/getSignedKey";
import { votingSystem } from "./client";

export const firstRun = async (castId: string, forceRefresh: boolean) => {
	const willRun = forceRefresh && process.env.CONFIG === "DEV";
	const items = willRun
		? await castNetworth(castId).catch((e) => {
				console.error(`client items error: ${e}`);

				throw new Error(`client items error: ${e}`);
			})
		: {
				totalAmountFormatted: "100",
				totalAmount: 100,
				dollarValue: "$111.11",
				topThree: [
					{
						username: "test",
						amount: 100000
					},
					{
						username: "test",
						amount: 33334
					},
					{
						username: "test",
						amount: 31242
					}
				],
				isBoosted: true,
				castIdFid: 1
			};

	return {
		totalAmount: items.totalAmount,
		totalAmountFormatted: items.totalAmountFormatted,
		dollarValue: items.dollarValue,
		topThree: items.topThree,
		isBoosted: items.isBoosted,
		castIdFid: items.castIdFid
	};
};

export const createAndStoreSigner: (
	fid: number
) => Promise<Signer | undefined> = async (fid: number) => {
	try {
		const response = await getSignedKey();
		votingSystem.storeSigner(fid, response);

		return response;
	} catch (error) {
		console.error("API Call failed", error);
	}
};
