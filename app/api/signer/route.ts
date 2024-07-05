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
	const signerUUID = searchParams.get("signerUUID");

	if (!signerUUID) {
		return NextResponse.json(
			{ error: "signerUUID is required" },
			{ status: 400 }
		);
	}

	try {
		const signer = await client.lookupSigner(signerUUID);

		return NextResponse.json(signer, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}
