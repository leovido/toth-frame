import { votingSystem } from "@/app/toth/[[...routes]]/votingSystem/nominationAndVotingSystem";
import { NextRequest, NextResponse } from "next/server";

export default async (req: NextRequest) => {
	try {
		const { fid } = await req.json();

		const signer = await votingSystem.updateSigner(fid);
		return NextResponse.json(signer, {
			status: 200
		});
	} catch (error) {
		return NextResponse.json({ error: "An error occurred" }, { status: 500 });
	}
};
