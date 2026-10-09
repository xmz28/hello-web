import importlib.util
import unittest
import tempfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("helper", Path(__file__).with_name("network-helper.py"))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class NetworkHelperTests(unittest.TestCase):
    def test_portable_uses_live_project_and_standalone_falls_back(self):
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            downloads = project / "downloads"
            downloads.mkdir()
            bundled = project / "snapshot"
            self.assertEqual(helper.choose_web_root(downloads / "helper.exe", bundled), bundled)
            for name in ["dashboard.html", "network-tools.js", "network-helper.py"]:
                (project / name).write_text("test", encoding="utf-8")
            self.assertEqual(helper.choose_web_root(downloads / "helper.exe", bundled), project)
            self.assertEqual(helper.choose_web_root(project / "helper.exe", bundled), project)

    def test_domain_url_and_ipv6(self):
        self.assertEqual(helper.normalize_target("https://github.com/path?q=1"), "github.com")
        self.assertEqual(helper.normalize_target("[2001:4860:4860::8888]"), "2001:4860:4860::8888")
        self.assertEqual(helper.normalize_target("例子.中国"), "xn--fsqu00a.xn--fiqs8s")

    def test_reject_shell_and_option_input(self):
        for target in ["-h", "google.com & calc", "a;calc", "a\nlocalhost", "https://user:pass@example.com", "127.0.0.1:80", "file:///C:/Windows", "a..com"]:
            with self.subTest(target=target), self.assertRaises(ValueError):
                helper.normalize_target(target)

    def test_windows_hops_and_timeouts(self):
        self.assertEqual(helper.parse_hop("  1    <1 ms    2 ms    *  192.168.1.1")["rtt"], ["<1 ms", "2 ms", "*"])
        self.assertEqual(helper.parse_hop("  2    23 ms  25 ms  21 ms  2001:4860::1")["ip"], "2001:4860::1")
        self.assertEqual(helper.parse_hop("  3    *    *    *  Request timed out.")["ip"], None)
        self.assertEqual(helper.parse_hop("  1 <1 毫秒 2 毫秒 3 毫秒 10.0.0.1")["ip"], "10.0.0.1")
        self.assertIsNone(helper.parse_hop("Tracing route to 8.8.8.8"))

    def test_private_geo_never_sends_queries(self):
        self.assertIsNone(helper.get_geo("127.0.0.1")["lat"])
        self.assertEqual(helper.get_geo("192.168.1.1")["source"], "地址范围")


if __name__ == "__main__":
    unittest.main()
