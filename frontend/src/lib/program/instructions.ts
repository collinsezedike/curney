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

import {
	calculateTotalScores,
	connection,
	getMarketConfigPDA,
	getMarketStatePDA,
	getMarketVaultPDA,
	getPositionPDA,
	PLATFORM_CONFIG,
	PLATFORM_TREASURY,
	program,
} from "./utils";

const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

const RENT_SYSVAR_ACCOUNT = anchor.web3.SYSVAR_RENT_PUBKEY;
interface UpdateMarketConfigParams {
	marketId: string;
	admin: PublicKey;
	startTime?: number;
	endTime?: number;
	minPredictionPrice?: number;
	question?: string;
	description?: string;
}

interface UpdatePlatformConfigParams {
	admin: PublicKey;
	creatorFeeBps?: number;
	platformFeeBps?: number;
	marketProposalFee?: number;
}

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

export const dismissMarket = async (
	marketId: string,
	creator: string,
	admin: PublicKey
) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);
	const marketVault = getMarketVaultPDA(marketConfig);
	const creatorPubkey = new PublicKey(creator);

	const ix = await program.methods
		.dismissMarket()
		.accountsStrict({
			admin,
			creator: creatorPubkey,
			marketConfig,
			marketState,
			marketVault,
			platformConfig: PLATFORM_CONFIG,
			platformTreasury: PLATFORM_TREASURY,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
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

export const claimReward = async (
	marketConfig: string,
	position: string,
	user: PublicKey
) => {
	const marketConfigPubkey = new PublicKey(marketConfig);
	const marketState = getMarketStatePDA(marketConfigPubkey);
	const marketVault = getMarketVaultPDA(marketConfigPubkey);
	const positionPubkey = new PublicKey(position);

	const ix = await program.methods
		.claimReward()
		.accountsStrict({
			user,
			position: positionPubkey,
			marketConfig: marketConfigPubkey,
			marketState,
			marketVault,
			platformConfig: PLATFORM_CONFIG,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(user, [ix]);
};

export const withdrawCreatorRevenue = async (
	marketId: string,
	creator: PublicKey
) => {
	const marketConfig = getMarketConfigPDA(marketId);
	const marketState = getMarketStatePDA(marketConfig);
	const marketVault = getMarketVaultPDA(marketConfig);

	const ix = await program.methods
		.withdrawCreatorRevenue()
		.accountsStrict({
			creator,
			marketConfig,
			marketState,
			marketVault,
			platformConfig: PLATFORM_CONFIG,
			rent: RENT_SYSVAR_ACCOUNT,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(creator, [ix]);
};

export const withdrawPlatformFees = async (admin: PublicKey) => {
	const ix = await program.methods
		.withdrawPlatformFees()
		.accountsStrict({
			admin,
			platformConfig: PLATFORM_CONFIG,
			platformTreasury: PLATFORM_TREASURY,
			rent: RENT_SYSVAR_ACCOUNT,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};

export const updatePlatformConfig = async ({
	admin,
	creatorFeeBps,
	platformFeeBps,
	marketProposalFee,
}: UpdatePlatformConfigParams) => {
	const ix = await program.methods
		.updatePlatformConfig(
			creatorFeeBps ? creatorFeeBps : null,
			platformFeeBps ? platformFeeBps : null,
			marketProposalFee ? new anchor.BN(marketProposalFee) : null
		)
		.accountsStrict({
			admin,
			platformConfig: PLATFORM_CONFIG,
			systemProgram: SYSTEM_PROGRAM_ID,
		})
		.instruction();

	return await buildTransaction(admin, [ix]);
};
