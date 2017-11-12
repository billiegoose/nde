export function without(a, index) {
	return [].concat(a.slice(0, index), a.slice(index + 1));
}
