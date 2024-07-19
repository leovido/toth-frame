"use client";

import React, { useEffect } from "react";
import ScreenLayout from "../layout";
import { useApp } from "../../Context/AppContext";
import axios from "axios";
import useLocalStorage from "@/app/hooks/use-local-storage-state";
import { UserInfo } from "@/app/types";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";

const Home = () => {
	const { displayName, pfp } = useApp();

	const [user] = useLocalStorage<UserInfo | null>("user", null);

	useEffect(() => {
		const process = async () => {
			if (user) {
				try {
					const response = await axios.get(
						`/api/signer?signerUUID=${user.signerUuid}`
					);

					const checkExists = await axios.get(
						`/api/votingSystem?fid=${user.fid}`
					);

					if (checkExists.data.signer_uuid === undefined) {
						const signer: Signer = response.data;

						await axios.post("/api/storeSigner", {
							signer
						});
					} else {
						return;
					}
				} catch (error) {
					console.error(error);
				}
			}
		};
		process();
	}, [user]);

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
