type UserDisplayName = {
	firstName: string;
	lastName: string;
};

export function parseUserName(name: string): UserDisplayName | undefined {
	if (!name) return;

	const nameArr = name.split(" ");

	let firstName: string;
	// biome-ignore lint/style/useConst: suppressing this rule
	let lastName: string;

	if (nameArr.length === 1) {
		firstName = _capitalizeName(name);
		return { firstName, lastName: "" };
	}

	firstName = _capitalizeName(nameArr[0]);

	lastName = nameArr
		.slice(1)
		.map((n) => _capitalizeName(n))
		.join(" ");

	return { firstName, lastName };
}

function _capitalizeName(name: string) {
	const hyphenated = name.split("-").length > 1;

	if (hyphenated) {
		const parsedHyphenatedName = name
			.split("-")
			.map((n) => n[0].toUpperCase() + n.slice(1).toLowerCase())
			.join("-");

		return parsedHyphenatedName;
	}

	return name[0].toUpperCase() + name.slice(1).toLowerCase();
}
