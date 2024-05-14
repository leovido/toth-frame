import { createNomination } from "../votingSystem/nomination"; // Adjust the import path as necessary

// Mocking the external votingSystem module
jest.mock("../votingSystem/nominationAndVotingSystem", () => {
	return {
		NominationAndVotingSystem: jest.fn().mockImplementation(() => ({
			nominationOpen: true,
			nominate: jest.fn(),
			fetchNominationsByFid: jest.fn().mockResolvedValue({
				username: "testUser",
				castId: "cast123",
				fid: 203666,
				createdAt: "2024-01-01T15:00:00.000Z",
				weight: 1,
				roundId: "round1"
			})
		}))
	};
});

describe("createNomination", () => {
	const matchMock: RegExpMatchArray = ["", "testUser", "cast123"];
	const fid = 1;
	const isPowerBadgeUser = false;
	const currentRound = {
		id: "round1",
		nominationStartTime: new Date("2024-01-01T19:00:00Z"),
		nominationEndTime: new Date("2024-01-01T19:00:00Z"),
		votingEndTime: new Date("2024-01-01T19:00:00Z"),
		votingStartTime: new Date("2024-01-01T19:00:00Z"),
		roundNumber: 1,
		status: "nominating",
		winner: ""
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest
			.useFakeTimers()
			.setSystemTime(new Date("2024-01-01T15:00:00Z").getTime()); // Set a specific time before the nomination end time
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should successfully create a nomination when all conditions are met", async () => {
		// Execution
		const result = await createNomination(
			true,
			matchMock,
			fid,
			isPowerBadgeUser,
			currentRound
		);

		// Assertions
		expect(result).toEqual({
			username: "testUser",
			castId: "cast123",
			fid: 203666,
			createdAt: "2024-01-01T15:00:00.000Z",
			weight: 1,
			roundId: "round1"
		});
	});

	it("should return an empty array if the nomination time is past", async () => {
		jest
			.useFakeTimers()
			.setSystemTime(new Date("2024-01-01T20:00:00Z").getTime());

		const result = await createNomination(
			true,
			matchMock,
			fid,
			isPowerBadgeUser,
			currentRound
		);

		expect(result).toEqual([]);
	});

	it("should return an empty array if isValidCast is false or match is null", async () => {
		const result = await createNomination(
			false,
			null,
			fid,
			isPowerBadgeUser,
			currentRound
		);
		expect(result).toEqual([]);
	});

	// it("should handle errors from votingSystem and return an empty array", async () => {
	// 	// Setup
	// 	votingSystem.nominate.mockRejectedValue(new Error("Error nominating"));

	// 	// Execution
	// 	const result = await createNomination(
	// 		true,
	// 		matchMock,
	// 		fid,
	// 		isPowerBadgeUser,
	// 		currentRound
	// 	);

	// 	// Assertions
	// 	expect(result).toEqual([]);
	// 	expect(console.error).toHaveBeenCalled();
	// });
});
