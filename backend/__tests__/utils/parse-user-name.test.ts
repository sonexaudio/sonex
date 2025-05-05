import { describe, test, expect } from "vitest";
import { parseUserName } from "../../src/utils";

describe("Parsing a User's Name for the database", () => {
	describe("When given no name", () => {
		test("should return undefined", () => {
			const result = parseUserName("");
			expect(parseUserName).toBeDefined();
			expect(result).toBe(undefined);
		});
	});

	describe("When given a name", () => {
		test("should return only first name value if last name not given", () => {
			const result = parseUserName("Izzy");
			expect(result?.firstName).toBe("Izzy");
			expect(result?.lastName).toBe("");
		});

		test("should return first and last name property", () => {
			const result = parseUserName("Izzy Vickers");
			expect(result?.firstName).toBe("Izzy");
			expect(result?.lastName).toBe("Vickers");
		});
		test("should return full name capitalized in either situation", () => {
			const test1 = parseUserName("iZZy");
			const test2 = parseUserName("izzy vIckerS");

			expect(test1?.firstName).toBe("Izzy");
			expect(test2).toEqual({ firstName: "Izzy", lastName: "Vickers" });
		});
		test("should return entire last name if more than one, including hyphens", () => {
			const result1 = parseUserName("izzy robert gonzalez vickers");
			const result2 = parseUserName("Jasmine howard-Vickers");
			expect(result1?.lastName).toBe("Robert Gonzalez Vickers");

			expect(result2?.lastName).toBe("Howard-Vickers");
		});
	});
});
