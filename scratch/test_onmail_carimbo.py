import time
from playwright.sync_api import sync_playwright

def test_onmail_carimbo():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={'width': 1366, 'height': 850})
        page = context.new_page()

        print("Navigating to http://127.0.0.1:8000/onmail...")
        page.goto("http://127.0.0.1:8000/onmail")
        page.wait_for_timeout(1000)

        # Scroll down to cardEmpresarial
        page.locator("#cardEmpresarial").scroll_into_view_if_needed()
        page.wait_for_timeout(800)

        # Screenshot carimbo in place
        page.screenshot(path="scratch/onmail_carimbo_visible.png")
        print("Captured scratch/onmail_carimbo_visible.png")

        # Click on carimbo to trigger the slam animation and toast
        page.locator("#octoberCarimbo").click()
        page.wait_for_timeout(600)

        page.screenshot(path="scratch/onmail_carimbo_slammed.png")
        print("Captured scratch/onmail_carimbo_slammed.png")

        browser.close()

if __name__ == "__main__":
    test_onmail_carimbo()
