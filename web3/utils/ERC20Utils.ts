import { formatUnits, ReadContractReturnType } from 'viem';
import { getPublicClient, PublicClientOptions, ReadContractFunctionArgs } from '../public-client';
import { Address } from '@/wallet-adapter';
import { ERC20_ABI } from '../abi/ERC20_ABI';
import { ReadContractFunctionName } from '../public-client';

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

export type OutputType = 'r' | 'rs' | 'f' | 'fs' | 'ff' | 'ffs';

export interface ERC20BalanceArgs extends ERC20Args {
  holder: Address;
  decimals?: number;
  symbol?: string;
}

// export interface ERC20AllowanceArgs extends ERC20BalanceArgs {
//   spender: Address;
// }

export interface ERC20ReadArgs<
  TFunctionName extends ERC20ReadFunctionName,
  TFunctionArgs extends ERC20ReadFunctionArgs<TFunctionName>,
> extends ERC20Args {
  functionName: TFunctionName;
  args: TFunctionArgs;
}

export class ERC20Utils {
  public static async read<
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

  static async getName(args: ERC20Args) {
    return await ERC20Utils.read({ ...args, functionName: 'name', args: [] });
  }

  static async getSymbol(args: ERC20Args): Promise<string> {
    return await ERC20Utils.read({ ...args, functionName: 'symbol', args: [] });
  }

  static async getDecimals(args: ERC20Args): Promise<number> {
    return await ERC20Utils.read({ ...args, functionName: 'decimals', args: [] });
  }

  static async getSupply(args: ERC20Args): Promise<bigint> {
    return await ERC20Utils.read({ ...args, functionName: 'totalSupply', args: [] });
  }

  static async getBalance(args: ERC20BalanceArgs & { output: 'r' }): Promise<bigint>;
  static async getBalance(args: ERC20BalanceArgs & { output: 'f' | 'ff' }): Promise<number>;
  static async getBalance(args: ERC20BalanceArgs & { output: 'rs' | 'fs' | 'ffs' }): Promise<string>;
  static async getBalance({
    holder,
    output = 'r',
    decimals,
    symbol,
    ...args
  }: ERC20BalanceArgs & { output: OutputType }): Promise<bigint | number | string> {
    const balance = await ERC20Utils.read({ ...args, functionName: 'balanceOf', args: [holder] });
    if (output === 'r') return balance;

    if (!decimals && output.includes('f')) {
      console.log(`Calling decimals() from ERC20Utils`);
      decimals = await ERC20Utils.getDecimals(args);
    }
    if (!symbol && output.includes('s')) {
      console.log(`Calling symbol() from ERC20Utils`);
      symbol = await ERC20Utils.getSymbol(args);
    }

    if (output === 'rs') return `${balance} ${symbol}`;

    const formatted = Number(formatUnits(balance, decimals!));
    if (output === 'f') return formatted;
    if (output === 'fs') return `${formatted} ${symbol}`;

    const fixedDecimals = 5;
    const formattedFixed = Number(formatted.toFixed(fixedDecimals));
    if (output === 'ff') return formattedFixed;

    const formattedFixedSymbol =
      balance > 0 && formattedFixed == 0 ? `< 0.${'0'.repeat(fixedDecimals - 1)}1` : `${formattedFixed}`;
    return `${formattedFixedSymbol} ${symbol}`;
  }

  // static async getAllowance(token: Address, owner: Address, spender: Address, pcOptions: PublicClientOptions): Promise<bigint> {
  //   return await ERC20Utils.read(token, pcOptions, 'allowance', [owner, spender]);
  // }

  static async getInfo(args: ERC20Args) {
    return await Promise.all([ERC20Utils.getName(args), ERC20Utils.getSymbol(args), ERC20Utils.getDecimals(args)]);
  }
}
