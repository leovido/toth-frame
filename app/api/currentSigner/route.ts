import { fetchOrCreateAndVerifySigner } from "@/app/toth/[[...routes]]/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { fid } = await req.json();

		const signer = await fetchOrCreateAndVerifySigner(fid);
		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}
