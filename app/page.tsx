"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import QRCode from "qrcode.react";
import { Suspense } from "react";

interface FarcasterUser {
	signer_uuid: string;
	public_key: string;
	status: string;
	signer_approval_url?: string;
	fid?: number;
}

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
		const updateSigner = async () => {
			try {
				if (farcasterUser?.status === "approved") {
					const response = await fetch(
						`/api/votingSystem?publicKey=${farcasterUser.public_key}&fid=${farcasterUser.fid}`
					);
					await response.json();
				}
			} catch (error) {
				console.error(error);
			}
		};
		updateSigner();
	}, [farcasterUser]);

	useEffect(() => {
		if (farcasterUser && farcasterUser.status === "pending_approval") {
			let intervalId: NodeJS.Timeout;

			const startPolling = () => {
				intervalId = setInterval(async () => {
					try {
						const response = await axios.get(
							`/api/signer?publicKey=${farcasterUser?.public_key}`
						);
						const user = response.data as FarcasterUser;

						if (user?.status === "approved") {
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
			const response = await axios.get("/api/currentSigner");

			if (response.status === 200) {
				localStorage.setItem(
					LOCAL_STORAGE_KEYS.FARCASTER_USER,
					JSON.stringify(response.data)
				);
				setFarcasterUser(response.data);
			}
		} catch (error) {
			console.error("API Call failed", error);
		}
	};

	return (
		<Suspense>
			<div className={styles.container}>
				<h1 style={{ fontSize: "70px", color: "#38BDF8" }}>TOTH sign in</h1>

				{farcasterUser?.status !== "approved" && (
					<h1 style={{ fontSize: "30px", color: "#30E000", fontWeight: 400 }}>
						Sign in with farcaster to allow TOTH to cast on your behalf to the
						winner of each round.
					</h1>
				)}

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
						<div className={styles.userInfo} style={{ color: "white" }}>
							Hello {farcasterUser.fid} 👋
						</div>

						<h1 style={{ fontSize: "30px", color: "#30E000", fontWeight: 400 }}>
							TOTH will cast on your behalf to the winner of each round.
						</h1>
						<h1
							style={{
								fontSize: "30px",
								color: "red",
								fontWeight: 400,
								paddingTop: 20
							}}
						>
							You can revoke permissions in Warpcast settings {">"} Advanced{" "}
							{">"} Manage connected apps {">"} Delete @tipothehat
						</h1>
					</div>
				)}
			</div>
		</Suspense>
	);
}
