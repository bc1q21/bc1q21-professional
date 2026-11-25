"""Local Regtest helper configuration; never a production connection or secret store."""
import os

def regtest_rpc_connection(environ=None):
    env = os.environ if environ is None else environ
    values = []
    for name in ('BC1Q21_REGTEST_RPC_USER', 'BC1Q21_REGTEST_RPC_PASSWORD'):
        value = env.get(name)
        if not isinstance(value, str) or not value or any(c in value for c in ('\r', '\n', '\0')):
            raise ValueError(f'{name} must be set to a nonempty single-line local value')
        values.append(value)
    # Password travels over stdin, not command-line arguments or log output.
    return ['-rpcuser=' + values[0], '-stdinrpcpass'], values[1] + '\n'
