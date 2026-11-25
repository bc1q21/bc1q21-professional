"""A fresh Windows preview build must support the documented npm ci step."""
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parent / 'browser-integration'


class PreviewDependencyLockTests(unittest.TestCase):
    def test_committed_lock_matches_the_build_manifest(self):
        manifest = json.loads((ROOT / 'package.json').read_text())
        lock = json.loads((ROOT / 'package-lock.json').read_text())
        self.assertGreaterEqual(lock['lockfileVersion'], 2)
        for field in ['dependencies', 'devDependencies']:
            self.assertEqual(lock['packages'][''][field], manifest[field])

    def test_lock_includes_windows_build_binary_and_integrity(self):
        packages = json.loads((ROOT / 'package-lock.json').read_text())['packages']
        binary = packages['node_modules/@esbuild/win32-x64']
        self.assertEqual(binary['version'], packages['node_modules/esbuild']['version'])
        self.assertEqual(binary['os'], ['win32'])
        self.assertTrue(binary['integrity'].startswith('sha512-'))


if __name__ == '__main__':
    unittest.main()
