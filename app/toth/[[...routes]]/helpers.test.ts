import { createAndVerifySigner } from "./helpers";
import { votingSystem } from "./votingSystem/nominationAndVotingSystem";
import { createAndStoreSignerDB } from "./helpers";
import { client } from "./client";

// Mock the modules
jest.mock("./client");
jest.mock("./helpers");

describe("createAndVerifySigner", () => {
	const mockFetchSigner = votingSystem.fetchSigner as jest.Mock;
	const mockCreateAndStoreSigner = createAndStoreSignerDB as jest.Mock;
	const mockLookupDeveloperManagedSigner =
		client.lookupDeveloperManagedSigner as jest.Mock;

	it("should fetch an existing signer if available", async () => {
		const fid = 203666;
		const existingSigner = { public_key: "existing_public_key" };
		const existingSignerVerificationStatus = { status: "verified" };

		mockFetchSigner.mockResolvedValue(existingSigner);
		mockLookupDeveloperManagedSigner.mockResolvedValue(
			existingSignerVerificationStatus
		);

		const result = await createAndVerifySigner();

		expect(mockFetchSigner).toHaveBeenCalledWith(fid);
		expect(mockCreateAndStoreSigner).not.toHaveBeenCalled();
		expect(mockLookupDeveloperManagedSigner).toHaveBeenCalledWith(
			existingSigner.public_key
		);
		expect(result).toEqual({
			signer: existingSigner,
			signerVerificationStatus: existingSignerVerificationStatus
		});
	});

	it("should create and store a new signer if no existing signer is available", async () => {
		const fid = 203666;
		const newSigner = { public_key: "new_public_key" };
		const newSignerVerificationStatus = { status: "verified" };

		mockFetchSigner.mockResolvedValue(null);
		mockCreateAndStoreSigner.mockResolvedValue(newSigner);
		mockLookupDeveloperManagedSigner.mockResolvedValue(
			newSignerVerificationStatus
		);

		const result = await createAndVerifySigner();

		expect(mockFetchSigner).toHaveBeenCalledWith(fid);
		expect(mockCreateAndStoreSigner).toHaveBeenCalledWith(fid);
		expect(mockLookupDeveloperManagedSigner).toHaveBeenCalledWith(
			newSigner.public_key
		);
		expect(result).toEqual({
			signer: newSigner,
			signerVerificationStatus: newSignerVerificationStatus
		});
	});

	it.only("should handle errors and rethrow", async () => {
		const fid = 203666;
		const error = new Error("Some error");

		mockFetchSigner.mockImplementation(() => {
			throw error;
		});

		await expect(createAndVerifySigner()).rejects.toThrow(error);
		expect(mockFetchSigner).toHaveBeenCalledWith(fid);
		expect(mockCreateAndStoreSigner).not.toHaveBeenCalled();
		expect(mockLookupDeveloperManagedSigner).not.toHaveBeenCalled();
	});
});
