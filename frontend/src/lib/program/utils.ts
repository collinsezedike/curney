import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import IDL from "./idl.json";
import type { CurneyMarkets } from "./types";

const FIXED_POINT_SCALE = 1e9;
const DECAY_NORMALIZATION_FACTOR = 3600;

export const PLATFORM_CONFIG = new PublicKey(
	"32a2kKSydtMVzkE92BnNMAh5RTfk2i8owDNt32tqkBSE"
);

export const PLATFORM_TREASURY = new PublicKey(
	"32a2kKSydtMVzkE92BnNMAh5RTfk2i8owDNt32tqkBSE"
);

export const connection = new Connection(clusterApiUrl("devnet"), {
	commitment: "confirmed",
});

export const program = new anchor.Program<CurneyMarkets>(IDL, { connection });

export const calculateTotalScores = async (
	resolution: number,
	program: anchor.Program<CurneyMarkets>,
	marketConfig: anchor.web3.PublicKey
): Promise<anchor.BN> => {
	const allPositionAccounts = (await program.account.position.all()).filter(
		(p) => p.account.market.toBase58() == marketConfig.toBase58()
	);

	if (allPositionAccounts.length === 0) return new anchor.BN(0);

	let total = 0;
	for (const pos of allPositionAccounts) {
		const dist = Math.abs(pos.account.prediction.toNumber() - resolution);
		const decay =
			(DECAY_NORMALIZATION_FACTOR * pos.account.decay.toNumber()) /
			FIXED_POINT_SCALE;
		const exponent = -Math.pow(dist / decay, 2);
		const score = Math.exp(exponent);
		total += score * FIXED_POINT_SCALE;
	}

	return new anchor.BN(total);
};

export const getMarketConfigPDA = (marketId: string) => {
	const [marketConfig] = anchor.web3.PublicKey.findProgramAddressSync(
		[
			Buffer.from("market-config"),
			new anchor.BN(marketId).toBuffer("le", 8),
			PLATFORM_CONFIG.toBuffer(),
		],
		program.programId
	);
	return marketConfig;
};

export const getMarketStatePDA = (marketConfig: PublicKey) => {
	const [marketState] = anchor.web3.PublicKey.findProgramAddressSync(
		[
			Buffer.from("market-state"),
			marketConfig.toBuffer(),
			PLATFORM_CONFIG.toBuffer(),
		],
		program.programId
	);
	return marketState;
};

export const getMarketVaultPDA = (marketConfig: PublicKey) => {
	const [marketVault] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("market-vault"), marketConfig.toBuffer()],
		program.programId
	);
	return marketVault;
};

export const getPositionPDA = (
	currentIndex: number,
	marketConfig: PublicKey,
	user: PublicKey
) => {
	const [position] = anchor.web3.PublicKey.findProgramAddressSync(
		[
			Buffer.from("position"),
			new anchor.BN(currentIndex).toBuffer("le", 8),
			user.toBuffer(),
			marketConfig.toBuffer(),
		],
		program.programId
	);

	return position;
};

export const fetchPlatformConfigAccount = async (platformConfig: string) => {
	try {
		const platformConfigPubKey = new PublicKey(platformConfig);
		return await program.account.platformConfig.fetch(platformConfigPubKey);
	} catch {
		return null;
	}
};

export const fetchMarketStateAccount = async (marketState: string) => {
	try {
		const marketStatePubKey = new PublicKey(marketState);
		return await program.account.marketState.fetch(marketStatePubKey);
	} catch {
		return null;
	}
};

export const fetchAllMarketStateAccounts = async () => {
	try {
		return await program.account.marketState.all();
	} catch {
		return [];
	}
};

export const fetchAllApprovedMarketStateAccounts = async () => {
	try {
		return (await fetchAllMarketStateAccounts()).filter(
			(m) => m.account.isApproved
		);
	} catch {
		return [];
	}
};

export const fetchAllResolvedMarketStateAccounts = async () => {
	try {
		return (await fetchAllApprovedMarketStateAccounts()).filter(
			(m) => m.account.isResolved
		);
	} catch {
		return [];
	}
};

export const fetchAllProposedMarketStateAccounts = async (creator: string) => {
	try {
		const proposedMarketConfigPublicKeyStrings = (
			await fetchAllProposedMarketConfigAccounts(creator)
		).map((m) => m.publicKey.toBase58());

		if (proposedMarketConfigPublicKeyStrings) {
			return (await fetchAllMarketStateAccounts()).filter(
				(m) =>
					m.account.marketConfig.toBase58() in
					proposedMarketConfigPublicKeyStrings
			);
		} else return [];
	} catch {
		return [];
	}
};

export const fetchMarketConfigAccount = async (marketConfig: string) => {
	try {
		const marketConfigPubKey = new PublicKey(marketConfig);
		return await program.account.marketConfig.fetch(marketConfigPubKey);
	} catch {
		return null;
	}
};

export const fetchAllMarketConfigAccounts = async () => {
	try {
		return await program.account.marketConfig.all();
	} catch {
		return [];
	}
};

export const fetchAllApprovedMarketConfigAccounts = async () => {
	try {
		const approvedMarketStatePublicKeyStrings = (
			await fetchAllApprovedMarketStateAccounts()
		).map((m) => m.publicKey.toBase58());

		if (approvedMarketStatePublicKeyStrings) {
			return (await fetchAllMarketConfigAccounts()).filter(
				(m) =>
					m.account.marketState.toBase58() in
					approvedMarketStatePublicKeyStrings
			);
		} else return [];
	} catch {
		return [];
	}
};

export const fetchAllResolvedMarketConfigAccounts = async () => {
	try {
		const resolvedMarketStatePublicKeyStrings = (
			await fetchAllResolvedMarketStateAccounts()
		).map((m) => m.publicKey.toBase58());

		if (resolvedMarketStatePublicKeyStrings) {
			return (await fetchAllMarketConfigAccounts()).filter(
				(m) =>
					m.account.marketState.toBase58() in
					resolvedMarketStatePublicKeyStrings
			);
		} else return [];
	} catch {
		return [];
	}
};

export const fetchAllProposedMarketConfigAccounts = async (creator: string) => {
	try {
		return (await fetchAllMarketConfigAccounts()).filter(
			(m) => m.account.creator.toBase58() == creator
		);
	} catch {
		return [];
	}
};

export const fetchPositionAccount = async (position: string) => {
	try {
		const positionPubKey = new PublicKey(position);
		return await program.account.position.fetch(positionPubKey);
	} catch {
		return null;
	}
};

export const fetchAllUserPositionAccounts = async (user: string) => {
	try {
		return (await program.account.position.all()).filter(
			(p) => p.account.user.toBase58() == user
		);
	} catch {
		return [];
	}
};
