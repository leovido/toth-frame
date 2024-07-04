import React from "react";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.scss";
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
				<SpeedInsights />
				<AppProvider>{children}</AppProvider>
			</body>
		</html>
	);
}
