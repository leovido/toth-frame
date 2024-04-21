/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../ui";
import { firstRun } from "./helpers";
import { votingSystem } from "./client";
import { client } from "./fetch";

interface State {
	didNominate: boolean;
	isVotingOpen: boolean;
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
			<Button key={"status"} action="/status" value="status">
				Status
			</Button>
		]
	});
});

const calculateNominations = (isNominationOpen: boolean) => {
	if (!isNominationOpen) {
		return [];
	}
	const entryMap = new Map();

	for (const entry of votingSystem.nominations) {
		if (entryMap.has(entry.castId)) {
			const existingEntry = entryMap.get(entry.castId);
			entryMap.set(entry.castId, { ...entry, count: existingEntry.count + 1 });
		} else {
			entryMap.set(entry.castId, { ...entry, count: 1 });
		}
	}

	const nominations = Array.from(entryMap.values())
		.sort((a, b) => b.count - a.count)
		.map(
			(item, index) =>
				`${index + 1}. ${item.user} - ${item.castId} - ${item.count}`
		);

	return nominations;
};

app.frame("/status", async (c) => {
	const isNominationRound = votingSystem.nominationOpen;
	const isVotingOpen = votingSystem.votingOpen;
	const nominations = calculateNominations(isNominationRound);

	const shouldShowNominationMessage =
		nominations.length === 0 && isNominationRound;

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
					🎩 TOTH - Status 🎩
				</h1>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						color: "#30E000",
						justifyContent: "center"
					}}
				>
					{nominations.map((value, index) => (
						<div
							key={`${value}-${index}`}
							style={{
								display: "flex",
								flexDirection: "row",
								color: "#30E000",
								justifyContent: "space-around",
								fontSize: "1.1rem"
							}}
						>
							<h1 style={{ color: "white", fontFamily: "Open Sans" }}>
								{value}
							</h1>
						</div>
					))}
					{shouldShowNominationMessage && (
						<div style={{ display: "flex", flexDirection: "column" }}>
							<h1>Nominations start at 12AM UTC</h1>
						</div>
					)}
					{isVotingOpen && (
						<div style={{ display: "flex", flexDirection: "column" }}>
							<h1 style={{ fontSize: "3rem" }}>
								Voting started. Place your votes
							</h1>
						</div>
					)}
				</div>
			</div>
		),
		intents: [
			isNominationRound && (
				<Button key={"nominate"} action="/nominate" value="nominate">
					Nominate
				</Button>
			),
			isVotingOpen && (
				<Button key={"vote"} action="/vote" value="vote">
					Vote
				</Button>
			),
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

const generateNominateIntents = (
	didNominate: boolean,
	isVotingOpen: boolean
) => {
	if (didNominate) {
		return [
			<Button key={"start"} action="/" value="start">
				Start
			</Button>,
			isVotingOpen && (
				<Button key={"vote"} action="/vote" value="vote">
					Vote
				</Button>
			),
			<Button key={"history"} action="/history" value="history">
				History
			</Button>
		];
	} else {
		return [
			<TextInput key={"text-input"} placeholder="sum/0x8f3e2c44" />,
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
	const { frameData, inputText, deriveState, buttonValue } = c;

	const fid = frameData?.fid || 0;
	const today = new Date();
	const hours = today.getUTCHours();

	const url = "https://warpcast.com";
	const castURL = () => {
		if (inputText) {
			return inputText.length > 0 ? `${url}/${inputText}` : "";
		} else {
			return "";
		}
	};

	let isValidCast: boolean = true;
	await client.lookUpCastByHashOrWarpcastUrl(castURL(), "url").catch((e) => {
		console.error(e);
		isValidCast = false || buttonValue === "nominate";
	});

	const nominationInput = inputText?.split("/") || [];

	if (isValidCast && nominationInput.length === 2) {
		if (hours < 18) {
			votingSystem.nominate({
				user: nominationInput[0],
				castId: nominationInput[1],
				fid: frameData?.fid || 0
			});
		}
	}

	const userNomination = votingSystem.nominations.find(
		(nom) => nom.fid === fid
	);
	console.warn(votingSystem.nominations, "nominations");
	console.warn(userNomination, "userNomination");

	// const response = await client.fetchBulkUsers([frameData?.fid || 0]);

	// Power badge is indeed in the Users object.
	// const isPowerBadgeUser: boolean = response.users[0].power_badge;
	const isPowerBadgeUser: boolean = true;

	const state = deriveState((previousState) => {
		previousState.didNominate = userNomination !== undefined;
		previousState.isVotingOpen = votingSystem.votingOpen;
		previousState.isPowerBadgeUser = isPowerBadgeUser;
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

				{!isValidCast && (
					<h1 style={{ color: "red" }}>Invalid cast, try again</h1>
				)}

				{!state.didNominate && (
					<div style={{ display: "flex", flexDirection: "column" }}>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							1. Welcome! To nominate, you must be a power badge user
						</h2>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							2. Paste the cast you would like to nominate.
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
						<h2
							style={{ fontSize: "3.5rem", color: "#D6FFF6", fontWeight: 400 }}
						>
							You nominated {userNomination?.user}
						</h2>
						{/* TODO: add dynamic message below based on times to nominate and voting */}
						<h2
							style={{ fontSize: "3.5rem", color: "#D6FFF6", fontWeight: 400 }}
						>
							Voting starts every day at 6PM UTC
						</h2>
					</div>
				)}
			</div>
		),
		intents: generateNominateIntents(state.didNominate, state.isVotingOpen)
	});
});

app.frame("/check", async (c) => {
	const { buttonValue, frameData, deriveState, verified } = c;
	const forceRefresh = buttonValue === "check";

	// const isDevEnvironment = process.env.CONFIG === "DEV";

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
