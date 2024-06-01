"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import QRCode from "qrcode.react";
import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { votingSystem } from "./toth/[[...routes]]/votingSystem/nominationAndVotingSystem";

interface FarcasterUser {
	signer_uuid: string;
	public_key: string;
	status: string;
	signer_approval_url?: string;
	fid?: number;
}

const newCreateAndStoreSignerDB: (
	fid: number,
	signer: Signer
) => Promise<void> = async (fid: number, signer: Signer) => {
	try {
		await votingSystem.storeSigner(fid, signer);

		return;
	} catch (error) {
		console.error("newCreateAndStoreSignerDB Call failed", error);
	}
};

export default function Home() {
	const LOCAL_STORAGE_KEYS = {
		FARCASTER_USER: "farcasterUser"
	};
	const [loading, setLoading] = useState(false);
	const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
		null
	);
	useEffect(() => {
		const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
		if (storedData) {
			const user: FarcasterUser = JSON.parse(storedData);
			setFarcasterUser(user);
		}
	}, []);

	useEffect(() => {
		if (farcasterUser && farcasterUser.status === "pending_approval") {
			let intervalId: NodeJS.Timeout;

			const startPolling = () => {
				intervalId = setInterval(async () => {
					try {
						const response = await axios.get(
							`/api/signer?signer_uuid=${farcasterUser?.signer_uuid}`
						);
						const user = response.data as FarcasterUser;

						if (user?.status === "approved") {
							// store the user in local storage
							localStorage.setItem(
								LOCAL_STORAGE_KEYS.FARCASTER_USER,
								JSON.stringify(user)
							);

							setFarcasterUser(user);
							clearInterval(intervalId);
						}
					} catch (error) {
						console.error("Error during polling", error);
					}
				}, 2000);
			};

			const stopPolling = () => {
				clearInterval(intervalId);
			};

			const handleVisibilityChange = () => {
				if (document.hidden) {
					stopPolling();
				} else {
					startPolling();
				}
			};

			document.addEventListener("visibilitychange", handleVisibilityChange);

			// Start the polling when the effect runs.
			startPolling();

			// Cleanup function to remove the event listener and clear interval.
			return () => {
				document.removeEventListener(
					"visibilitychange",
					handleVisibilityChange
				);
				clearInterval(intervalId);
			};
		}
	}, [farcasterUser]);

	const handleSignIn = async () => {
		setLoading(true);
		await createAndStoreSigner();
		setLoading(false);
	};

	const createAndStoreSigner = async () => {
		try {
			const response = await axios.post("/api/signer");
			const signer = response.data;
			if (response.status === 200) {
				localStorage.setItem(
					LOCAL_STORAGE_KEYS.FARCASTER_USER,
					JSON.stringify(response.data)
				);
				setFarcasterUser(response.data);
				await newCreateAndStoreSignerDB(farcasterUser?.fid || 0, signer);
			}
		} catch (error) {
			console.error("API Call failed", error);
		}
	};

	return (
		<div className={styles.container}>
			<h1 style={{ fontSize: "70px", color: "#38BDF8" }}>TOTH sign in</h1>
			<h1 style={{ fontSize: "30px", color: "#30E000", fontWeight: 400 }}>
				TOTH will cast on your behalf to the winner of each round.
			</h1>
			<h1
				style={{
					fontSize: "30px",
					color: "#30E000",
					fontWeight: 400,
					paddingTop: 20
				}}
			>
				You can cancel in Warpcast settings {">"} Advanced {">"} Manage
				connected apps {">"} Delete @tipothehat
			</h1>

			{!farcasterUser?.status && (
				<button
					className={styles.btn}
					onClick={handleSignIn}
					disabled={loading}
				>
					{loading ? "Loading..." : "Sign in with farcaster"}
				</button>
			)}
			{farcasterUser?.status == "pending_approval" &&
				farcasterUser?.signer_approval_url && (
					<div className={styles.qrContainer}>
						<QRCode value={farcasterUser.signer_approval_url} />
						<div className={styles.or}>OR</div>
						<a
							href={farcasterUser.signer_approval_url}
							target="_blank"
							rel="noopener noreferrer"
							className={styles.link}
						>
							Click here to view the signer URL (on mobile)
						</a>
					</div>
				)}
			{farcasterUser?.status == "approved" && (
				<div className={styles.castSection}>
					<div className={styles.userInfo}>Hello {farcasterUser.fid} 👋</div>
				</div>
			)}
		</div>
	);
}
