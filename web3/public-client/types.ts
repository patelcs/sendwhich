import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem';

export type ReadContractMutability = 'pure' | 'view';

export type ReadContractFunctionName<abi extends Abi | readonly unknown[] = Abi> = ContractFunctionName<
  abi,
  ReadContractMutability
>;

export type ReadContractFunctionArgs<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, ReadContractMutability> = ContractFunctionName<
    abi,
    ReadContractMutability
  >,
> = ContractFunctionArgs<abi, ReadContractMutability, functionName>;
