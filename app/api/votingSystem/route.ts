import { votingSystem } from "@/app/toth/[[...routes]]/votingSystem/nominationAndVotingSystem";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const fid = await req.nextUrl.searchParams.get("fid");

		const signer = await votingSystem.fetchSigner(Number(fid));

		return NextResponse.json(signer ?? {}, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json(`${error}`, { status: 500 });
	}
}
