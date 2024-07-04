"use client";

import React from "react";
import ScreenLayout from "../layout";
import { useApp } from "../../Context/AppContext";

const Home = () => {
	const { displayName, pfp } = useApp();

	return (
		<ScreenLayout>
			<main className="flex flex-col flex-grow justify-center items-center">
				{displayName && pfp ? (
					<>
						<p className="text-3xl">
							Hello{" "}
							{displayName && (
								<span className="font-medium">{displayName}</span>
							)}
							... 👋
						</p>
						<p
							className="text-3xl"
							style={{ padding: 40, textAlign: "center" }}
						>
							TOTH will cast on your behalf to the winner of each round. The
							most voted cast gets all pooled tips
						</p>
					</>
				) : (
					<p>Loading...</p>
				)}
			</main>
		</ScreenLayout>
	);
};

export default Home;
