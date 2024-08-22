import {
  Field,
  ZkProgram,
  Signature,
  PublicKey,
  Group,
  Bool,
  Poseidon,
  verify,
  SmartContract,
  state,
  method
} from 'o1js';

// Your signature and public key


export class VerifySignature extends SmartContract {

  @state(Field) counter = Field(0);

  @method async verifySignature( publicKey: PublicKey, signature: Signature, messageField: Field) {
    // Reconstruct the message array
    const message = [messageField];


    // Verify the signature
    const isValid = signature.verify(publicKey, message);

    // Assert that the signature is valid
    isValid.assertEquals(Bool(true));

    // Assert that the public input matches the message
  }
  
}
