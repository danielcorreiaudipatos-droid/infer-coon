import time
from playwright.sync_api import sync_playwright

def test_admin():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={'width': 1366, 'height': 850})
        page = context.new_page()

        print("Navigating to http://127.0.0.1:8000/admin?key=coon2026master...")
        page.goto("http://127.0.0.1:8000/admin?key=coon2026master")
        page.wait_for_timeout(2000)

        # Scroll down to #sec-onmail
        page.locator("#sec-onmail").scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/admin_sec_onmail.png")
        print("Captured scratch/admin_sec_onmail.png")

        # Scroll down to #sec-traffic
        page.locator("#sec-traffic").scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/admin_sec_traffic.png")
        print("Captured scratch/admin_sec_traffic.png")

        browser.close()

if __name__ == "__main__":
    test_admin()
