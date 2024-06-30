import { createAndVerifySigner } from "@/app/toth/[[...routes]]/helpers";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const signer = await createAndVerifySigner();
		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json(`${error}`, { status: 500 });
	}
}
