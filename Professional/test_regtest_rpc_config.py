import unittest
import ast
import json
from pathlib import Path
from types import SimpleNamespace
from regtest_rpc_config import regtest_rpc_connection

class RegtestRpcConfigTests(unittest.TestCase):
    def test_password_uses_stdin(self):
        flags, stdin = regtest_rpc_connection({'BC1Q21_REGTEST_RPC_USER':'synthetic-user','BC1Q21_REGTEST_RPC_PASSWORD':'synthetic-password'})
        self.assertEqual(flags, ['-rpcuser=synthetic-user','-stdinrpcpass'])
        self.assertEqual(stdin, 'synthetic-password\n')
        self.assertNotIn('synthetic-password', ' '.join(flags))
    def test_missing_and_multiline_fail_closed_without_values(self):
        valid={'BC1Q21_REGTEST_RPC_USER':'synthetic-user','BC1Q21_REGTEST_RPC_PASSWORD':'synthetic-password'}
        for key in valid:
            for value in [None, '', 'secret\ntext', 'secret\rtext', 'secret\0text']:
                with self.subTest(key=key, value_type=type(value).__name__):
                    with self.assertRaises(ValueError) as caught:
                        regtest_rpc_connection({**valid,key:value})
                    self.assertIn(key,str(caught.exception)); self.assertNotIn('secret',str(caught.exception))
    def test_actual_python_rpc_functions_forward_password_only_to_stdin(self):
        root = Path(__file__).resolve().parent
        for name in ['audit-public-regtest-outpoints.py','build-creator-24-unsigned-core.py','test-single-funded-gift-core.py']:
            calls=[]
            def mocked_output(args, **kwargs):
                calls.append((args,kwargs)); return '{}'
            tree=ast.parse((root/name).read_text())
            definition=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='rpc')
            scope={'subprocess':SimpleNamespace(check_output=mocked_output),'json':json,
                   'rpc_flags':['-rpcuser=synthetic-user','-stdinrpcpass'],'rpc_input':'synthetic-password\n'}
            exec(compile(ast.Module(body=[definition],type_ignores=[]),name,'exec'),scope)
            scope['rpc']('getblockcount')
            self.assertEqual(len(calls),1)
            args,options=calls[0]
            self.assertEqual(args[:3],['docker','exec','-i'])
            self.assertIn('-regtest',args); self.assertIn('-datadir=/work',args)
            self.assertIn('-stdinrpcpass',args)
            self.assertNotIn('synthetic-password',' '.join(args))
            self.assertEqual(options['input'],'synthetic-password\n')
            self.assertTrue(options['text'])
if __name__ == '__main__': unittest.main()
