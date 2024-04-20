/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../ui";
import { firstRun } from "./helpers";
import { client } from "./fetch";

interface State {
	didNominate: boolean;
	totalDegen: number;
	dollarValue: string;
	castIdFid: number;
	recipients: { [key: string]: number };
	isPowerBadgeUser: boolean;
}

const generateIntents = (fid: number, castIdFid: number) => {
	console.warn(fid, castIdFid);
	if (fid === castIdFid) {
		return [
			<Button key={"check"} action="/check" value="check">
				Refresh
			</Button>,
			<Button key={"split"} action="/split" value="split">
				Split
			</Button>
		];
	} else {
		return [
			<Button key={"check"} action="/check" value="check">
				Refresh
			</Button>,
			<Button key={"start"} action="/" value="start">
				Start
			</Button>
		];
	}
};

const app = new Frog<{ State: State }>({
	initialState: {
		totalDegen: 0,
		dollarValue: "0",
		castIdFid: 0,
		recipients: []
	},
	assetsPath: "/",
	basePath: "/toth",
	ui: { vars },
	imageOptions: {
		fonts: [
			{
				name: "Space Mono",
				source: "google",
				weight: 700
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

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/", async (c) => {
	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					alignItems: "center",
					background: "#17101F",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					justifyContent: "center",
					textAlign: "center",
					width: "100%"
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "5rem",
						color: "#38BDF8"
					}}
				>
					🎩 Tip O&apos; The Hat 🎩
				</h1>
				<h2 style={{ fontSize: "3rem", color: "#D6FFF6", fontWeight: 400 }}>
					Pool tips, Fund awesomeness
				</h2>
			</div>
		),
		intents: [
			<Button key={"nominate"} action="/nominate" value="nominate">
				Nominate
			</Button>,
			<Button key={"vote"} action="/vote" value="vote">
				Vote
			</Button>,
			<Button key={"winners"} action="/winners" value="winners">
				Leaderboard
			</Button>,
			<Button
				key={"autosubscribe"}
				action="/autosubscribe"
				value="autosubscribe"
			>
				Autosubscribe
			</Button>
		]
	});
});

const generateNominateIntents = (didNominate: boolean) => {
	if (didNominate) {
		return [
			<Button key={"start"} action="/" value="start">
				Start
			</Button>,
			<Button key={"history"} action="/history" value="history">
				History
			</Button>
		];
	} else {
		return [
			<TextInput
				key={"text-input"}
				placeholder="https://warpcast.com/sum/0x8f3e2c44"
			/>,
			<Button key={"nominate"} action="/nominate" value="nominate">
				Submit
			</Button>,
			<Button key={"back"} action="/" value="back">
				Back
			</Button>
		];
	}
};

app.frame("/nominate", async (c) => {
	const { inputText, deriveState, frameData } = c;

	const fetchedDidNominate = false;

	const response = await client.fetchBulkUsers([frameData?.fid || 0]);

	// Power badge is indeed in the Users object.
	const isPowerBadgeUser: boolean = response.users[0].power_badge;

	const state = deriveState((previousState) => {
		previousState.didNominate = fetchedDidNominate;
		previousState.isPowerBadgeUser = isPowerBadgeUser;
	});

	const parts = inputText?.split("warpcast.com/") || [];
	const result = parts[1] ? parts[1] : "";
	console.log(result);

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					alignItems: "center",
					background: "#17101F",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					justifyContent: "center",
					textAlign: "center",
					width: "100%"
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "5rem",
						color: "#38BDF8"
					}}
				>
					🎩 TOTH - Nominate 🎩
				</h1>

				{!state.didNominate && (
					<div style={{ display: "flex", flexDirection: "column" }}>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							1. Welcome! To nominate, you must be a power badge user
						</h2>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							2. Paste the cast you would like to nominate
						</h2>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							3. Earn $DEGEN for nominating 4 times a week
						</h2>
					</div>
				)}
				{state.didNominate && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center"
						}}
					>
						<h2 style={{ fontSize: "4rem", color: "#D6FFF6", fontWeight: 400 }}>
							You nominated @sum
						</h2>
						<h2
							style={{ fontSize: "3.5rem", color: "#D6FFF6", fontWeight: 400 }}
						>
							Voting start in 7h:49m
						</h2>
					</div>
				)}
			</div>
		),
		intents: generateNominateIntents(state.didNominate)
	});
});

app.frame("/check", async (c) => {
	const { buttonValue, frameData, deriveState, verified } = c;
	const forceRefresh = buttonValue === "check";

	const isDevEnvironment = process.env.CONFIG === "DEV";

	if (!verified) {
		console.log(`Frame verification failed for ${frameData?.fid}`);
		return c.res({
			image: (
				<div
					style={{
						fontFamily: "Open Sans",
						alignItems: "center",
						background: "linear-gradient(to right, #231651, #17101F)",
						backgroundSize: "100% 100%",
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						height: "100%",
						justifyContent: "center",
						textAlign: "center",
						width: "100%"
					}}
				>
					<p
						style={{
							fontFamily: "Open Sans",
							fontWeight: 700,
							fontSize: 45,
							color: "#D6FFF6"
						}}
					>
						Something went wrong
					</p>
				</div>
			),
			intents: [
				<Button key={"restart"} action="/">
					Restart
				</Button>
			]
		});
	}

	const castId = "https://warpcast.com/rjs/0x1f23893b";

	const {
		totalAmount,
		totalAmountFormatted,
		dollarValue,
		topThree,
		isBoosted,
		castIdFid
	} = await firstRun(castId, forceRefresh);

	const state = deriveState((previousState) => {
		previousState.castIdFid = castIdFid;
		switch (buttonValue) {
			case "refresh":
			case "check":
				previousState.totalDegen = totalAmount;
				previousState.dollarValue = dollarValue;
				break;
			default:
				break;
		}
	});

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					alignItems: "center",
					background: "#17101F",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					justifyContent: "space-around"
				}}
			>
				<h1
					style={{
						flex: 1,
						fontFamily: "DM Serif Display",
						fontSize: "5rem",
						color: "#38BDF8"
					}}
				>
					🎩 Tip O&apos; The Hat 🎩
				</h1>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						color: "#30E000",
						justifyContent: "center"
					}}
				>
					{topThree.map((value, index) => (
						<div
							key={value.username}
							style={{
								display: "flex",
								flexDirection: "row",
								color: "#30E000",
								justifyContent: "space-around",
								fontSize: "1.1rem"
							}}
						>
							<h1 style={{ color: "white", fontFamily: "Open Sans" }}>
								{index + 1}. @{value.username}
							</h1>
							<h1 style={{ color: "white", fontFamily: "Open Sans" }}>
								{value.amount.toLocaleString("en-US")} $DEGEN
							</h1>
						</div>
					))}
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							color: "#30E000",
							justifyContent: "space-between"
						}}
					>
						<h1 style={{ fontFamily: "Space Mono", fontSize: "3rem" }}>
							Tipped (so far): {totalAmountFormatted} $DEGEN{" "}
							{isBoosted ? "(1.5x)" : ""}
						</h1>
					</div>
					<h1
						style={{
							fontFamily: "Space Mono",
							fontSize: "3rem",
							marginTop: -8,
							justifyContent: "center"
						}}
					>
						USD value: {Number(dollarValue).toLocaleString("en-US")}
					</h1>
				</div>
			</div>
		),
		intents: generateIntents(frameData?.fid ?? 0, state.castIdFid)
	});
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
