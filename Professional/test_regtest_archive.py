import importlib.util
import json
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('archive', Path(__file__).parent / 'lifecycle/regtest-archive.py')
archive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(archive)


class RegtestArchiveTests(unittest.TestCase):
    def invoke(self, mode, root, bundle):
        with patch.object(sys, 'argv', ['archive', mode, str(root), str(bundle)]):
            archive.main()

    def test_public_chain_roundtrip_excludes_wallets_credentials_and_owner_capture(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / 'state'
            files = {'session.json': json.dumps({'network': 'regtest'}), 'checkpoint.json': '{}',
                     'data/regtest/blocks/blk00000.dat': 'public-blocks',
                     'data/regtest/chainstate/fixture': 'public-utxos',
                     'data/regtest/wallets/miner/wallet.dat': 'PRIVATE-MINER',
                     'data/regtest/.cookie': 'RPC-CREDENTIAL',
                     'private-registration.json': 'OWNER-CAPTURE',
                     'evidence/funding.json': '{"network":"regtest"}'}
            for name, value in files.items():
                p = root / name
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(value)
            bundle = Path(temp) / 'backup.zip'
            self.invoke('backup', root, bundle)
            with zipfile.ZipFile(bundle) as z:
                content = b''.join(z.read(n) for n in z.namelist())
                for secret in (b'PRIVATE-MINER', b'RPC-CREDENTIAL', b'OWNER-CAPTURE'):
                    self.assertNotIn(secret, content)
            restored = Path(temp) / 'restored'
            self.invoke('restore', restored, bundle)
            self.assertEqual((restored / 'data/regtest/blocks/blk00000.dat').read_text(), 'public-blocks')

    def test_restore_rejects_traversal_wallets_and_symlinks_before_extracting(self):
        for name, symlink in (('../escape', False), ('/absolute', False), ('C:/escape', False),
                              ('data/regtest/wallets/wallet.dat', False), ('data/regtest/blocks/link', True)):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temp:
                bundle = Path(temp) / 'bad.zip'
                with zipfile.ZipFile(bundle, 'w') as z:
                    z.writestr('session.json', '{"network":"regtest"}')
                    z.writestr('checkpoint.json', '{}')
                    entry = zipfile.ZipInfo(name)
                    if symlink:
                        entry.external_attr = (stat.S_IFLNK | 0o777) << 16
                    z.writestr(entry, 'bad')
                root = Path(temp) / 'restore'
                with self.assertRaises(AssertionError):
                    self.invoke('restore', root, bundle)
                self.assertFalse(root.exists())

    def test_restore_refuses_overwrite_and_wrong_network(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / 'existing'
            root.mkdir()
            bundle = Path(temp) / 'bad.zip'
            with zipfile.ZipFile(bundle, 'w') as z:
                z.writestr('session.json', '{"network":"mainnet"}')
                z.writestr('checkpoint.json', '{}')
            with self.assertRaises(AssertionError):
                self.invoke('restore', root, bundle)
            other = Path(temp) / 'new'
            with self.assertRaises(AssertionError):
                self.invoke('restore', other, bundle)
            self.assertFalse(other.exists())


if __name__ == '__main__':
    unittest.main()
