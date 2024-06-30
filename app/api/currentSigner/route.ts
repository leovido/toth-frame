import { fetchOrCreateAndVerifySigner } from "@/app/toth/[[...routes]]/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const _fid = await req.nextUrl.searchParams.get("fid");
		const fid = Number(_fid);
		const signer = await fetchOrCreateAndVerifySigner(fid);
		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json(`${error}`, { status: 500 });
	}
}
