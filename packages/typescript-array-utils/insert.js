export function insert(a, index, element) {
	return [].concat(a.slice(0, index), element, a.slice(index));
}
