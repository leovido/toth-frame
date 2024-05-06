import { describe, expect, it } from "@jest/globals";
import { timeFormattedNomination, timeFormattedVoting } from "../timeFormat";

describe("time formatting - since xh ym", () => {
	it("time formatting for votes - should show 24h remaining", () => {
		const today = new Date();
		today.setUTCHours(18);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedVoting(today);
		const expected = "24h 00m";

		expect(actual).toBe(expected);
	});

	it("time formatting for votes - 18 hours remaining", () => {
		const today = new Date();
		today.setUTCHours(0);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedVoting(today);
		const expected = "18h 00m";

		expect(actual).toBe(expected);
	});

	it("time formatting for votes - should show 1m remaining", () => {
		const today = new Date();
		today.setUTCHours(17);
		today.setUTCMinutes(59);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedVoting(today);
		const expected = "0h 01m";

		expect(actual).toBe(expected);
	});

	it("should pass with 6h window", () => {
		const today = new Date();
		today.setUTCHours(18);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedNomination(today);
		const expected = "6h 00m";

		expect(actual).toBe(expected);
	});

	it("should pass with 3h window", () => {
		const today = new Date();
		today.setUTCHours(21);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedNomination(today);
		const expected = "3h 00m";

		expect(actual).toBe(expected);
	});

	it("should ignore seconds", () => {
		const today = new Date();
		today.setUTCHours(21);
		today.setUTCMinutes(0);
		today.setUTCSeconds(39);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedNomination(today);
		const expected = "2h 59m";

		expect(actual).toBe(expected);
	});

	it("should return 1 minute left", () => {
		const today = new Date();
		today.setUTCHours(23);
		today.setUTCMinutes(59);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);

		const actual = timeFormattedNomination(today);
		const expected = "0h 01m";
		1;

		expect(actual).toBe(expected);
	});
});
