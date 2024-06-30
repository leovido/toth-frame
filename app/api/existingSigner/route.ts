import { votingSystem } from "@/app/toth/[[...routes]]/votingSystem/nominationAndVotingSystem";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const publicKey = (await req.nextUrl.searchParams.get("publicKey")) || "";

		const signer = await votingSystem.fetchSignerByPKey(publicKey);
		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json(`${error}`, { status: 500 });
	}
}
