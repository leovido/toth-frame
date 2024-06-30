import { client } from "@/app/toth/[[...routes]]/client";
import { getSignedKey } from "../../../utils/getSignedKey";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const signedKey = await getSignedKey();

		return NextResponse.json(signedKey, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const publicKey = searchParams.get("publicKey");

	if (!publicKey) {
		return NextResponse.json(
			{ error: "publicKey is required" },
			{ status: 400 }
		);
	}

	try {
		const signer = await client.lookupDeveloperManagedSigner(publicKey);

		return NextResponse.json(signer, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}
