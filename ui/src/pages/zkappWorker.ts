import { Mina, PublicKey, fetchAccount, Field, Signature } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { VerifySignature } from '../../../contracts/src/Verify';

const state = {
  VerifySignature: null as null | typeof VerifySignature,
  zkapp: null as null | VerifySignature,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToDevnet: async (args: {}) => {
    const Network = Mina.Network(
      'https://api.minascan.io/node/devnet/v1/graphql'
    );
    console.log('Devnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  loadContract: async (args: {}) => {
    const { VerifySignature } = await import('../../../contracts/build/src/Verify.js');
    state.VerifySignature = VerifySignature;
  },
  compileContract: async (args: {}) => {
    await state.VerifySignature!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.VerifySignature!(publicKey);
  },
  createVerifySignatureTransaction: async (args: { 
    publicKey58: string, 
    signature: string, 
    messageField: string 
  }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    const signature = Signature.fromJSON(args.signature);
    const messageField = Field.fromJSON(args.messageField);

    const transaction = await Mina.transaction(async () => {
      await state.zkapp!.verifySignature(publicKey, signature, messageField);
    });
    state.transaction = transaction;
  },
  proveTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');
