/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../ui";
import { firstRun } from "./helpers";
import { votingSystem } from "./client";
import { client, verifyCastURL } from "./fetch";
import { Nomination } from "./votingSystem/types";
import { timeFormattedNomination, timeFormattedVoting } from "./timeFormat";
import { createNomination } from "./votingSystem/nomination";

interface State {
	selectedCast: number;
	didNominate: boolean;
	totalDegen: number;
	dollarValue: string;
	castIdFid: number;
	isPowerBadgeUser: boolean;
	nominationsToVote: Nomination[];
}

const app = new Frog<{ State: State }>({
	initialState: {
		selectedCast: 0,
		totalDegen: 0,
		dollarValue: "0",
		castIdFid: 0,
		isPowerBadgeUser: false,
		nominationsToVote: []
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
			false && (
				<Button
					key={"autosubscribe"}
					action="/autosubscribe"
					value="autosubscribe"
				>
					Autosubscribe
				</Button>
			)
		]
	});
});

app.frame("/status", async (c) => {
	const { frameData, deriveState } = c;

	const fid = frameData?.fid ?? 0;

	const response = await client.fetchBulkUsers([fid]);
	const isPowerBadgeUser = response.users[0].power_badge || fid === 203666;

	const round = await votingSystem.getCurrentRounds();
	const votingRound = round.find((r) => {
		return r.status === "voting";
	});

	const nominationRound = round.find((r) => {
		return r.status === "nominating";
	});

	const isNominationRound = votingSystem.nominationOpen;
	const _nominations = await votingSystem.fetchNominationsByRound(
		nominationRound?.id ?? votingRound?.id ?? ""
	);
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
							Nominations are live now (R{nominationRound!.roundNumber})
						</h1>
						<h1
							style={{
								fontSize: "2rem",
								marginTop: -40,
								color: "#30E000",
								opacity: 0.8
							}}
						>
							Voting for R{nominationRound!.roundNumber} starts in{" "}
							{timeFormattedVoting()}
						</h1>
						<h1
							style={{
								fontSize: "3rem",
								marginTop: -16,
								color: "#30E000"
							}}
						>
							Voting is live now (R{votingRound?.roundNumber ?? 10})
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
			false && (
				<Button
					key={"autosubscribe"}
					action="/autosubscribe"
					value="autosubscribe"
				>
					Autosubscribe
				</Button>
			)
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

	const state2 = deriveState(() => {});
	const _nominations = async () => {
		if (state2.nominationsToVote.length > 0) {
			return state2.nominationsToVote;
		} else {
			if (roundId) {
				return await votingSystem.fetchNominationsByRound(roundId);
			} else {
				return [];
			}
		}
	};
	const nominations = await _nominations();

	const fid = frameData?.fid || 0;
	const vote = await votingSystem.getVoteResults(fid, roundId || "");
	console.warn(vote, "here");
	const theVotedNomination = await votingSystem.fetchNominationById(
		vote?.nominationId ?? ""
	);
	const castId =
		theVotedNomination.length > 0 ? theVotedNomination[0].castId : "";
	const username =
		theVotedNomination.length > 0 ? theVotedNomination[0].username : "";

	const responseFetchCast = await client.lookUpCastByHashOrWarpcastUrl(
		`https://warpcast.com/${username}/${castId}`,
		"url"
	);
	const castText = responseFetchCast.cast.text;

	let hasUserVoted = vote ? true : false;

	const state = deriveState((previousState) => {
		previousState.nominationsToVote = nominations;
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

	const { formatted: nominationsWithVotes } = formattedNominations(nominations);

	if (buttonValue === "finalVote") {
		try {
			await votingSystem.vote(
				nominations[state.selectedCast].id,
				fid,
				roundId || ""
			);
			hasUserVoted = true;
		} catch (e) {
			hasUserVoted = false;
		}
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
					🎩 TOTH - Vote (R{roundNumber}) 🎩
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
						{theVotedNomination && (
							<h1
								style={{
									color: "#30E000",
									fontFamily: "Open Sans",
									fontSize: "3rem",
									justifyContent: "center"
								}}
							>
								You voted for @{theVotedNomination[0].username ?? ""}
							</h1>
						)}
						<h1
							style={{
								color: "white",
								fontFamily: "Open Sans",
								fontSize: "2rem"
							}}
						>
							{castText}
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
					nominations.length > 0 && (
						<Button.Redirect key={"redirect-to-cast"} location={selectedCast}>
							View selected cast
						</Button.Redirect>
					),
					state.selectedCast > 0 && (
						<Button key={"prevCast"} action="/vote" value="prevCast">
							↑
						</Button>
					),
					state.selectedCast < nominations.length - 1 && (
						<Button key={"nextCast"} action="/vote" value="nextCast">
							↓
						</Button>
					)
				]
			: [
					<Button key={"status"} action="/status" value="status">
						Status
					</Button>
				]
	});
});

app.frame("/nominate", async (c) => {
	const { frameData, inputText, deriveState, buttonValue } = c;

	const fid = frameData?.fid ?? 0;

	// fetch the current nominating round
	const rounds = await votingSystem.getCurrentRounds();
	const currentRound = rounds.find((r) => r.status === "nominating");

	// sanitise input and check cast input URL
	const castURL = inputText ? (inputText.length > 0 ? inputText : "") : "";
	const isValidCast = await verifyCastURL(castURL);

	// fetching one nomination for the day
	let userNomination = await votingSystem.fetchNominationsByFid(fid);
	const state = deriveState((previousState) => {
		previousState.didNominate = userNomination?.length > 0 ?? false;
	});

	const regex = /https:\/\/warpcast\.com\/([^/]+)\/([^/]+)/;
	const match = inputText?.match(regex);

	userNomination = await createNomination(
		isValidCast,
		match,
		fid,
		state.isPowerBadgeUser,
		currentRound!
	);

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
							You nominated{" "}
							{userNomination.length > 0 ? userNomination[0].username : ""}
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
			<Button key={"back"} action="/status" value="back">
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
