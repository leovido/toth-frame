import React from "react";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProvider } from "./Context/AppContext";

const inter = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
	title: "TOTH",
	description: "Pool tips, Fund awesomeness"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>TOTH</title>
			</head>
			<body className={inter.className}>
				{children}
				<SpeedInsights />
				<AppProvider>{children}</AppProvider>
				<script
					src="https://neynarxyz.github.io/siwn/raw/1.2.0/index.js"
					async
				></script>
			</body>
		</html>
	);
}
