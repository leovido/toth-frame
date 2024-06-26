// Assuming the file is nominationAndVotingSystem.ts
import { NominationAndVotingSystem } from "../votingSystem/nominationAndVotingSystem";
import { MongoDBService } from "../votingSystem/implementation/MongoDBService";
import { client } from "../client";

jest.mock("../votingSystem/implementation/MongoDBService");
jest.mock("../client", () => ({
	client: {
		lookUpCastByHashOrWarpcastUrl: jest.fn().mockResolvedValue(true)
	}
}));

describe("Nominations within time range 0:00-18:00 UTC", () => {
	let system: NominationAndVotingSystem;
	let mockDbService: MongoDBService;

	const mockDate = new Date("2024-01-01T00:00:00Z");

	beforeAll(() => {
		// Mock the global Date constructor
		const RealDate = Date;
		global.Date = class extends RealDate {
			constructor() {
				super();
				return mockDate;
			}
		} as typeof Date;

		// Mock Date.now() as well if used in the code
		jest.spyOn(Date, "now").mockImplementation(() => mockDate.getTime());
	});

	afterAll(() => {
		// Restore the original Date constructor and Date.now() implementation
		global.Date = Date;
		jest.spyOn(Date, "now").mockRestore();
	});

	beforeEach(() => {
		jest.clearAllMocks();

		mockDbService = new MongoDBService();
		system = new NominationAndVotingSystem(mockDbService);
	});

	describe("nominate", () => {
		it("should allow nomination when nominations are open", async () => {
			const nominationData = {
				username: "JohnDoe",
				castId: "1234",
				fid: 203666,
				createdAt: new Date().toISOString(),
				weight: 3
			};

			await system.nominate(nominationData);

			expect(mockDbService.addNomination).toHaveBeenCalledWith({
				...nominationData
			});
		});
	});

	describe("verifyCastURL", () => {
		it("returns true when URL is valid", async () => {
			const result = await system.verifyCastURL("http://valid-url.com");

			expect(result).toBe(true);
			expect(client.lookUpCastByHashOrWarpcastUrl).toHaveBeenCalledWith(
				"http://valid-url.com",
				"url"
			);
		});
	});
});

describe("Nominations outside of time range 18:00-23:59 UTC", () => {
	let system: NominationAndVotingSystem;
	let mockDbService: MongoDBService;

	const mockDate = new Date("2024-01-01T18:00:00Z");

	beforeAll(() => {
		// Mock the global Date constructor
		const RealDate = Date;
		global.Date = class extends RealDate {
			constructor() {
				super();
				return mockDate;
			}
		} as typeof Date;

		// Mock Date.now() as well if used in the code
		jest.spyOn(Date, "now").mockImplementation(() => mockDate.getTime());
	});

	afterAll(() => {
		// Restore the original Date constructor and Date.now() implementation
		global.Date = Date;
		jest.spyOn(Date, "now").mockRestore();
	});

	beforeEach(() => {
		jest.clearAllMocks();

		mockDbService = new MongoDBService();
		system = new NominationAndVotingSystem(mockDbService);
	});

	it("should not allow nominations and throw an error", async () => {
		expect(system.nominationOpen).toBe(false);

		const nominationData = {
			username: "JohnDoe",
			castId: "1234",
			fid: 203666,
			createdAt: new Date().toISOString(),
			weight: 3
		};
		await expect(system.nominate(nominationData)).rejects.toThrow(
			"Nominations are closed"
		);
	});
});
