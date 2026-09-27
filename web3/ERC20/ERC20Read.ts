import { formatUnits, ReadContractReturnType } from 'viem';
import { getPublicClient, PublicClientOptions, ReadContractFunctionArgs } from '../public-client';
import { Address } from '@/wallet-adapter';
import { ERC20_ABI } from './ERC20_ABI';
import { ReadContractFunctionName } from '../public-client';
import { FIXED_DECIMALS } from '@/configs';

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
  return await publicClient.readContract({
    address,
    abi: ERC20_ABI,
    functionName,
    args,
  });
}

export async function getName(args: ERC20Args) {
  return await read({ ...args, functionName: 'name', args: [] });
}

export async function getSymbol(args: ERC20Args): Promise<string> {
  return await read({ ...args, functionName: 'symbol', args: [] });
}

export async function getDecimals(args: ERC20Args): Promise<number> {
  return await read({ ...args, functionName: 'decimals', args: [] });
}

export async function getSupply(args: ERC20Args): Promise<bigint> {
  return await read({ ...args, functionName: 'totalSupply', args: [] });
}

export async function getBalance({ owner, ...args }: ERC20BalanceArgs): Promise<bigint> {
  return await read({ ...args, functionName: 'balanceOf', args: [owner] });
}

export async function getAllowance({ owner, spender, ...args }: ERC20AllowanceArgs): Promise<bigint> {
  return await read({ ...args, functionName: 'allowance', args: [owner, spender] });
}

export async function formatAmount(amount: bigint, args: (ERC20Args & { fixedDecimals?: number }) | ERC20FormatAmountArgs): Promise<string> {
  const fixedDecimals = args.fixedDecimals;
  const decimals = 'decimals' in args ? args.decimals : await getDecimals(args);
  const formatted = formatUnits(amount, decimals!);
  if (args.fixedDecimals && args.fixedDecimals >= 0) {
    const fixed = Number(Number(formatted).toFixed(fixedDecimals));
    return amount > 0 && fixed == 0 ? `< 0.${'0'.repeat(args.fixedDecimals - 1)}1` : `${fixed}`;
  }
  return formatted;
}

export async function getFormattedBalance(args: ERC20FormattedBalanceArgs): Promise<string> {
  const balance = await getBalance(args);
  return formatAmount(balance, { ...args, fixedDecimals: args.fixedDecimals ?? FIXED_DECIMALS });
}

export async function getFormattedAllowance(args: ERC20FormattedAllowanceArgs): Promise<string> {
  const allowance = await getAllowance(args)
  return formatAmount(allowance, { ...args, fixedDecimals: args.fixedDecimals ?? FIXED_DECIMALS });
}

export async function getInfo(args: ERC20Args) {
  return await Promise.all([getName(args), getSymbol(args), getDecimals(args)]);
}
