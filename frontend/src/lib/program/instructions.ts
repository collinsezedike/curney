import * as anchor from "@coral-xyz/anchor";
import {
	clusterApiUrl,
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	TransactionInstruction,
	TransactionMessage,
	VersionedTransaction,
} from "@solana/web3.js";

import IDL from "./idl.json";
import type { CurneyMarkets } from "./types";

interface UpdateMarketConfigParams {
	marketId: string;
	admin: PublicKey;
	startTime?: number;
	endTime?: number;
	minPredictionPrice?: number;
	question?: string;
	description?: string;
}

const FIXED_POINT_SCALE = 1e9;
const DECAY_NORMALIZATION_FACTOR = 3600;
const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

const PLATFORM_CONFIG = new PublicKey(
	"32a2kKSydtMVzkE92BnNMAh5RTfk2i8owDNt32tqkBSE"
);
const PLATFORM_TREASURY = new PublicKey(
	"32a2kKSydtMVzkE92BnNMAh5RTfk2i8owDNt32tqkBSE"
);

const calculateTotalScores = async (
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

export const connection = new Connection(clusterApiUrl("devnet"), {
	commitment: "confirmed",
});

const program = new anchor.Program<CurneyMarkets>(IDL, { connection });

const getMarketConfigPDA = (marketId: string) => {
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

const getMarketStatePDA = (marketConfig: PublicKey) => {
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

const getMarketVaultPDA = (marketConfig: PublicKey) => {
	const [marketVault] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("market-vault"), marketConfig.toBuffer()],
		program.programId
	);
	return marketVault;
};

const getPositionPDA = (
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

const buildTransaction = async (
	feePayer: PublicKey,
	instructions: TransactionInstruction[]
): Promise<VersionedTransaction> => {
	const latestBlockhash = await connection.getLatestBlockhash();
	const message = new TransactionMessage({
		instructions,
		payerKey: feePayer,
		recentBlockhash: latestBlockhash.blockhash,
	}).compileToV0Message();
	return new VersionedTransaction(message);
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

export const proposeMarket = async (
	question: string,
	description: string,
	startTime: number,
	endTime: number,
	minPredictionPrice: number,
	user: PublicKey
) => {
	const marketId = Math.floor(Math.random() * 1e17).toString();
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);
	const marketVault = getMarketVaultPDA(marketConfig);

	const ix = await program.methods
		.proposeMarket(
			new anchor.BN(marketId),
			new anchor.BN(startTime),
			new anchor.BN(endTime),
			new anchor.BN(minPredictionPrice * LAMPORTS_PER_SOL),
			question,
			description
		)
		.accountsStrict({
			creator: user,
			marketConfig,
			marketState,
			marketVault,
			platformConfig: PLATFORM_CONFIG,
			platformTreasury: PLATFORM_TREASURY,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(user, [ix]);
};

export const updateMarketConfig = async ({
	marketId,
	admin,
	startTime,
	endTime,
	minPredictionPrice,
	question,
	description,
}: UpdateMarketConfigParams) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);

	const ix = await program.methods
		.updateMarketConfig(
			startTime ? new anchor.BN(startTime) : null,
			endTime ? new anchor.BN(endTime) : null,
			minPredictionPrice
				? new anchor.BN(minPredictionPrice * LAMPORTS_PER_SOL)
				: null,
			question ? question : null,
			description ? description : null
		)
		.accountsStrict({
			admin,
			marketConfig,
			marketState,
			platformConfig: PLATFORM_CONFIG,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};

export const approveMarket = async (marketId: string, admin: PublicKey) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);

	const ix = await program.methods
		.approveMarket()
		.accountsStrict({
			admin,
			marketConfig,
			marketState,
			platformConfig: PLATFORM_CONFIG,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};

export const placePrediction = async (
	marketId: string,
	prediction: number,
	stakeAmount: number,
	currentIndex: number,
	user: PublicKey
) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);
	const marketVault = getMarketVaultPDA(marketConfig);
	const position = getPositionPDA(currentIndex, marketConfig, user);

	const ix = await program.methods
		.placePrediction(
			new anchor.BN(prediction),
			new anchor.BN(stakeAmount * LAMPORTS_PER_SOL)
		)
		.accountsStrict({
			user,
			position,
			marketConfig,
			marketState,
			marketVault,
			platformConfig: PLATFORM_CONFIG,
			platformTreasury: PLATFORM_TREASURY,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(user, [ix]);
};

export const resolveMarket = async (
	marketId: string,
	resolution: number,
	admin: PublicKey
) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);
	const totalScores = await calculateTotalScores(
		resolution,
		program,
		marketConfig
	);

	const ix = await program.methods
		.resolveMarket(new anchor.BN(resolution), totalScores)
		.accountsStrict({
			admin,
			marketConfig,
			marketState,
			platformConfig: PLATFORM_CONFIG,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};
