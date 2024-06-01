import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { castNetworth, client } from "./client";
import { getSignedKey } from "@/utils/getSignedKey";
import { votingSystem } from "./votingSystem/nominationAndVotingSystem";

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

export const createAndStoreSignerDB: (
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

export async function fetchOrCreateAndVerifySigner(fid: number) {
	try {
		const existingSigner = await votingSystem.fetchSigner(fid);

		const signer = existingSigner
			? await client.lookupDeveloperManagedSigner(existingSigner.public_key)
			: undefined;

		if (signer === undefined) {
			return undefined;
		} else {
			return {
				...signer,
				signer_uuid: existingSigner?.signer_uuid ?? ""
			};
		}
	} catch (error) {
		console.error("Error fetching, creating, or verifying signer:", error);
		// Handle error appropriately, e.g., return a default value or rethrow
		throw error; // or return { signer: null, signerVerificationStatus: null };
	}
}
