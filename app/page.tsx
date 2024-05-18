"use client";

import React from "react";
import axios from "axios";
import QRCode from "qrcode.react";
import { useState } from "react";
import styles from "./page.module.css";

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

	const handleSignIn = async () => {
		setLoading(true);
		await createAndStoreSigner();
		setLoading(false);
	};

	const createAndStoreSigner = async () => {
		try {
			const response = await axios.post("/api/signer");
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
		<div className={styles.container}>
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
		</div>
	);
}
