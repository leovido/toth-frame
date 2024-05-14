// Assuming the file is nominationAndVotingSystem.ts
import { NominationAndVotingSystem } from "../votingSystem/nominationAndVotingSystem";
import { MongoDBService } from "../votingSystem/implementation/MongoDBService";
import { client } from "../fetch";

jest.mock("../votingSystem/implementation/MongoDBService");
jest.mock("../fetch", () => ({
	client: {
		lookUpCastByHashOrWarpcastUrl: jest.fn().mockResolvedValue(true)
	}
}));

describe("NominationAndVotingSystem", () => {
	let system: NominationAndVotingSystem;
	let mockDbService: MongoDBService;

	beforeEach(() => {
		jest.clearAllMocks();

		mockDbService = new MongoDBService();
		system = new NominationAndVotingSystem(mockDbService);
	});

	describe("nominate", () => {
		it("should allow nomination when nominations are open", async () => {
			system.nominationOpen = true; // Ensure nominations are open
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

		it("should not allow nomination when nominations are closed", async () => {
			system.nominationOpen = false; // Ensure nominations are closed
			const nominationData = {
				username: "JohnDoe",
				castId: "1234",
				fid: 203666,
				createdAt: new Date().toISOString(),
				weight: 3
			};

			await system.nominate(nominationData);

			expect(mockDbService.addNomination).not.toHaveBeenCalled();
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

		it("returns false and logs error when URL is invalid", async () => {
			jest.mock("../fetch", () => ({
				client: {
					lookUpCastByHashOrWarpcastUrl: jest
						.fn()
						.mockRejectedValue(new Error())
				}
			}));

			const result = await system.verifyCastURL("http://invalid-url.com");

			expect(result).toBe(false);
			expect(client.lookUpCastByHashOrWarpcastUrl).toHaveBeenCalledWith(
				"http://invalid-url.com",
				"url"
			);
			expect(console.error).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
