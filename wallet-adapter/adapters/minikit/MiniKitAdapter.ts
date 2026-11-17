import { initializeEruda } from '../../lib';
import {
  WalletAdapter,
  Account,
  AdapterId,
  WalletConfigs,
  SentTransaction,
  TransactionError,
  TransactionRequest,
} from '../../core';
import { MiniKit } from '@worldcoin/minikit-js';
import type { CommandResultByVia, MiniKitWalletAuthOptions, WalletAuthResult } from '@worldcoin/minikit-js/commands';
import { type Chain, type Hex, isHex, toHex } from 'viem';
import { worldchain } from 'viem/chains';
import { toTransactionError } from './errors';

/** Resolves a user-operation hash to its status / mined tx hash. Documented as public (no auth). */
const USER_OP_STATUS_URL = 'https://developer.world.org/api/v2/minikit/userop';
const USER_OP_POLL_INTERVAL_MS = 2_000;
const USER_OP_TIMEOUT_MS = 120_000;

interface UserOpStatus {
  status: 'pending' | 'success' | 'failed';
  transaction_hash: Hex | null;
}

export class MiniKitAdapter extends WalletAdapter {
  private _appId?: string;
  private _installed = false;

  /** `chain` lets the app supply World Chain with its own RPC list. */
  constructor(appId?: string, chain: Chain = worldchain) {
    super([chain]);
    this._appId = appId;
  }

  get id(): AdapterId {
    return 'minikit-wallet-adapter';
  }

  get name(): string {
    return 'MiniKit Wallet';
  }

  get isMinikitEnvironment() {
    return this._installed;
  }

  private install() {
    if (this._installed) return;
    const result = MiniKit.install(this._appId);
    this._installed = result.success || result.errorCode === 'app_out_of_date';
    if (!result.success) console.warn('MiniKit install:', result.errorCode, result.errorMessage);
  }

  async initialize() {
    // Load the debug console first so it's available even if MiniKit setup fails
    await initializeEruda().catch((error) => console.error('eruda initialization error:', error));
    this.install();
    if (!this.isMinikitEnvironment) throw new Error('Not in MiniApp Environment');
    if (this.adapterOptions.length === 1) return;
    try {
      this.addAdapterOption({
        id: 'minikit-wallet',
        name: 'MiniKit Wallet',
        icon: '',
      });
      this.updateChain(worldchain.id);
    } catch (error) {
      console.error('initialization error:', error);
    }
    this.updateStatus('initialized');
  }

  async initialConnect(adapterOptionId: string): Promise<void> {
    await this.connect(adapterOptionId);
  }

  async connect(adapterOptionId: string) {
    this.updateStatus('connecting');
    const input = {
      nonce: 'randomnonce123456',
    } satisfies MiniKitWalletAuthOptions;
    this.updateChain(worldchain.id);
    try {
      const result: CommandResultByVia<WalletAuthResult> = await MiniKit.walletAuth(input);
      const account = result.data.address as Account;
      WalletConfigs.adapterOptionId = adapterOptionId;
      this.updateAccounts([account]);
    } catch (error) {
      console.error('Command failed', error);
      this.updateAccounts([]);
    }
  }

  async disconnect(): Promise<void> {
    this.resetState();
  }

  async switchAccount(account: Account): Promise<void> {
    throw new Error('Switching account not supported');
  }

  async switchChain(chainId: number): Promise<void> {
    throw new Error('Switching chain not supported');
  }

  async sendTransaction(request: TransactionRequest): Promise<SentTransaction> {
    this.assertSendable(request);
    const { chainId, calls } = request;
    const transactions = calls.map(({ to, data, value }) => ({ to, data: data ?? '0x', value: toHex(value ?? BigInt(0)) }));
    console.info(`[${this.id}] sendTransaction`, { chainId, from: this.activeAccount, transactions });

    let userOpHash: string;
    try {
      const result = await MiniKit.sendTransaction({ chainId, transactions });
      console.info(`[${this.id}] sendTransaction result`, result);
      userOpHash = (result.data as { userOpHash?: string }).userOpHash ?? '';
    } catch (error) {
      const txError = toTransactionError(error);
      // `NotWhitelisted` (invalid_contract): every `to` address being called must be listed under
      // Developer Portal > Mini App > Permissions > Contract Entrypoints. For an ERC20 transfer that
      // is the token contract itself; the Permit2 Tokens list only covers Permit2 signature transfers.
      console.error(`[${this.id}] sendTransaction failed`, { code: txError.code, hint: txError.hint, error });
      throw txError;
    }

    if (!isHex(userOpHash)) {
      throw new TransactionError('Unknown', 'World App did not return a transaction id', `userOpHash: ${userOpHash}`);
    }
    return { id: userOpHash, wait: () => this.waitForUserOperation(chainId, userOpHash as Hex) };
  }

  /** MiniKit resolves on submission with a user-op hash; poll until it's mined, then confirm the receipt. */
  private async waitForUserOperation(chainId: number, userOpHash: Hex): Promise<Hex> {
    const deadline = Date.now() + USER_OP_TIMEOUT_MS;
    while (Date.now() < deadline) {
      let status: UserOpStatus | null = null;
      try {
        const response = await fetch(`${USER_OP_STATUS_URL}/${userOpHash}`);
        if (response.ok) status = (await response.json()) as UserOpStatus;
        else console.warn(`[${this.id}] user-op status HTTP ${response.status}`, { userOpHash });
      } catch (error) {
        // Network/CORS hiccups are retried until the deadline.
        console.warn(`[${this.id}] user-op status request failed`, { userOpHash, error });
      }

      if (status) console.debug(`[${this.id}] user-op status`, { userOpHash, ...status });
      if (status?.status === 'failed') {
        throw new TransactionError('Reverted', 'Transaction failed', `User operation ${userOpHash} failed`);
      }
      if (status?.status === 'success' && status.transaction_hash) {
        return this.waitForReceipt(chainId, status.transaction_hash);
      }
      await new Promise((resolve) => setTimeout(resolve, USER_OP_POLL_INTERVAL_MS));
    }
    throw new TransactionError(
      'Timeout',
      'Transaction is taking longer than expected',
      `User operation ${userOpHash} not mined after ${USER_OP_TIMEOUT_MS / 1000}s — check World App activity`,
    );
  }
}
