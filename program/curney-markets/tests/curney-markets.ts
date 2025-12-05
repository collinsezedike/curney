import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CurneyMarkets } from "../target/types/curney_markets";
import { expect } from "chai";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

const SYSTEM_PROGRAM_ID = anchor.web3.SystemProgram.programId;

async function generateAndAirdropSigner(
	provider: anchor.AnchorProvider
): Promise<anchor.web3.Keypair> {
	const keypair = anchor.web3.Keypair.generate();
	const signature = await provider.connection.requestAirdrop(
		keypair.publicKey,
		5 * anchor.web3.LAMPORTS_PER_SOL
	);
	const { blockhash, lastValidBlockHeight } =
		await provider.connection.getLatestBlockhash();
	await provider.connection.confirmTransaction({
		blockhash,
		lastValidBlockHeight,
		signature,
	});
	return keypair;
}

describe("curney-markets", () => {
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.curneyMarkets as Program<CurneyMarkets>;

	let admin: anchor.web3.Keypair;
	let creator: anchor.web3.Keypair;
	let user: anchor.web3.Keypair;
	let platformConfig: anchor.web3.PublicKey;
	let platformTreasury: anchor.web3.PublicKey;
	let marketConfig: anchor.web3.PublicKey;
	let marketState: anchor.web3.PublicKey;
	let marketVault: anchor.web3.PublicKey;
	let position: anchor.web3.PublicKey;

	const creatorFeeBps = 1000;
	const platformFeeBps = 1000;
	const marketProposalFee = new anchor.BN(
		0.01 * anchor.web3.LAMPORTS_PER_SOL
	);

	const marketId = new anchor.BN(Math.floor(Math.random() * 1e17).toString());
	const startTime = new anchor.BN(new Date().getTime() / 1000 + 1); // Added a second extra to hedge against program checks
	const endTime = new anchor.BN(new Date().getTime() / 1000 + 7200); // 2 hours later
	const minPredictionPrice = new anchor.BN(
		0.01 * anchor.web3.LAMPORTS_PER_SOL
	);
	const question =
		"What will be the price of SOL at exactly 12:00 PM EST on January 1, 2026?";
	const description =
		"This market will resolve to a single numerical value based on an authoritative data source at a specific point in time.";

	const prediction = new anchor.BN(140);
	const stakeAmount = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL);

	before(async () => {
		// admin = anchor.getProvider().wallet.payer;
		admin = await generateAndAirdropSigner(provider);
		creator = await generateAndAirdropSigner(provider);
		user = await generateAndAirdropSigner(provider);

		[platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("platform-config"), admin.publicKey.toBuffer()],
			program.programId
		);

		[platformTreasury] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("platform-treasury"), platformConfig.toBuffer()],
			program.programId
		);

		[marketConfig] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("market-config"),
				marketId.toBuffer("le", 8),
				platformConfig.toBuffer(),
			],
			program.programId
		);

		[marketState] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("market-state"),
				marketConfig.toBuffer(),
				platformConfig.toBuffer(),
			],
			program.programId
		);

		[marketVault] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("market-vault"), marketConfig.toBuffer()],
			program.programId
		);
	});

	it("should initialize platform config", async () => {
		await program.methods
			.initializePlatform(
				creatorFeeBps,
				platformFeeBps,
				marketProposalFee
			)
			.accountsStrict({
				admin: admin.publicKey,
				platformConfig,
				platformTreasury,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([admin])
			.rpc();

		const platformConfigAccount =
			await program.account.platformConfig.fetch(platformConfig);
		expect(platformConfigAccount.creatorFeeBps).to.equal(creatorFeeBps);
		expect(platformConfigAccount.platformFeeBps).to.equal(platformFeeBps);
		expect(platformConfigAccount.marketProposalFee.toNumber()).to.equal(
			marketProposalFee.toNumber()
		);
		expect(platformConfigAccount.admin.toBase58()).equals(
			admin.publicKey.toBase58()
		);
	});

	it("should propose a market", async () => {
		await program.methods
			.proposeMarket(
				marketId,
				startTime,
				endTime,
				minPredictionPrice,
				question,
				description
			)
			.accountsStrict({
				creator: creator.publicKey,
				platformConfig,
				platformTreasury,
				marketConfig,
				marketState,
				marketVault,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([creator])
			.rpc();

		const marketConfigAccount = await program.account.marketConfig.fetch(
			marketConfig
		);
		expect(marketConfigAccount.question).to.equal(question);
		expect(marketConfigAccount.description).to.equal(description);
		expect(marketConfigAccount.marketId.toString()).to.equal(
			marketId.toString()
		);
		expect(marketConfigAccount.minPredictionPrice.toNumber()).to.equal(
			minPredictionPrice.toNumber()
		);
		expect(marketConfigAccount.startTime.toNumber()).to.equal(
			startTime.toNumber()
		);
		expect(marketConfigAccount.endTime.toNumber()).to.equal(
			endTime.toNumber()
		);
		expect(marketConfigAccount.creator.toBase58()).equals(
			creator.publicKey.toBase58()
		);
		expect(marketConfigAccount.marketState.toBase58()).equals(
			marketState.toBase58()
		);

		const marketStateAccount = await program.account.marketState.fetch(
			marketState
		);
		expect(marketStateAccount.isApproved).to.be.false;
		expect(marketStateAccount.isResolved).to.be.false;
		expect(marketStateAccount.resolution).to.be.null;
		expect(marketStateAccount.totalPool.toNumber()).to.equal(0);
		expect(marketStateAccount.totalPositions.toNumber()).to.equal(0);
		expect(marketStateAccount.marketConfig.toBase58()).equals(
			marketConfig.toBase58()
		);
	});

	it("should update market config", async () => {
		const newEndTime = new anchor.BN(new Date().getTime() / 1000 + 7200); // 2 hours later
		const newQuestion =
			"What will be the price of SOL at exactly 12:00 PM EST on January 1, 2026?";
		const newDescription =
			"This market will resolve to a single numerical value based on an authoritative data source at a specific point in time.";

		await program.methods
			.updateMarketConfig(
				null, // Not updating the start time
				newEndTime,
				null, // Not updating the min prediction price
				newQuestion,
				newDescription
			)
			.accountsStrict({
				admin: admin.publicKey,
				marketConfig,
				marketState,
				platformConfig,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([admin])
			.rpc();

		const marketConfigAccount = await program.account.marketConfig.fetch(
			marketConfig
		);
		expect(marketConfigAccount.question).to.equal(newQuestion);
		expect(marketConfigAccount.description).to.equal(newDescription);
		expect(marketConfigAccount.endTime.toNumber()).to.equal(
			newEndTime.toNumber()
		);
		expect(marketConfigAccount.startTime.toNumber()).to.equal(
			startTime.toNumber()
		); // Unchanged
		expect(marketConfigAccount.minPredictionPrice.toNumber()).to.equal(
			minPredictionPrice.toNumber()
		); // Unchanged
	});

	it("should approve a market", async () => {
		await program.methods
			.approveMarket()
			.accountsStrict({
				admin: admin.publicKey,
				marketConfig,
				marketState,
				platformConfig,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([admin])
			.rpc();

		const marketStateAccount = await program.account.marketState.fetch(
			marketState
		);
		expect(marketStateAccount.isApproved).to.be.true;
	});

	it("should place a prediction", async () => {
		const state = await program.account.marketState.fetch(marketState);
		[position] = anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("position"),
				state.totalPositions.toBuffer("le", 8),
				user.publicKey.toBuffer(),
				marketConfig.toBuffer(),
			],
			program.programId
		);

		await program.methods
			.placePrediction(prediction, stakeAmount)
			.accountsStrict({
				user: user.publicKey,
				marketConfig,
				marketState,
				marketVault,
				platformConfig,
				position,
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([user])
			.rpc();

		const positionAccount = await program.account.position.fetch(position);
		expect(positionAccount.reward).to.be.null;
		expect(positionAccount.claimed).to.be.false;
		expect(positionAccount.stake.toNumber()).to.equal(
			stakeAmount.toNumber()
		);
		expect(positionAccount.prediction.toNumber()).to.equal(
			prediction.toNumber()
		);
		expect(positionAccount.market.toBase58()).equals(
			marketConfig.toBase58()
		);
		expect(positionAccount.user.toBase58()).equals(
			user.publicKey.toBase58()
		);
	});
});
