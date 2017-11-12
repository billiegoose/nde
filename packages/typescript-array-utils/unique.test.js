import * as test from "tape";
import {unique} from "./unique";

test("Test selecting unique values", (t) => {
	const intInput = [9, 1, 2, 3, 1, 1, 3, 5, 2, 5, 7];
	const intExpected = [9, 1, 2, 3, 5, 7];

	const intActual = unique(intInput);
	t.deepEqual(intActual, intExpected);

	const objInput: Obj[] = [{id: 1}, {id: 2}, {id: 1}, {id: 6}];

	t.deepEqual(unique(objInput), objInput);

	const objExpectedIdCmp = [{id: 1}, {id: 2}, {id: 6}];

	const objActualIdCmp = unique(objInput, (a, b) => {
		return a.id === b.id;
	});
	t.deepEqual(objActualIdCmp, objExpectedIdCmp);

	t.end();
});

interface Obj {
	id: number;
}
