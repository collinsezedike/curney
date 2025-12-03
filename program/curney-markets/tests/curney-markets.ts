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
	let platformConfig: anchor.web3.PublicKey;
	let platformTreasury: anchor.web3.PublicKey;

	const creatorFeeBps = 1000;
	const platformFeeBps = 1000;
	const marketProposalFee = new anchor.BN(
		0.01 * anchor.web3.LAMPORTS_PER_SOL
	);

	before(async () => {
		// admin = anchor.getProvider().wallet.payer;
		admin = await generateAndAirdropSigner(provider);

		[platformConfig] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("platform-config"), admin.publicKey.toBuffer()],
			program.programId
		);

		[platformTreasury] = anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("platform-treasury"), platformConfig.toBuffer()],
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
});
