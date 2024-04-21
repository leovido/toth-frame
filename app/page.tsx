import React from "react";
import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
	const frameTags = await getFrameMetadata(
		`${process.env.VERCEL_URL || "http://localhost:3000"}/toth`
	);
	return {
		title: "🎩Tip O' The Hat 🎩",
		description: "Pool tips, Fund awesomeness",
		authors: [
			{
				name: "@leovido.eth",
				url: "https://warpcast.com/leovido.eth"
			},
			{
				name: "@papa",
				url: "https://warpcast.com/papa"
			},
			{
				name: "@0xen",
				url: "https://warpcast.com/0xen"
			}
		],
		applicationName: "Tip O' The Hat frame",
		creator: "@leovido.eth, @papa, @0xen",
		other: frameTags
	};
}

export default function Home() {
	return (
		<main className={styles.main}>
			<h1 style={{ color: "white" }}>🎩Tip O&apos; The Hat🎩</h1>
		</main>
	);
}
