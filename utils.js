import * as BufferLayout from "@solana/buffer-layout";

export const ECHO_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(40, 'data')
])
