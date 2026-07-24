import unittest

from ingestion.crawl_xjtlu import extract_html, extract_page


class CrawlXjtluTests(unittest.TestCase):
    def test_extracts_expected_json_shape_from_selected_page_html(self):
        article = extract_html(
            """
            <html><head>
              <meta property="og:title" content="Earth Week on campus" />
              <meta property="og:description" content="Students explore climate action." />
              <meta property="og:image" content="https://www.xjtlu.edu.cn/image.jpg" />
              <meta property="article:published_time" content="2026-05-01" />
            </head><body><article>
              <p>Students explored climate action and plastic recycling during Earth Week.</p>
              <p>The campus community shared practical sustainability projects and learning.</p>
            </article></body></html>
            """,
            "https://www.xjtlu.edu.cn/en/news/2026/05/example",
        )

        self.assertEqual(article["title"], "Earth Week on campus")
        self.assertEqual(article["category"], "Activity")
        self.assertIn("SDG 12 Responsible Consumption and Production", article["sdg_tags"])
        self.assertIn("SDG 13 Climate Action", article["sdg_tags"])
        self.assertEqual(article["image_url"], "https://www.xjtlu.edu.cn/image.jpg")

    def test_rejects_urls_outside_selected_scope_before_network_access(self):
        with self.assertRaises(ValueError):
            extract_page("https://example.com/en/news/not-allowed", timeout=1)


if __name__ == "__main__":
    unittest.main()
