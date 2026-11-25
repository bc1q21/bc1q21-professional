"""Cold chain/evidence backup. Never exports Core wallets, cookies or key backups."""
import json
import pathlib
import stat
import sys
import zipfile


def allowed(name):
    p = pathlib.PurePosixPath(name)
    if not name or p.is_absolute() or '..' in p.parts or '\\' in name or ':' in name:
        return False
    if name in ('session.json', 'checkpoint.json'):
        return True
    # Only public chain DBs and explicitly curated public evidence. No wallet files.
    return (len(p.parts) >= 4 and p.parts[:2] == ('data', 'regtest')
            and p.parts[2] in ('blocks', 'chainstate', 'indexes')) or (
                len(p.parts) == 2 and p.parts[0] == 'evidence'
                and p.suffix in ('.json', '.psbt', '.html', '.txt'))


def main():
    mode, directory, archive = sys.argv[1:]
    root = pathlib.Path(directory)
    if mode == 'backup':
        assert (root / 'checkpoint.json').is_file(), 'Checkpoint required'
        assert not (root / 'data/regtest/.lock').is_symlink()
        with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED, allowZip64=True) as z:
            for path in sorted(root.rglob('*')):
                assert not path.is_symlink(), 'Symlinks prohibited'
                if path.is_file() and allowed(path.relative_to(root).as_posix()):
                    z.write(path, path.relative_to(root).as_posix())
    elif mode == 'restore':
        assert not root.exists(), 'Refuse overwrite'
        with zipfile.ZipFile(archive) as z:
            entries = z.infolist()
            assert len(entries) <= 100000
            assert len({x.filename for x in entries}) == len(entries), 'Duplicate entries'
            assert sum(x.file_size for x in entries) <= 4 * 1024**3, 'Backup too large'
            assert {'session.json', 'checkpoint.json'} <= {x.filename for x in entries}
            for item in entries:
                assert allowed(item.filename), 'Forbidden backup path'
                assert not stat.S_ISLNK(item.external_attr >> 16), 'Symlinks prohibited'
            assert z.testzip() is None, 'Corrupt archive'
            # Validate marker before extraction; caller also checks genesis on Core startup.
            assert json.loads(z.read('session.json'))['network'] == 'regtest'
            root.mkdir(mode=0o700, parents=True)
            z.extractall(root)
    else:
        raise ValueError('Use backup or restore')


if __name__ == '__main__':
    main()
