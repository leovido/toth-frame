// /** @jsxImportSource frog/jsx */

// import { app } from "@/app/src/app";
// import { generateIntentsInfo } from "./route";
// import { devtools } from "frog/dev";
// import { serveStatic } from "frog/serve-static";

// app.frame("/infoVotes", async (c) => {
// 	const { deriveState, buttonValue } = c;

// 	const state = deriveState((previousState) => {
// 		if (buttonValue === "more") {
// 			previousState.stateInfo = 1;
// 		} else if (buttonValue === "information") {
// 			previousState.stateInfo = 0;
// 		}
// 	});

// 	return c.res({
// 		image: (
// 			<div
// 				style={{
// 					fontFamily: "Open Sans",
// 					alignItems: "center",
// 					background: "#17101F",
// 					backgroundSize: "100% 100%",
// 					display: "flex",
// 					flexDirection: "column",
// 					flexWrap: "nowrap",
// 					height: "100%",
// 					justifyContent: "center",
// 					textAlign: "center",
// 					width: "100%",
// 					paddingLeft: 20,
// 					paddingRight: 20
// 				}}
// 			>
// 				<h1
// 					style={{
// 						fontFamily: "Space Mono",
// 						fontSize: "5rem",
// 						color: "#38BDF8"
// 					}}
// 				>
// 					🎩 TOTH - Voting 🎩
// 				</h1>
// 				<h2 style={{ fontSize: "1.8rem", color: "#D6FFF6", fontWeight: 400 }}>
// 					1. Only Power Badge holders can vote (once per round) at this stage
// 				</h2>
// 				<h2
// 					style={{
// 						fontSize: "1.8rem",
// 						color: "#D6FFF6",
// 						fontWeight: 400
// 					}}
// 				>
// 					2. Voting opens 6 PM the day before & closes at 6 PM on the TOTH day
// 				</h2>
// 				<h2
// 					style={{
// 						fontSize: "1.8rem",
// 						color: "#D6FFF6",
// 						fontWeight: 400
// 					}}
// 				>
// 					3. From 6pm to midnight of TOTH day a vetted council of OGs, previous
// 					TOTH winners & the dev team review the top-voted cast for anomalies
// 				</h2>
// 				<h2
// 					style={{
// 						fontSize: "1.8rem",
// 						color: "#D6FFF6",
// 						fontWeight: 400
// 					}}
// 				>
// 					4. If more vote &quot;no&quot; than &quot;yes,&quot; the TOTH is
// 					invalidated and rolls over
// 				</h2>
// 				<h2
// 					style={{
// 						fontSize: "1.8rem",
// 						color: "#D6FFF6",
// 						fontWeight: 400
// 					}}
// 				>
// 					5. By default, the entire TOTH goes to the cast creator
// 				</h2>
// 			</div>
// 		),
// 		intents: generateIntentsInfo(state.stateInfo, false)
// 	});
// });

// devtools(app, { serveStatic });
