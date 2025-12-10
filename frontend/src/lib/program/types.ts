/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/curney_markets.json`.
 */
export type CurneyMarkets = {
	address: "HDowPKaGVPenpmncAMK5amt1i6XR8GteGSBNscbMLKcW";
	metadata: {
		name: "curneyMarkets";
		version: "0.1.0";
		spec: "0.1.0";
		description: "Created with Anchor";
	};
	instructions: [
		{
			name: "approveMarket";
			discriminator: [195, 83, 73, 224, 150, 237, 150, 5];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "marketConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [];
		},
		{
			name: "claimReward";
			discriminator: [149, 95, 181, 242, 94, 90, 158, 162];
			accounts: [
				{
					name: "user";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "platform_config.admin";
								account: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketVault";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									118,
									97,
									117,
									108,
									116
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "position";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 111, 115, 105, 116, 105, 111, 110];
							},
							{
								kind: "account";
								path: "position.index";
								account: "position";
							},
							{
								kind: "account";
								path: "user";
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [];
		},
		{
			name: "dismissMarket";
			discriminator: [138, 225, 164, 155, 53, 68, 6, 26];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "creator";
					writable: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "platformTreasury";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									116,
									114,
									101,
									97,
									115,
									117,
									114,
									121
								];
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketConfig";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketVault";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									118,
									97,
									117,
									108,
									116
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [];
		},
		{
			name: "initializePlatform";
			discriminator: [119, 201, 101, 45, 75, 122, 89, 3];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "platformTreasury";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									116,
									114,
									101,
									97,
									115,
									117,
									114,
									121
								];
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "creatorFeeBps";
					type: "u16";
				},
				{
					name: "platformFeeBps";
					type: "u16";
				},
				{
					name: "marketProposalFee";
					type: "u64";
				}
			];
		},
		{
			name: "placePrediction";
			discriminator: [79, 46, 195, 197, 50, 91, 88, 229];
			accounts: [
				{
					name: "user";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "platform_config.admin";
								account: "platformConfig";
							}
						];
					};
				},
				{
					name: "platformTreasury";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									116,
									114,
									101,
									97,
									115,
									117,
									114,
									121
								];
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketVault";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									118,
									97,
									117,
									108,
									116
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "position";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 111, 115, 105, 116, 105, 111, 110];
							},
							{
								kind: "account";
								path: "market_state.total_positions";
								account: "marketState";
							},
							{
								kind: "account";
								path: "user";
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "prediction";
					type: "i64";
				},
				{
					name: "stakeAmount";
					type: "u64";
				}
			];
		},
		{
			name: "proposeMarket";
			discriminator: [39, 201, 255, 2, 194, 181, 58, 105];
			accounts: [
				{
					name: "creator";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "platform_config.admin";
								account: "platformConfig";
							}
						];
					};
				},
				{
					name: "platformTreasury";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									116,
									114,
									101,
									97,
									115,
									117,
									114,
									121
								];
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketConfig";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "arg";
								path: "marketId";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketVault";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									118,
									97,
									117,
									108,
									116
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "marketId";
					type: "u64";
				},
				{
					name: "startTime";
					type: "i64";
				},
				{
					name: "endTime";
					type: "i64";
				},
				{
					name: "minPredictionPrice";
					type: "u64";
				},
				{
					name: "question";
					type: "string";
				},
				{
					name: "description";
					type: "string";
				}
			];
		},
		{
			name: "resolveMarket";
			discriminator: [155, 23, 80, 173, 46, 74, 23, 239];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "marketConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "resolution";
					type: "i64";
				},
				{
					name: "totalScores";
					type: "u128";
				}
			];
		},
		{
			name: "updateMarketConfig";
			discriminator: [91, 87, 149, 101, 110, 116, 16, 120];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "marketConfig";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "startTime";
					type: {
						option: "i64";
					};
				},
				{
					name: "endTime";
					type: {
						option: "i64";
					};
				},
				{
					name: "minPredictionPrice";
					type: {
						option: "u64";
					};
				},
				{
					name: "question";
					type: {
						option: "string";
					};
				},
				{
					name: "description";
					type: {
						option: "string";
					};
				}
			];
		},
		{
			name: "updatePlatformConfig";
			discriminator: [195, 60, 76, 129, 146, 45, 67, 143];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "creatorFeeBps";
					type: {
						option: "u16";
					};
				},
				{
					name: "platformFeeBps";
					type: {
						option: "u16";
					};
				},
				{
					name: "marketProposalFee";
					type: {
						option: "u64";
					};
				}
			];
		},
		{
			name: "withdrawCreatorRevenue";
			discriminator: [17, 179, 212, 249, 155, 191, 74, 159];
			accounts: [
				{
					name: "creator";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "platform_config.admin";
								account: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "market_config.market_id";
								account: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketState";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									115,
									116,
									97,
									116,
									101
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "marketVault";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									109,
									97,
									114,
									107,
									101,
									116,
									45,
									118,
									97,
									117,
									108,
									116
								];
							},
							{
								kind: "account";
								path: "marketConfig";
							}
						];
					};
				},
				{
					name: "rent";
					address: "SysvarRent111111111111111111111111111111111";
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [];
		},
		{
			name: "withdrawPlatformFees";
			discriminator: [87, 24, 138, 122, 62, 146, 186, 199];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "platformConfig";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									99,
									111,
									110,
									102,
									105,
									103
								];
							},
							{
								kind: "account";
								path: "admin";
							}
						];
					};
				},
				{
					name: "platformTreasury";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									112,
									108,
									97,
									116,
									102,
									111,
									114,
									109,
									45,
									116,
									114,
									101,
									97,
									115,
									117,
									114,
									121
								];
							},
							{
								kind: "account";
								path: "platformConfig";
							}
						];
					};
				},
				{
					name: "rent";
					address: "SysvarRent111111111111111111111111111111111";
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [];
		}
	];
	accounts: [
		{
			name: "marketConfig";
			discriminator: [119, 255, 200, 88, 252, 82, 128, 24];
		},
		{
			name: "marketState";
			discriminator: [0, 125, 123, 215, 95, 96, 164, 194];
		},
		{
			name: "platformConfig";
			discriminator: [160, 78, 128, 0, 248, 83, 230, 160];
		},
		{
			name: "position";
			discriminator: [170, 188, 143, 228, 122, 64, 247, 208];
		}
	];
	errors: [
		{
			code: 6000;
			name: "rewardAlreadyClaimed";
			msg: "Position reward already claimed";
		},
		{
			code: 6001;
			name: "invalidDecay";
			msg: "The decay factor must be greater than zero";
		}
	];
	types: [
		{
			name: "marketConfig";
			type: {
				kind: "struct";
				fields: [
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "vaultBump";
						type: "u8";
					},
					{
						name: "marketId";
						type: "u64";
					},
					{
						name: "startTime";
						type: "i64";
					},
					{
						name: "endTime";
						type: "i64";
					},
					{
						name: "minPredictionPrice";
						type: "u64";
					},
					{
						name: "question";
						type: "string";
					},
					{
						name: "description";
						type: "string";
					},
					{
						name: "creator";
						type: "pubkey";
					},
					{
						name: "marketState";
						type: "pubkey";
					}
				];
			};
		},
		{
			name: "marketState";
			type: {
				kind: "struct";
				fields: [
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "decay";
						type: "u64";
					},
					{
						name: "isApproved";
						type: "bool";
					},
					{
						name: "isResolved";
						type: "bool";
					},
					{
						name: "resolution";
						type: {
							option: "i64";
						};
					},
					{
						name: "totalPool";
						type: "u64";
					},
					{
						name: "totalPositions";
						type: "u64";
					},
					{
						name: "totalScores";
						type: {
							option: "u128";
						};
					},
					{
						name: "creatorFeeRevenue";
						type: "u64";
					},
					{
						name: "marketConfig";
						type: "pubkey";
					}
				];
			};
		},
		{
			name: "platformConfig";
			type: {
				kind: "struct";
				fields: [
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "treasuryBump";
						type: "u8";
					},
					{
						name: "creatorFeeBps";
						type: "u16";
					},
					{
						name: "platformFeeBps";
						type: "u16";
					},
					{
						name: "marketProposalFee";
						type: "u64";
					},
					{
						name: "admin";
						type: "pubkey";
					}
				];
			};
		},
		{
			name: "position";
			type: {
				kind: "struct";
				fields: [
					{
						name: "claimed";
						type: "bool";
					},
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "stake";
						type: "u64";
					},
					{
						name: "decay";
						type: "u64";
					},
					{
						name: "index";
						type: "u64";
					},
					{
						name: "reward";
						type: {
							option: "u64";
						};
					},
					{
						name: "timestamp";
						type: "i64";
					},
					{
						name: "prediction";
						type: "i64";
					},
					{
						name: "user";
						type: "pubkey";
					},
					{
						name: "market";
						type: "pubkey";
					}
				];
			};
		}
	];
	constants: [
		{
			name: "marketConfigSeed";
			type: "bytes";
			value: "[109, 97, 114, 107, 101, 116, 45, 99, 111, 110, 102, 105, 103]";
		},
		{
			name: "marketStateSeed";
			type: "bytes";
			value: "[109, 97, 114, 107, 101, 116, 45, 115, 116, 97, 116, 101]";
		},
		{
			name: "marketVaultSeed";
			type: "bytes";
			value: "[109, 97, 114, 107, 101, 116, 45, 118, 97, 117, 108, 116]";
		},
		{
			name: "platformConfigSeed";
			type: "bytes";
			value: "[112, 108, 97, 116, 102, 111, 114, 109, 45, 99, 111, 110, 102, 105, 103]";
		},
		{
			name: "platformTreasurySeed";
			type: "bytes";
			value: "[112, 108, 97, 116, 102, 111, 114, 109, 45, 116, 114, 101, 97, 115, 117, 114, 121]";
		},
		{
			name: "positionSeed";
			type: "bytes";
			value: "[112, 111, 115, 105, 116, 105, 111, 110]";
		}
	];
};
