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
import { Nomination } from "./votingSystem/types";
import { timeFormattedNomination, timeFormattedVoting } from "./timeFormat";

interface State {
	selectedCast: number;
	didNominate: boolean;
	totalDegen: number;
	dollarValue: string;
	castIdFid: number;
	isPowerBadgeUser: boolean;
}

const app = new Frog<{ State: State }>({
	initialState: {
		selectedCast: 0,
		totalDegen: 0,
		dollarValue: "0",
		castIdFid: 0,
		isPowerBadgeUser: false
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

app.frame("/leaderboard", async (c) => {
	const nominations = await votingSystem.nominations;

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
					🎩 TOTH - Winners 🎩
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
								{value.castId}
							</h1>
						</div>
					))}
				</div>
			</div>
		),
		intents: [
			<Button key={"/status"} action="/status" value="status">
				Back
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

app.frame("/status", async (c) => {
	const { frameData, deriveState } = c;

	const fid = frameData?.fid ?? 0;

	const response = await client.fetchBulkUsers([fid]);
	const isPowerBadgeUser = response.users[0].power_badge;

	const round = await votingSystem.getCurrentRounds();
	const currentRound = round.find((r) => {
		return r.status === "nominating" || r.status === "voting";
	});

	const isNominationRound = votingSystem.nominationOpen;
	const _nominations = await votingSystem.nominations;
	const { formattedNominations: nominations } =
		calculateNominations(_nominations);

	const userNomination = _nominations.find((nom) => nom.fid === fid);

	const state = deriveState((previousState) => {
		previousState.didNominate = userNomination !== undefined;
		previousState.isPowerBadgeUser = isPowerBadgeUser;
	});

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
					justifyContent: "space-between",
					flexWrap: "nowrap",
					height: "100vh",
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
						justifySelf: "center",
						alignItems: "center"
					}}
				>
					{!isNominationRound && (
						<h1
							style={{
								color: "white",
								fontFamily: "Open Sans"
							}}
						>
							Nominations will start in {timeFormattedNomination()}
						</h1>
					)}

					{nominations.map((value, index) => (
						<div
							key={`${value}-${index}`}
							style={{
								display: "flex",
								flexDirection: "row",
								color: "#30E000",
								fontSize: "1.1rem",
								height: 60
							}}
						>
							<h1
								style={{
									color: "white",
									fontFamily: "Open Sans"
								}}
							>
								{value}
							</h1>
						</div>
					))}
					{shouldShowNominationMessage && (
						<div style={{ display: "flex", flexDirection: "column" }}>
							<h1 style={{ color: "white" }}>No nominations</h1>
						</div>
					)}
				</div>
				{isNominationRound && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							color: "#30E000",
							justifyContent: "flex-end",
							alignItems: "center"
						}}
					>
						<h1 style={{ fontSize: "3.5rem", marginTop: 24 }}>
							Nominations are live now
						</h1>
						<h1
							style={{
								fontSize: "2rem",
								marginTop: -16,
								color: "#30E000"
							}}
						>
							Round {currentRound?.roundNumber ?? 10} / Voting starts in{" "}
							{timeFormattedVoting()}
						</h1>
					</div>
				)}
			</div>
		),
		intents: [
			isNominationRound && !state.didNominate && (
				<Button key={"nominate"} action="/nominate" value="nominate">
					Nominate
				</Button>
			),
			isPowerBadgeUser && (
				<Button key={"vote"} action="/vote" value="vote">
					Vote
				</Button>
			),
			<Button key={"leaderboard"} action="/leaderboard" value="leaderboard">
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

app.frame("/history", async (c) => {
	const isNominationRound = votingSystem.nominationOpen;
	const nominations = await votingSystem.nominations;

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
					height: "100vh",
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
					🎩 TOTH - History 🎩
				</h1>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						color: "#30E000",
						justifySelf: "center",
						alignItems: "center"
					}}
				>
					{nominations.map((item, index) => (
						<div
							key={`${item}-${index}`}
							style={{
								display: "flex",
								flexDirection: "row",
								color: "#30E000",
								fontSize: "1.1rem"
							}}
						>
							<h1
								style={{
									color: "white",
									fontFamily: "Open Sans"
								}}
							>
								{index + 1}. {item.username} - {item.castId}
							</h1>
						</div>
					))}
				</div>
			</div>
		),
		intents: [
			isNominationRound && (
				<Button key={"back"} action="/status" value="back">
					Back
				</Button>
			)
		]
	});
});

app.frame("/vote", async (c) => {
	const { deriveState, buttonValue, frameData } = c;

	const votingRounds = await votingSystem.getCurrentRounds();
	const roundNumber = votingRounds[0].roundNumber ?? 0;
	const roundId = votingRounds.find((v) => {
		if (v.status === "voting") {
			return v;
		}
	})?.id;

	const nominations = roundId
		? await votingSystem.fetchNominationsByRound(roundId)
		: [];
	const { formatted: nominationsWithVotes } = formattedNominations(nominations);

	const fid = frameData?.fid || 0;
	const vote = await votingSystem.getVoteResults(fid);

	const hasUserVoted = vote ? true : false;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextCast") {
			if (previousState.selectedCast === 4) {
				previousState.selectedCast = 0;
			} else {
				previousState.selectedCast++;
			}
		}
		if (buttonValue === "prevCast") {
			previousState.selectedCast--;
		}
	});

	if (buttonValue === "finalVote") {
		votingSystem.vote(nominations[state.selectedCast].id, fid);
	}

	const selectedCast =
		nominations.length > 0
			? `https://warpcast.com/${nominations[state.selectedCast].username}/${nominations[state.selectedCast].castId}`
			: "";

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
					🎩 TOTH - Vote 🎩
				</h1>
				{hasUserVoted && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							color: "#30E000",
							justifyContent: "center"
						}}
					>
						<h1
							style={{
								color: "#30E000",
								fontFamily: "Open Sans"
							}}
						>
							You voted. Thank you.
						</h1>
					</div>
				)}
				{!hasUserVoted && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							color: "#30E000",
							justifyContent: "center"
						}}
					>
						{nominationsWithVotes.length === 0 && (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center"
								}}
							>
								<h1
									style={{
										color: "white",
										fontFamily: "Open Sans"
									}}
								>
									No nominations in round {roundNumber}
								</h1>
								<h2
									style={{
										fontSize: "3rem",
										color: "#30E000"
									}}
								>
									Voting starts in {timeFormattedVoting()} for next round
								</h2>
							</div>
						)}
						{nominationsWithVotes.map((value, index) => (
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
								<h1
									style={{
										color: state.selectedCast === index ? "#30E000" : "white",
										fontFamily: "Open Sans"
									}}
								>
									{value}
								</h1>
							</div>
						))}
					</div>
				)}
			</div>
		),
		intents: !hasUserVoted
			? [
					nominationsWithVotes.length > 0 && (
						<Button key={"finalVote"} action="/vote" value="finalVote">
							Vote
						</Button>
					),
					nominationsWithVotes.length === 0 && (
						<Button key={"back"} action="/status" value="back">
							Back
						</Button>
					),
					<Button.Redirect key={"redirect-to-cast"} location={selectedCast}>
						View selected cast
					</Button.Redirect>,
					<Button key={"prevCast"} action="/vote" value="prevCast">
						←
					</Button>,
					<Button key={"nextCast"} action="/vote" value="nextCast">
						→
					</Button>
				]
			: [
					<Button key={"start"} action="/" value="start">
						Start
					</Button>
				]
	});
});

app.frame("/nominate", async (c) => {
	const { frameData, inputText, deriveState, buttonValue } = c;

	const fid = frameData?.fid ?? 0;
	const nominations = await votingSystem.fetchNominations();

	const round = await votingSystem.getCurrentRounds();
	const currentRound = round.find((r) => {
		return r.status === "nominating";
	});

	const today = new Date();
	const hours = today.getUTCHours();

	const castURL = () => {
		if (inputText) {
			return inputText.length > 0 ? `${inputText}` : "";
		} else {
			return "";
		}
	};

	let isValidCast: boolean = true;
	castURL() !== "" &&
		(await client.lookUpCastByHashOrWarpcastUrl(castURL(), "url").catch((e) => {
			console.error(e);
			isValidCast = false || buttonValue === "nominate";
		}));

	const userNomination = nominations.find((nom) => nom.fid === fid);

	const state = deriveState((previousState) => {
		previousState.didNominate = userNomination !== undefined;
	});

	const regex = /https:\/\/warpcast\.com\/([^/]+)\/([^/]+)/;
	const match = inputText?.match(regex);

	if (isValidCast && match !== undefined && match !== null) {
		if (hours < 18) {
			const today = new Date().toISOString();
			const nomination = {
				username: match[1],
				castId: match[2],
				fid: fid,
				createdAt: today,
				weight: state.isPowerBadgeUser ? 3 : 1,
				roundId: currentRound ? currentRound.id : ""
			};
			await votingSystem.nominate(nomination);
		}
	}

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

				{!isValidCast && buttonValue === "nominateConfirm" && (
					<h1 style={{ color: "red" }}>Invalid cast, try again</h1>
				)}

				{!state.didNominate && (
					<div style={{ display: "flex", flexDirection: "column" }}>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							1. Welcome! ⚡️ users get 3x points on nomination and normal users
							1x
						</h2>
						<h2 style={{ fontSize: "2rem", color: "#D6FFF6", fontWeight: 400 }}>
							2. Paste the Warpcast URL of the cast you&apos;d like to nominate
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
							style={{
								fontSize: "3.5rem",
								color: "#D6FFF6",
								fontWeight: 400
							}}
						>
							You nominated {userNomination?.username}
						</h2>
						<h2 style={{ fontSize: "3rem", color: "#30E000" }}>
							Voting starts in {timeFormattedVoting()}
						</h2>
					</div>
				)}
			</div>
		),
		intents: generateNominateIntents(state.didNominate, state.isPowerBadgeUser)
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

const generateNominateIntents = (
	didNominate: boolean,
	isPowerBadgeUser: boolean
) => {
	if (didNominate) {
		return [
			<Button key={"back"} action="/status" value="status">
				Back
			</Button>,
			isPowerBadgeUser && (
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
			<TextInput key={"text-input"} placeholder="Warpcast URL of the cast" />,
			<Button key={"nominate"} action="/nominate" value="nominateConfirm">
				Submit
			</Button>,
			<Button key={"back"} action="/" value="back">
				Back
			</Button>
		];
	}
};

const generateIntents = (fid: number, castIdFid: number) => {
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

const calculateNominations = (nominations: Nomination[]) => {
	const formattedNominations = nominations.map(
		(item, index) =>
			`${index + 1}. ${item.username} - ${item.castId} - ${item.weight}`
	);

	return {
		formattedNominations
	};
};

const formattedNominations = (nominations: Nomination[]) => {
	const formatted = nominations.map(
		(item, index) =>
			`${index + 1}. ${item.username} - ${item.castId} - ${item.votesCount}`
	);

	return {
		formatted
	};
};
