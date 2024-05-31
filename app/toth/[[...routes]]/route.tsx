/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../ui";
import {
	createAndStoreSigner,
	fetchOrCreateAndVerifySigner,
	firstRun
} from "./helpers";
import { votingSystem } from "./votingSystem/nominationAndVotingSystem";
import { client, postCast, verifyCastURL } from "./client";
import { Nomination } from "./votingSystem/types";
import { timeFormattedNomination, timeFormattedVoting } from "./timeFormat";
import { createNomination } from "./votingSystem/nomination";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";

interface State {
	fcUser?: Signer;
	stateInfo: number;
	selectedCast: number;
	didNominate: boolean;
	totalDegen: number;
	dollarValue: string;
	castIdFid: number;
	isPowerBadgeUser: boolean;
	nominationsToVote: Nomination[];
}

const bodyTextStyle = {
	fontSize: "1.7rem",
	color: "#D6FFF6",
	fontWeight: 400,
	width: "70%"
};

const app = new Frog<{ State: State }>({
	verify: process.env.CONFIG === "PROD",
	initialState: {
		stateInfo: 0,
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
	imageAspectRatio: "1:1",
	imageOptions: {
		emoji: "blobmoji",
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
					justifyContent: "space-around",
					textAlign: "center",
					width: "100%"
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "3rem",
						color: "#38BDF8"
					}}
				>
					🎩 Tip O&apos; The Hat 🎩
				</h1>
				<h2 style={{ fontSize: "2.2rem", color: "#D6FFF6", fontWeight: 400 }}>
					Pool tips, Fund awesomeness
				</h2>
				<h2
					style={{
						fontSize: "30px",
						fontFamily: "Ubuntu",
						color: "#30E000",
						fontWeight: 400
					}}
				>
					🔵 reward casts 🔵 group impact 🔵
				</h2>
				<h2
					style={{
						fontSize: "30px",
						fontFamily: "Ubuntu",
						color: "#30E000",
						marginTop: -40
					}}
				>
					tip builders+creators
				</h2>
				<h2
					style={{
						fontSize: "30px",
						fontFamily: "Ubuntu",
						color: "#30E000"
					}}
				>
					Status: nominations & votes
				</h2>
				<h2
					style={{
						fontSize: "30px",
						fontFamily: "Ubuntu",
						color: "#30E000",
						marginTop: -40
					}}
				>
					Info: how to guide
				</h2>
				<h2
					style={{
						fontSize: "30px",
						fontFamily: "Ubuntu",
						color: "#30E000",
						marginTop: -16
					}}
				>
					Settings: permissions for TOTH
				</h2>
			</div>
		),
		intents: [
			<Button key={"status"} action="/status" value="status">
				Status
			</Button>,
			<Button key={"information"} action="/information" value="information">
				Information
			</Button>,
			<Button key={"signer"} action="/signer" value="signer">
				Settings
			</Button>
		]
	});
});

app.frame("/infoVotes", async (c) => {
	const { deriveState, buttonValue } = c;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextInfo") {
			previousState.stateInfo++;
		}

		if (buttonValue === "previousInfo") {
			previousState.stateInfo--;
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
					justifyContent: "space-between",
					textAlign: "center",
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "3rem",
						color: "#38BDF8"
					}}
				>
					🎩 TOTH - Voting 🎩
				</h1>
				<h2 style={{ ...bodyTextStyle, justifyContent: "center" }}>
					• Power Badge holders: 1 vote daily
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						marginTop: -70,
						justifyContent: "center"
					}}
				>
					• Vote: 🟢 6PM day b4 🔴 6PM TOTH day
				</h2>
				<h2
					style={{ ...bodyTextStyle, marginTop: -70, justifyContent: "center" }}
				>
					• Vetting: 6PM to 12PM TOTH day
				</h2>
				<h2 style={{ ...bodyTextStyle, justifyContent: "center" }}>
					• Council: OGs, winners, dev team
				</h2>
				<h2
					style={{ ...bodyTextStyle, marginTop: -70, justifyContent: "center" }}
				>
					• Anomaly: Veto&apos;d, TOTH rolls over
				</h2>
				<h2
					style={{ ...bodyTextStyle, marginTop: -70, justifyContent: "center" }}
				>
					• Valid: entire tip to cast creator
				</h2>
			</div>
		),
		intents: generateIntentsInfo(state.stateInfo)
	});
});

app.frame("/lore", async (c) => {
	const { deriveState, buttonValue } = c;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextInfo") {
			previousState.stateInfo = 0;
		}

		if (buttonValue === "previousInfo") {
			previousState.stateInfo--;
		}
	});

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					background: "#17101F",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					textAlign: "center",
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "3rem",
						color: "#38BDF8",
						paddingLeft: 20,
						paddingRight: 20,
						justifyContent: "center"
					}}
				>
					🎩 TOTH - Lore 🎩
				</h1>

				<h2
					style={{
						...bodyTextStyle,
						margin: "auto",
						marginBottom: -20,
						textAlign: "center"
					}}
				>
					-1-
				</h2>

				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					TOTH is built on trust and was first initiated by 0xen as a means to
					encourage and reward experimentation + building on Farcaster
				</h2>

				<h2
					style={{
						...bodyTextStyle,
						margin: "auto",
						marginBottom: -20,
						textAlign: "center"
					}}
				>
					-2-
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					This first version seeks to explore helpful ways to make it easy to do
					so using native FC actions
				</h2>

				<h2
					style={{
						...bodyTextStyle,
						margin: "auto",
						marginBottom: -20,
						textAlign: "center"
					}}
				>
					-3-
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					For feedback, suggestions, and more information please contact the
					doxxed dev
				</h2>
				<h2
					style={{
						fontSize: "2rem",
						color: "#38BDF8",
						fontWeight: 400,
						paddingLeft: 20,
						paddingRight: 20,
						justifyContent: "center",
						marginBottom: -20
					}}
				>
					Team on FC: @leovido.eth | @papa | @tipothehat
				</h2>

				<h2
					style={{
						fontSize: "2rem",
						color: "#30E000",
						fontWeight: 400,
						paddingLeft: 20,
						paddingRight: 20,
						justifyContent: "center"
					}}
				>
					Twitter:@degentoth | Email: degentoth@gmail.com
				</h2>
			</div>
		),
		intents: generateIntentsInfo(state.stateInfo)
	});
});

app.frame("/rewards", async (c) => {
	const { deriveState, buttonValue } = c;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextInfo") {
			previousState.stateInfo++;
		}

		if (buttonValue === "previousInfo") {
			previousState.stateInfo--;
		}
	});

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					background: "#17101F",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					textAlign: "justify",
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "3rem",
						color: "#38BDF8",
						paddingLeft: 20,
						paddingRight: 20,
						justifyContent: "center"
					}}
				>
					🎩 TOTH - Rewards 🎩
				</h1>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					1. 90% of TOTH to cast creator/builder(s)
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					2. 5% of TOTH to power badge holders & vetted council that voted at
					least four times in a week (split between them)
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					3. 5% of TOTH to dev team for ongoing maintenance and improvements
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						paddingLeft: 20,
						paddingRight: 20
					}}
				>
					4. If a TOTH is invalidated by the final council (e.g. a known bot)
					that TOTH reward will be put in a public admin treasury to be
					distributed as a bonus across the next 10 winners
				</h2>
			</div>
		),
		intents: generateIntentsInfo(state.stateInfo)
	});
});

app.frame("/infoNoms", async (c) => {
	const { deriveState, buttonValue } = c;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextInfo") {
			previousState.stateInfo++;
		}

		if (buttonValue === "previousInfo") {
			previousState.stateInfo--;
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
					justifyContent: "space-between",
					textAlign: "center",
					flexWrap: "nowrap",
					height: "100%",
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "2.5rem",
						color: "#38BDF8",
						justifyContent: "center"
					}}
				>
					🎩 TOTH - Nominations 🎩
				</h1>
				<h2
					style={{
						...bodyTextStyle
					}}
				>
					• Insert (copy/paste) a cast hyperlink
				</h2>
				<h2
					style={{
						...bodyTextStyle
					}}
				>
					• Anyone can nominate one cast per day
				</h2>
				<h2
					style={{
						...bodyTextStyle
					}}
				>
					• Power badge holders: 3X nomination power
				</h2>
				<h2
					style={{
						...bodyTextStyle
					}}
				>
					• Top 3 nominations on “status” leaderboard.
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						justifyContent: "center"
					}}
				>
					Nominations 🟢 12am 🔴 6 PM
				</h2>
			</div>
		),
		intents: generateIntentsInfo(state.stateInfo)
	});
});

app.frame("/information", async (c) => {
	const { deriveState, buttonValue } = c;

	const state = deriveState((previousState) => {
		if (buttonValue === "nextInfo") {
			previousState.stateInfo++;
		}

		if (buttonValue === "previousInfo") {
			previousState.stateInfo = 4;
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
					justifyContent: "space-between",
					textAlign: "center",
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20
				}}
			>
				<h1
					style={{
						fontFamily: "Space Mono",
						fontSize: "3rem",
						color: "#38BDF8"
					}}
				>
					🎩 TOTH - Info 🎩
				</h1>
				<h2 style={bodyTextStyle}>Daily grouped tipping on Farcaster</h2>

				<h2 style={bodyTextStyle}>• Nominate the most deserving casts</h2>
				<h2 style={{ ...bodyTextStyle, marginTop: -16 }}>
					• Vote on the most impactful contributions
				</h2>
				<h2
					style={{
						...bodyTextStyle,
						marginTop: -16
					}}
				>
					• Combine individual tips into larger rewards
				</h2>

				<h2
					style={{
						...bodyTextStyle
					}}
				>
					• Celebrate onchain builders & creators
				</h2>
			</div>
		),
		intents: generateIntentsInfo(state.stateInfo)
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

app.frame("/signer", async (c) => {
	const { frameData } = c;

	const fid = frameData?.fid ?? 0;
	const signer = await fetchOrCreateAndVerifySigner(fid);

	signer &&
		(await postCast(
			signer.signer_uuid,
			"Testing something. 1 DEGEN",
			"0xab063bfd"
		).catch((error) => {
			console.error("Error posting cast", error);
		}));

	const statusMessage = () => {
		if (signer) {
			switch (signer.status) {
				case "approved":
					return "Connected";
				case "pending_approval":
					return "Pending";
				case "revoked":
					return "Revoked";
				default:
					break;
			}
		} else {
			return "Disconnected";
		}
	};

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
					justifyContent: "center",
					flexWrap: "nowrap",
					height: "100%",
					textAlign: "center",
					width: "100%"
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column"
					}}
				>
					<h1
						style={{
							fontFamily: "Space Mono",
							fontSize: "5rem",
							color: "#38BDF8",
							justifyContent: "center"
						}}
					>
						🎩 TOTH - Settings 🎩
					</h1>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							color: "#30E000",
							justifyContent: "center",
							paddingLeft: 24,
							paddingRight: 24
						}}
					>
						<h1
							style={{
								fontSize: "2.3rem",
								justifyContent: "center",
								color: "#D6FFF6"
							}}
						>
							Status: {statusMessage()}
						</h1>
						<h1 style={{ fontSize: "2rem" }}>
							TOTH will cast on your behalf to the winner of each round. You can
							cancel in Warpcast settings {">"} Advanced {">"} Manage connected
							apps {">"} Delete @tipothehat
						</h1>
						<h1 style={{ fontSize: "2rem", color: "red" }}>
							You can revoke permissions, but this will delete all casts made
							via TOTH
						</h1>
					</div>
				</div>
			</div>
		),
		intents: [
			<Button key={"back"} action={"/"} value="back">
				Back
			</Button>,
			signer && signer.status === "pending_approval" && (
				<Button.Link key={"confirm"} href={signer.signer_approval_url || ""}>
					Sign in
				</Button.Link>
			)
		]
	});
});

app.frame("/signerVerification", async (c) => {
	const { frameData } = c;

	const fid = frameData?.fid ?? 0;
	const fcUser = await createAndStoreSigner(fid);

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
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center"
					}}
				>
					<h1
						style={{
							fontFamily: "Space Mono",
							fontSize: "5rem",
							color: "#38BDF8"
						}}
					>
						🎩 TOTH - Sign in 🎩
					</h1>
					<div
						style={{
							display: "flex",
							color: "#30E000",
							justifyContent: "center",
							paddingLeft: 24,
							paddingRight: 24
						}}
					>
						<h1 style={{ fontSize: "2rem" }}>
							Click on the Sign in button to connect with TOTH
						</h1>
					</div>
				</div>
			</div>
		),
		intents: [
			<Button key={"signer"} action={"/signer"} value="signer">
				Back
			</Button>,
			<Button.Link key={"confirm"} href={fcUser?.signer_approval_url || ""}>
				Sign in
			</Button.Link>
		]
	});
});

app.frame("/status", async (c) => {
	const { frameData, deriveState, verified } = c;

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
			<Button key={"intro"} action="/" value="intro">
				Intro
			</Button>,
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
			false && (
				<Button key={"leaderboard"} action="/leaderboard" value="leaderboard">
					Leaderboard
				</Button>
			)
		]
	});
});

app.frame("/history", async (c) => {
	const { frameData } = c;

	const fid = frameData?.fid ?? 0;

	const isNominationRound = votingSystem.nominationOpen;
	const nominations = await votingSystem.fetchHistory(fid);

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
					{nominations.length > 0 ? (
						nominations.map((item, index) => (
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
						))
					) : (
						<div style={{ display: "flex", flexDirection: "column" }}>
							<h1
								style={{
									color: "white",
									fontFamily: "Open Sans"
								}}
							>
								You haven&apos;t nominated yet
							</h1>
						</div>
					)}
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
	let theVotedNomination = await votingSystem.fetchNominationById(
		vote?.nominationId ?? ""
	);
	const castId =
		theVotedNomination.length > 0 ? theVotedNomination[0].castId : "";
	const username =
		theVotedNomination.length > 0 ? theVotedNomination[0].username : "";

	const responseFetchCast =
		username.length > 0
			? await client.lookUpCastByHashOrWarpcastUrl(
					`https://warpcast.com/${username}/${castId}`,
					"url"
				)
			: undefined;
	const castText = responseFetchCast?.cast.text ?? "";

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
			const newVote = await votingSystem.vote(
				nominations[state.selectedCast].id,
				fid,
				roundId || ""
			);
			hasUserVoted = true;
			theVotedNomination = await votingSystem.fetchNominationById(
				newVote.nominationId ?? ""
			);
		} catch (e) {
			hasUserVoted = false;
			console.error(`Error in final vote: ${e}`);
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
							justifyContent: "center",
							paddingLeft: 24,
							paddingRight: 24
						}}
					>
						{theVotedNomination.length > 0 && (
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
					<Button key={"refresh"} action="/vote" value="vote">
						Refresh
					</Button>,
					<Button key={"status"} action="/status" value="status">
						Back
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
	const state = deriveState(() => {});

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

				{userNomination.length === 0 && (
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
				{userNomination.length > 0 && (
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
		intents: generateNominateIntents(
			userNomination.length > 0,
			state.isPowerBadgeUser
		)
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

const generateIntentsInfo = (infoPage: number) => {
	const paginationButtons = () => {
		switch (infoPage) {
			case 0:
				return [
					<Button key={"previousInfo"} action={"/lore"} value="previousInfo">
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/infoNoms" value="nextInfo">
						➡️
					</Button>
				];
			case 1:
				return [
					<Button
						key={"previousInfo"}
						action={"/information"}
						value="previousInfo"
					>
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/infoVotes" value="nextInfo">
						➡️
					</Button>
				];
			case 2:
				return [
					<Button
						key={"previousInfo"}
						action={"/infoNoms"}
						value="previousInfo"
					>
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/rewards" value="nextInfo">
						➡️
					</Button>
				];
			case 3:
				return [
					<Button
						key={"previousInfo"}
						action={"/infoVotes"}
						value="previousInfo"
					>
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/lore" value="nextInfo">
						➡️
					</Button>
				];
			case 4:
				return [
					<Button key={"previousInfo"} action={"/rewards"} value="previousInfo">
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/information" value="nextInfo">
						➡️
					</Button>
				];
			default:
				return [
					<Button key={"previousInfo"} action={"/lore"} value="previousInfo">
						⬅️
					</Button>,
					<Button key={"nextInfo"} action="/infoNoms" value="nextInfo">
						➡️
					</Button>
				];
		}
	};
	return [
		<Button key={"back"} action={"/"} value="back">
			Back to main
		</Button>,
		...paginationButtons()
	];
};
