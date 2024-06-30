import { votingSystem } from "@/app/toth/[[...routes]]/votingSystem/nominationAndVotingSystem";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { signer } = await req.json();
	try {
		await votingSystem.storeSigner(signer);

		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
}
