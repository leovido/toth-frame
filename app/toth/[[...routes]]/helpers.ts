import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { castNetworth } from "./client";
import { getSignedKey } from "@/utils/getSignedKey";
import { votingSystem } from "./votingSystem/nominationAndVotingSystem";
import axios from "axios";

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
) => Promise<Signer | undefined> = async () => {
	try {
		const response = await getSignedKey();
		votingSystem.storeSigner(response);

		return response;
	} catch (error) {
		console.error("API Call failed", error);
	}
};

export async function fetchSigner(fid: number) {
	try {
		const existingSigner = await votingSystem.fetchSigner(fid);

		return existingSigner;
	} catch (error) {
		console.error("Error fetching, creating, or verifying signer:", error);
		// Handle error appropriately, e.g., return a default value or rethrow
		throw error; // or return { signer: null, signerVerificationStatus: null };
	}
}

export async function createAndVerifySigner() {
	try {
		const response = await axios.post(`${process.env.PUBLIC_URL}/api/signer`);
		const signer = response.data;
		if (response.status === 200) {
			await axios.post(`${process.env.PUBLIC_URL}/api/storeSigner`, {
				signer
			});
			return signer;
		} else {
			return undefined;
		}
	} catch (error) {
		console.error("Error creating, or verifying signer:", error);
		// Handle error appropriately, e.g., return a default value or rethrow
		throw error; // or return { signer: null, signerVerificationStatus: null };
	}
}
