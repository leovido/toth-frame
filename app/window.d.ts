import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";

declare global {
	interface Window {
		onSignInSuccess: (data: Signer) => void;
	}
}
