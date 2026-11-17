import {
  BaseError,
  formatUnits,
  HttpRequestError,
  ReadContractReturnType,
  RpcRequestError,
  TimeoutError,
} from 'viem';
import { getPublicClient, PublicClientOptions, ReadContractFunctionArgs } from '../public-client';
import { Address } from '@/wallet-adapter';
import { ERC20_ABI } from './ERC20_ABI';
import { ReadContractFunctionName } from '../public-client';
import { FIXED_DECIMALS } from '@/configs';
import { getChainConfig, isNativeToken } from '@/configs/chain';

/**
 * Every reader below treats the zero address (NATIVE_TOKEN_ADDRESS) as the chain's native currency
 * and any other address as an ERC20 contract.
 */

export type ERC20ReadFunctionName = ReadContractFunctionName<ERC20_ABI>;

export type ERC20ReadFunctionArgs<TFunctionName extends ERC20ReadFunctionName> = ReadContractFunctionArgs<
  ERC20_ABI,
  TFunctionName
>;

export type ERC20ReadContractReturnType<
  TFunctionName extends ERC20ReadFunctionName,
  TFunctionArgs extends ERC20ReadFunctionArgs<TFunctionName>,
> = ReadContractReturnType<ERC20_ABI, TFunctionName, TFunctionArgs>;

export interface ERC20Args extends PublicClientOptions {
  address: Address;
}

export interface ERC20BalanceArgs extends ERC20Args {
  owner: Address;
}

export interface ERC20AllowanceArgs extends ERC20BalanceArgs {
  spender: Address;
}

export type ERC20FormatAmountArgs = {
  decimals: number;
  fixedDecimals?: number;
};

export type ERC20FormattedBalanceArgs = ERC20BalanceArgs & Partial<ERC20FormatAmountArgs>;

export type ERC20FormattedAllowanceArgs = ERC20AllowanceArgs & Partial<ERC20FormatAmountArgs>;

export interface ERC20ReadArgs<
  TFunctionName extends ERC20ReadFunctionName,
  TFunctionArgs extends ERC20ReadFunctionArgs<TFunctionName>,
> extends ERC20Args {
  functionName: TFunctionName;
  args: TFunctionArgs;
}

export async function read<
  TFunctionName extends ERC20ReadFunctionName,
  TFunctionArgs extends ERC20ReadFunctionArgs<TFunctionName>,
>({
  address,
  functionName,
  args,
  ...pcOptions
}: ERC20ReadArgs<TFunctionName, TFunctionArgs>): Promise<ERC20ReadContractReturnType<TFunctionName, TFunctionArgs>> {
  const publicClient = getPublicClient(pcOptions);
  try {
    return await publicClient.readContract({
      address,
      abi: ERC20_ABI,
      functionName,
      args,
    });
  } catch (error) {
    const rpcError = isRpcError(error);
    console.error(`[ERC20] ${functionName} failed (${rpcError ? 'RPC/network' : 'contract/other'} error)`, {
      chainId: pcOptions.chainId,
      rpcUrl: (publicClient.transport as { url?: string }).url,
      token: address,
      functionName,
      args,
      errorName: error instanceof BaseError ? error.name : undefined,
      shortMessage: error instanceof BaseError ? error.shortMessage : String(error),
      details: error instanceof BaseError ? error.details : undefined,
      error,
    });
    throw error;
  }
}

/** Short label shown in place of a balance that failed to load. */
export function balanceErrorLabel(error: unknown): string {
  return isRpcError(error) ? 'RPC Error' : 'Balance Error';
}

/** True when the failure came from the transport/RPC node rather than the contract itself. */
export function isRpcError(error: unknown): boolean {
  if (!(error instanceof BaseError)) return false;
  return !!error.walk(
    (e) => e instanceof HttpRequestError || e instanceof TimeoutError || e instanceof RpcRequestError,
  );
}

function nativeCurrency({ chainId }: PublicClientOptions) {
  return getChainConfig(chainId).chain.nativeCurrency;
}

export async function getName(args: ERC20Args): Promise<string> {
  if (isNativeToken(args.address)) return nativeCurrency(args).name;
  return await read({ ...args, functionName: 'name', args: [] });
}

export async function getSymbol(args: ERC20Args): Promise<string> {
  if (isNativeToken(args.address)) return nativeCurrency(args).symbol;
  return await read({ ...args, functionName: 'symbol', args: [] });
}

export async function getDecimals(args: ERC20Args): Promise<number> {
  if (isNativeToken(args.address)) return nativeCurrency(args).decimals;
  return await read({ ...args, functionName: 'decimals', args: [] });
}

export async function getSupply(args: ERC20Args): Promise<bigint> {
  return await read({ ...args, functionName: 'totalSupply', args: [] });
}

export async function getBalance({ owner, ...args }: ERC20BalanceArgs): Promise<bigint> {
  if (!isNativeToken(args.address)) return await read({ ...args, functionName: 'balanceOf', args: [owner] });

  const publicClient = getPublicClient(args);
  try {
    return await publicClient.getBalance({ address: owner });
  } catch (error) {
    console.error(`[ERC20] native balance failed (${isRpcError(error) ? 'RPC/network' : 'other'} error)`, {
      chainId: args.chainId,
      rpcUrl: (publicClient.transport as { url?: string }).url,
      owner,
      error,
    });
    throw error;
  }
}

export async function getAllowance({ owner, spender, ...args }: ERC20AllowanceArgs): Promise<bigint> {
  return await read({ ...args, functionName: 'allowance', args: [owner, spender] });
}

/** Sync formatter: full precision, or rounded to `fixedDecimals` (tiny non-zero amounts show as `< 0.0…1`). */
export function formatUnitsFixed(amount: bigint, decimals: number, fixedDecimals?: number): string {
  const formatted = formatUnits(amount, decimals);
  if (fixedDecimals && fixedDecimals >= 0) {
    const fixed = Number(Number(formatted).toFixed(fixedDecimals));
    return amount > BigInt(0) && fixed == 0 ? `< 0.${'0'.repeat(fixedDecimals - 1)}1` : `${fixed}`;
  }
  return formatted;
}

export async function formatAmount(amount: bigint, args: (ERC20Args & { fixedDecimals?: number }) | ERC20FormatAmountArgs): Promise<string> {
  const decimals = 'decimals' in args ? args.decimals : await getDecimals(args);
  return formatUnitsFixed(amount, decimals, args.fixedDecimals);
}

export async function getFormattedBalance(args: ERC20FormattedBalanceArgs): Promise<string> {
  const balance = await getBalance(args);
  return formatAmount(balance, { ...args, fixedDecimals: args.fixedDecimals ?? FIXED_DECIMALS });
}

export async function getFormattedAllowance(args: ERC20FormattedAllowanceArgs): Promise<string> {
  const allowance = await getAllowance(args)
  return formatAmount(allowance, { ...args, fixedDecimals: args.fixedDecimals ?? FIXED_DECIMALS });
}

export async function getInfo(args: ERC20Args): Promise<{ name: string; symbol: string; decimals: number }> {
  const [name, symbol, decimals] = await Promise.all([getName(args), getSymbol(args), getDecimals(args)]);
  return { name, symbol, decimals };
}
