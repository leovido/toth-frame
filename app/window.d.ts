import { Signer } from "@neynar/nodejs-sdk/build/neynar-api/v2";

interface Window {
	onSignInSuccess?: (data: Signer) => void;
}
