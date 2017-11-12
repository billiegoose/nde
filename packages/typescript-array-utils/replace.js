export function replace(a, index, element) {
	return [].concat(a.slice(0, index), element, a.slice(index + 1));
}
