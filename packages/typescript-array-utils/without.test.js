import * as test from "tape";
import {without} from "./without";

test("Test element removal", (t) => {
	const input = [0, 1, 2, 3, 4];
	const expected = [0, 1, 3, 4];

	const actual = without(input, 2);

	t.equals(actual.length, expected.length);
	t.equals(input.length, 5);
	t.deepEqual(actual, expected);

	t.end();
});
