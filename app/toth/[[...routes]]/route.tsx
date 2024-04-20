/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../ui";
import { castNetworth } from "./fetch";

interface State {
	totalDegen: number;
	dollarValue: string;
}

const firstRun = async (castId: string, forceRefresh: boolean) => {
	const willRun = forceRefresh && process.env.CONFIG === "DEV";
	const items = willRun
		? await castNetworth(castId).catch((e) => {
				console.error(`client items error: ${e}`);

				throw new Error(`client items error: ${e}`);
			})
		: {
				totalAmount: 100,
				dollarValue: "$111.11",
				topThree: [
					{
						username: "@test",
						amount: 100000
					},
					{
						username: "@test",
						amount: 33334
					},
					{
						username: "@test",
						amount: 31242
					}
				]
			};

	return {
		totalAmount: items.totalAmount,
		dollarValue: items.dollarValue,
		topThree: items.topThree
	};
};

const app = new Frog<{ State: State }>({
	initialState: {
		totalDegen: 0,
		dollarValue: "0"
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
					🎩TOTH🎩
				</h1>
				<h2 style={{ fontSize: "3rem", color: "#D6FFF6", fontWeight: 400 }}>
					Pool tips, Fund awesomeness
				</h2>
			</div>
		),
		intents: [
			<Button key={"check"} action="/check" value="check">
				Check
			</Button>
		]
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

	const castId = "https://warpcast.com/leovido.eth/0xd6e20741";

	const { totalAmount, dollarValue, topThree } = await firstRun(
		castId,
		forceRefresh
	);

	const state = deriveState((previousState) => {
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
					background: "linear-gradient(to right, #231651, #17101F)",
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
						color: "#D6FFF6"
					}}
				>
					🎩 TOTH 🎩
				</h1>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						color: "#30E000",
						justifyContent: "center"
					}}
				>
					{topThree.map((value) => (
						<div
							key={value.username}
							style={{
								display: "flex",
								flexDirection: "row",
								color: "#30E000",
								justifyContent: "space-around"
							}}
						>
							<h1>{value.username}</h1>
							<h1>{value.amount} $DEGEN</h1>
						</div>
					))}
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							color: "#30E000"
						}}
					>
						<h1 style={{ fontFamily: "Space Mono", fontSize: "3rem" }}>
							Cast worth:
						</h1>
						<h1 style={{ fontFamily: "SF-Mono", fontSize: "3rem" }}>
							{totalAmount} $DEGEN
						</h1>
					</div>
					<h1 style={{ fontFamily: "Space Mono", fontSize: "3rem" }}>
						Dollar value: {dollarValue}
					</h1>
				</div>
			</div>
		),
		intents: [
			<Button key={"check"} action="/check" value="check">
				Refresh
			</Button>
		]
	});
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
