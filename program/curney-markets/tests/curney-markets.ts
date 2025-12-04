import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CurneyMarkets } from "../target/types/curney_markets";
import { expect } from "chai";

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
	let platformConfig: anchor.web3.PublicKey;
	let platformTreasury: anchor.web3.PublicKey;
	let marketConfig: anchor.web3.PublicKey;
	let marketState: anchor.web3.PublicKey;

	const creatorFeeBps = 1000;
	const platformFeeBps = 1000;
	const marketProposalFee = new anchor.BN(
		0.01 * anchor.web3.LAMPORTS_PER_SOL
	);

	const marketId = new anchor.BN(Math.floor(Math.random() * 1e17).toString());
	const startTime = new anchor.BN(new Date().getTime() / 1000 + 60); // Added a minute extra to hedge against program checks
	const endTime = new anchor.BN(new Date().getTime() / 1000 + 7200); // 2 hours later
	const minPredictionPrice = new anchor.BN(
		0.01 * anchor.web3.LAMPORTS_PER_SOL
	);
	const question =
		"What will be the price of SOL at exactly 12:00 PM EST on January 1, 2026?";
	const description =
		"This market will resolve to a single numerical value based on an authoritative data source at a specific point in time.";

	before(async () => {
		// admin = anchor.getProvider().wallet.payer;
		admin = await generateAndAirdropSigner(provider);
		creator = await generateAndAirdropSigner(provider);

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
				systemProgram: SYSTEM_PROGRAM_ID,
			})
			.signers([creator])
			.rpc();
	});
});
