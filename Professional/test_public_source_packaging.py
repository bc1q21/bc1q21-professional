"""Packaging checks only; builds are mocked and no runtime file is overwritten."""
import importlib.util
import pathlib
import tempfile
import unittest
import zipfile
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('preview_packager',ROOT/'package-local-preview.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class PublicSourcePackagingTests(unittest.TestCase):
    def test_runtime_is_unchanged_and_licenses_accompany_distribution(self):
        self.assertEqual(len(module.FILES),44)
        before={name:(ROOT/name).read_bytes() for name in module.FILES}
        with tempfile.TemporaryDirectory() as temp,patch.object(module.subprocess,'run') as build:
            p=pathlib.Path(temp)/'preview.zip';module.package_preview(p)
            build.assert_called_once()
            with zipfile.ZipFile(p) as z:
                self.assertIsNone(z.testzip())
                for name,data in before.items():self.assertEqual(z.read('Professional/'+name),data)
                for name in module.LEGAL_FILES:self.assertEqual(z.read(name),(ROOT.parent/name).read_bytes())
                for name in ['LICENSING.md','ASSET_LICENSE.md','BRANDING_POLICY.md','RIGHTS_PROVENANCE.md']:self.assertIn(name,z.namelist())
                self.assertIn('Professional/third-party-notices/Pico-CSS-v1.5.13-LICENSE.txt',z.namelist())
                self.assertFalse(any('review/' in name or 'node_modules/' in name or 'tef-gift-chain' in name for name in z.namelist()))
        for name,data in before.items():self.assertEqual((ROOT/name).read_bytes(),data)
if __name__=='__main__':unittest.main()
