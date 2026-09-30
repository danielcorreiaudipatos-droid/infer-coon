import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context(viewport={'width': 1366, 'height': 820})
        page = await context.new_page()

        print("1. Acessando http://127.0.0.1:8000/onmail...")
        await page.goto("http://127.0.0.1:8000/onmail", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Screenshot Topo Claro
        await page.screenshot(path="scratch/onmail_top_light.png")
        print("Salvo: scratch/onmail_top_light.png")

        # 2. Scroll para baixo (descendo 600px)
        print("2. Rolando a tela para baixo (600px)...")
        await page.evaluate("window.scrollTo({top: 600, behavior: 'instant'})")
        await page.wait_for_timeout(400)
        nav_classes_down = await page.get_attribute("#msStickySubNav", "class")
        print(f"Classes da nav ao descer: {nav_classes_down}")
        await page.screenshot(path="scratch/onmail_scrolling_down.png")
        print("Salvo: scratch/onmail_scrolling_down.png")

        # 3. O EFEITO AO SUBIR A PÁGINA (Rolando para cima para 380px)
        print("3. Executando 'o efeito ao subir a página' (scroll UP para 380px)...")
        await page.evaluate("window.scrollTo({top: 380, behavior: 'instant'})")
        await page.wait_for_timeout(500)
        nav_classes_up = await page.get_attribute("#msStickySubNav", "class")
        print(f"Classes da nav ao subir a página: {nav_classes_up}")
        assert "nav-visible" in nav_classes_up, "A barra deveria conter 'nav-visible' ao subir a página!"

        await page.screenshot(path="scratch/onmail_scroll_up_reveal.png")
        print("Salvo: scratch/onmail_scroll_up_reveal.png (Barra visível deslizando de cima no padrão Microsoft 365)")

        # 4. Alternando para o Modo Escuro
        print("4. Testando alternância para Modo Escuro...")
        await page.click("#themeToggleBtn")
        await page.wait_for_timeout(400)
        await page.screenshot(path="scratch/onmail_scroll_up_dark.png")
        print("Salvo: scratch/onmail_scroll_up_dark.png")

        # 5. Voltando para modo claro e testando o seletor de público
        await page.click("#themeToggleBtn")
        await page.wait_for_timeout(200)

        print("5. Testando Seletor de Público: Clicando em 'Para Empresas'...")
        await page.click("#heroAudienceBusiness")
        await page.wait_for_timeout(600)
        card_biz_classes = await page.get_attribute("#cardEmpresarial", "class")
        print(f"Classes do cardEmpresarial após clique: {card_biz_classes}")
        assert "ring-2" in card_biz_classes, "Card Empresarial deveria ter ring de destaque!"

        await page.screenshot(path="scratch/onmail_business_selected.png")
        print("Salvo: scratch/onmail_business_selected.png")

        await browser.close()
        print("TODOS OS TESTES DO EFEITO AO SUBIR PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    asyncio.run(main())
