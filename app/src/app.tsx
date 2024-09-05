import { Frog } from "frog";
import { Nomination } from "../toth/[[...routes]]/votingSystem/types";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { vars } from "./ui";

interface State {
	fcUser?: Signer;
	stateInfo: number;
	selectedCast: number;
	didNominate: boolean;
	totalDegen: number;
	dollarValue: string;
	castIdFid: number;
	nominationsToVote: Nomination[];
}

export const app = new Frog<{ State: State }>({
	verify: process.env.NEXT_PUBLIC_CONFIG === "production" || "silent",
	initialState: {
		stateInfo: 0,
		selectedCast: 0,
		totalDegen: 0,
		dollarValue: "0",
		castIdFid: 0,
		nominationsToVote: []
	},
	assetsPath: "/",
	basePath: "/toth",
	ui: { vars },
	title: "🎩 Tip O' The Hat 🎩",
	imageOptions: {
		fonts: [
			{
				name: "Space Mono",
				source: "google",
				weight: 700
			},
			{
				name: "Ubuntu",
				source: "google"
			},
			{
				name: "Space Mono",
				source: "google",
				weight: 400
			},
			{
				name: "DM Serif Display",
				source: "google"
			}
		]
	},
	hub: {
		apiUrl: "https://hubs.airstack.xyz",
		fetchOptions: {
			headers: {
				"x-airstack-hubs": process.env.AIRSTACK_API_KEY || ""
			}
		}
	}
});
