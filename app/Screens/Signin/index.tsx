import React from "react";
import ScreenLayout from "../layout";
import { getMessage, welcomeMessages } from "../../utils/helpers";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../../Context/AppContext";
import useLocalStorage from "../../hooks/use-local-storage-state";

const Signin = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setUser] = useLocalStorage("user");
	const [isClient, setIsClient] = useState(false);

	const [theme] = useState("light");
	const [variant] = useState("farcaster");

	useEffect(() => {
		// Identify or create the script element
		let script = document.getElementById(
			"siwn-script"
		) as HTMLScriptElement | null;

		if (!script) {
			script = document.createElement("script");
			script.id = "siwn-script";
			document.body.appendChild(script);
		}

		// Set attributes and source of the script
		script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
		script.async = true;
		script.defer = true;

		document.body.appendChild(script);

		return () => {
			// Remove the script from the body
			if (script) {
				document.body.removeChild(script);
			}

			// Remove the button if it exists
			const button = document.getElementById("siwn-button");
			if (button && button.parentElement) {
				button.parentElement.removeChild(button);
			}
		};
	}, [theme, variant]);

	const { setSignerUuid, setFid } = useApp();
	const client_id = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
	const neynar_login_url =
		process.env.NEXT_PUBLIC_NEYNAR_LOGIN_URL || "https://app.neynar.com/login";

	if (!client_id) {
		throw new Error("NEXT_PUBLIC_NEYNAR_CLIENT_ID is not defined in .env");
	}

	useEffect(() => {
		// eslint-disable-next-line
		window.onSignInSuccess = (data: unknown) => {
			setUser({
				signerUuid: data.signer_uuid,
				fid: data.fid
			});
			setSignerUuid(data.signer_uuid);
			setFid(data.fid);
		};

		return () => {
			// eslint-disable-next-line
			delete window.onSignInSuccess; // Clean up the global callback
		};
	}, [setFid, setSignerUuid, setUser]);

	useEffect(() => {
		setIsClient(true);
	}, []);
	const getButton = useCallback(() => {
		return (
			<div
				className="neynar_signin mt-6"
				data-client_id={client_id}
				data-neynar_login_url={neynar_login_url}
				data-success-callback="onSignInSuccess"
				data-theme={theme}
				data-variant={variant}
			></div>
		);
	}, [client_id, neynar_login_url, theme, variant]);

	return (
		<ScreenLayout>
			<main className="flex-grow flex flex-col items-center justify-center">
				<div className="mx-5 flex flex-col items-center justify-center">
					<h2 className="text-4xl font-extralight mb-4">
						{isClient && getMessage(welcomeMessages)}
					</h2>

					{getButton()}
				</div>
			</main>
		</ScreenLayout>
	);
};

export default Signin;
