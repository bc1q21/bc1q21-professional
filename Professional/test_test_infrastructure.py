"""Guard regression checks. No connection to an existing service is attempted."""
import os,pathlib,socket,subprocess,unittest
class GuardTests(unittest.TestCase):
 def test_reserved_fixture_port_may_be_rebound_but_unregistered_connection_is_denied(self):
  with socket.socket() as reserve:
   reserve.bind(('127.0.0.1',0));address=reserve.getsockname()
  with socket.socket() as server:server.bind(address)
  with socket.socket() as client:
   with self.assertRaisesRegex(RuntimeError,'PUBLIC_TEST_SAFETY_BLOCK'):client.connect(('198.51.100.1',18443))
 def test_source_write_and_git_mutation_are_denied(self):
  p=pathlib.Path(__file__).with_name('creator.html');before=p.read_bytes()
  with self.assertRaisesRegex(RuntimeError,'PUBLIC_TEST_SAFETY_BLOCK'):p.write_bytes(b'must never be written')
  self.assertEqual(p.read_bytes(),before)
  with self.assertRaisesRegex(RuntimeError,'PUBLIC_TEST_SAFETY_BLOCK'):subprocess.run(['git','reset','--hard'],check=True)
if __name__=='__main__':unittest.main()
