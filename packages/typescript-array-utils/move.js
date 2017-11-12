export function move(a, from, to) {
	const element = a[from];

	const forward = from < to;

	const head = a.slice(0, forward ? from : to);
	const mid = a.slice(forward ? from + 1 : to, forward ? to + 1 : from);
	const tail = a.slice(forward ? to + 1 : from + 1);

	return forward ?
		[].concat(head, mid, element, tail) :
		[].concat(head, element, mid, tail);
}
