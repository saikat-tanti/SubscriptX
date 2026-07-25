import { formatXlm, formatInterval, truncateAddress } from "../lib/utils";
import { DEFAULT_CONFIG } from "../lib/stellar";

describe("SubscriptX Utilities & Config Unit Tests", () => {
  test("formatXlm formats numbers cleanly", () => {
    expect(formatXlm(1000)).toBe("1,000");
    expect(formatXlm(25.5)).toBe("25.5");
  });

  test("truncateAddress truncates Stellar G-Addresses", () => {
    const address = "GDB5M6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3";
    expect(truncateAddress(address)).toBe("GDB5...H2I3");
    expect(truncateAddress(null)).toBe("");
  });

  test("formatInterval maps interval seconds correctly", () => {
    expect(formatInterval(86400)).toBe("Daily");
    expect(formatInterval(604800)).toBe("Weekly");
    expect(formatInterval(2592000)).toBe("Monthly");
    expect(formatInterval(31536000)).toBe("Annual");
  });

  test("DEFAULT_CONFIG contains correct Stellar Testnet RPC parameters", () => {
    expect(DEFAULT_CONFIG.network).toBe("TESTNET");
    expect(DEFAULT_CONFIG.sorobanRpcUrl).toBe("https://soroban-testnet.stellar.org");
    expect(DEFAULT_CONFIG.horizonUrl).toBe("https://horizon-testnet.stellar.org");
  });
});
