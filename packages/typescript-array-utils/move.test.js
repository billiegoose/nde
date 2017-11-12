import * as test from "tape";
import {move} from "./move";

test("Test element moving forward", (t) => {
	const input = [0, 1, 2, 3, 4, 5];

	const expected = [0, 2, 3, 4, 1, 5];

	const actual = move(input, 1, 4);

	t.equals(actual.length, expected.length);
	t.deepEquals(actual, expected);

	t.end();
});

test("Test moving element backward", (t) => {
	const input = [0, 1, 2, 3, 4, 5];

	const expected = [0, 4, 1, 2, 3, 5];

	const actual = move(input, 4, 1);

	t.equals(actual.length, expected.length);
	t.deepEquals(actual, expected);

	t.end();
});

test("Test moving element in place", (t) => {
	const input = [0, 1, 2, 3, 4, 5];

	const expected = [0, 1, 2, 3, 4, 5];

	const actual = move(input, 1, 1);

	t.equals(actual.length, expected.length);
	t.deepEquals(actual, expected);

	t.end();
});

test("Test symmetry", (t) => {
	const input = [0, 1, 2, 3, 4, 5];

	const actual = move(move(input, 1, 4), 4, 1);

	t.equals(actual.length, input.length);
	t.deepEquals(actual, input);

	t.end();
});
