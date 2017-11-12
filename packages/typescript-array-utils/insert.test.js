import * as test from "tape";
import {insert} from "./insert";

test("Test element insertion", (t) => {
	const expected = [0, 5, 1, 2, 3, 4];
	const actual = insert([0, 1, 2, 3, 4], 1, 5);

	t.equals(actual.length, expected.length);
	for (var i = 0; i < actual.length; i++) {
		t.equals(actual[i], expected[i])
	}

	t.end();
});

test("Test element insertion at end of array", (t) => {
	const expected = [0, 1, 2, 3, 4, 5];
	const actual = insert([0, 1, 2, 3, 4], 5, 5);

	t.equals(actual.length, expected.length);
	for (var i = 0; i < actual.length; i++) {
		t.equals(actual[i], expected[i])
	}

	t.end();
});
