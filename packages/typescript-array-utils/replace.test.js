import * as test from "tape";
import {replace} from "./replace";

test("Test element replacement", (t) => {
	const input = [{a: 0}, {a: 1}, {a: 2}];
	const element = {a: 3};
	const expected = [{a: 0}, element, {a: 2}];

	const actual = replace(input, 1, element);

	t.equals(input[1].a, 1);
	t.equals(input.length, 3);

	t.equals(actual.length, expected.length);
	t.equals(actual[1], element);

	const appended = replace(input, 3, element);
	t.equal(appended.length, 4);
	t.equal(appended[3], element);
	t.equal(appended[0], input[0]);
	t.equal(appended[1], input[1]);
	t.equal(appended[2], input[2]);

	t.end();
});
