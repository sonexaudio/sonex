import { vi } from "vitest";

export const prismaMock = {
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
};

export const bcryptMock = {
	hash: vi.fn(),
};

export const parseUserNameMock = vi.fn();
