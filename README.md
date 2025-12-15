# Curney Markets: Permissionless Non-Binary *Precision* Markets

Curney is a permissionless prediction market protocol for continuous numerical outcomes, rewarding users based on the accuracy of their forecasts.

Unlike traditional prediction markets that force a binary choice (Yes/No) or a predefined spread of outcomes, Curney allows users to stake on any numerical value (e.g., asset prices, metrics, or real-world statistics) and earn rewards proportional to the proximity of their prediction to the final resolved value.

Curney ensures mathematical fairness, strategic richness, and solvency through its unique decay-based scoring curve.

## Key Innovations  

Curney introduces two core mechanics that transform the prediction market landscape:

### 1. Symmetrical Accuracy-Based Reward System

We replace the harsh cutoffs of binary markets with a smooth, Gaussian-style accuracy curve.

- Continuous Reward: Rewards scale smoothly and symmetrically based on the margin of accuracy, meaning even near-accurate predictions earn meaningful returns.

- Precision Focus: The system is designed to reward precision. The closer your prediction is to the final resolved value, the higher your relative score and the larger your share of the total market pool.

- Solvency: At settlement, the protocol distributes the entire pool according to each participant's relative Gaussian score, guaranteeing the market is always solvent and fair.

### 2. Time-Bound Decay Function

This strategic mechanism dynamically adjusts the "margin for error" in the scoring curve (σ) based on when a prediction is submitted.

The goal is to mathematically enforce the principle that early risk merits greater forgiveness, while later predictions, benefiting from more current market data, require greater precision.

This makes Curney resistant to last-minute "sniping", creating a more strategic and equitable platform for all participants.

## Protocol Architecture & Features

- Permissionless Market Creation: Any user can propose a market based on any verifiable continuous numerical outcome. Market proposals comes with a little fee to prevent spam.

- Admin Approval: While creation is permissionless, markets must be approved by the platform admin before going live to ensure data source integrity and valid resolution criteria. If a market is dismissed, half the cost of the proposal fee is returned to the creator.

- Creator Rewards: Market creators earn a share of platform fees generated from all positions placed in their successful markets.

- Transparency: The entire state is designed to be queryable on-chain, promoting clarity and mathematical soundness.

- User Experience: Optimized for a clean, intuitive user experience.

## Pseudo Whitepaper

### Scoring Formula

Every prediction $P_i$ is evaluated against the resolved value $R$ using a Gaussian-style function to determine the raw score $S_i$. This score is a measure of proximity plus the Time-Bound Decay Function and the adjusted standard deviation ($σ$).

The raw score $S_i$ for a participant $i$ is proportional to the probability density function, calculated as:

$$S_i \propto e^{-\frac{(R - P_i)^2}{2\sigma(t)^2}}$$

Where:

- $R$ is the **Resolved Value** (the final outcome).
- $P_i$ is the **Participant's Prediction**.
- $\sigma(t)$ is the **Time-Bound Standard Deviation** (margin for error), which is a function of time $t$.

### Decay Function

The Time-Bound Decay Function ensures early predictions carry a higher margin of error ($\sigma_{max}$) than late predictions ($\sigma_{min}$). This is mathematically achieved by making the standard deviation ($\sigma$) decay over the market's total lifespan ($T$).

We utilize a simple linear decay model for $\sigma(t)$:

$$\sigma(t) = \sigma_{min} + (\sigma_{max} - \sigma_{min}) \cdot \left(1 - \frac{t}{T}\right)$$

Where:

- $t$ is the **Time of Prediction** relative to market creation.
- $T$ is the **Total Market Lifespan** (creation to resolution).
- $\sigma_{max}$ is the maximum standard deviation (at $t=0$).
- $\sigma_{min}$ is the minimum standard deviation (at $t=T$).

#### 3. Reward Distribution

The total reward pool is distributed to participants based on their **relative score** at settlement.

A participant's final reward share ($W_i$) is the proportion of their individual score $S_i$ relative to the sum of all participant scores ($\sum S$).

$$W_i = \frac{S_i}{\sum S}$$

The final reward payout to participant $i$ is $W_i$ multiplied by the total staked pool (minus platform fees).

### Contact

For project updates, announcements, and news, follow us on X [@curneymarkets](https://x.com/curneymarkets)

### Demo

[![Curney Markets](https://i.ytimg.com/vi/nQkyiKDRzKg/maxresdefault.jpg)](https://www.youtube.com/watch?v=nQkyiKDRzKg&feature=youtu.be "Curney Market")
