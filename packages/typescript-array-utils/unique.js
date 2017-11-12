const identityCompare = (a, b) => {
	return a === b;
};

export function unique(arr, compare = identityCompare) {
	return arr.filter((e, index) => {
		return index === (arr as any).findIndex((v) => {
			return compare(e, v);
		});
	});
}
