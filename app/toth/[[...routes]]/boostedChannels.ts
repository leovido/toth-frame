export const boostedChannels = [
	"/farcastHER",
	"/FarCon",
	"/frames",
	"/Base",
	"/Dev",
	"/Design",
	"/Frontend",
	"/Founders",
	"/perl",
	"/Product",
	"/Zora"
].map((channel) => {
	return channel.toLowerCase();
});

const _channelMap = [
	{
		dev: "chain://eip155:1/erc721:0x7dd4e31f1530ac682c8ea4d8016e95773e08d8b0",
		design:
			"chain://eip155:7777777/erc721:0x22be981fb87effbe6780b34a6fe1dfc14a00ec8e",
		farcon:
			"chain://eip155:1/erc721:0x2A9EA02E4c2dcd56Ba20628Fe1bd46bAe2C62746",
		frames: "https://warpcast.com/~/channel/frames",
		base: "https://onchainsummer.xyz",
		degen:
			"chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
		zora: "chain://eip155:1/erc721:0xca21d4228cdcc68d4e23807e5e370c07577dd152",
		frontend:
			"chain://eip155:7777777/erc721:0x3d037b11c5359fac54c3928dfad0b9512695d392",
		farcasther:
			"chain://eip155:8453/erc721:0x1e5115dc60cdab3c1263a945201cb509ea7a8340",
		founders: "https://farcaster.group/founders",
		perl: "https://warpcast.com/~/channel/perl",
		product: "https://farcaster.group/product"
	}
];

export const channelMap = _channelMap.map((obj) => {
	const swapped = new Map<string, string>();
	for (const [key, value] of Object.entries(obj)) {
		swapped.set(value, key);
	}
	return swapped;
})[0];
