from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    page.goto("http://localhost:4321/pro")
    page.screenshot(path="jules-scratch/verification/pro.png")

    page.goto("http://localhost:4321/features")
    page.screenshot(path="jules-scratch/verification/features.png")

    page.goto("http://localhost:4321/security")
    page.screenshot(path="jules-scratch/verification/security.png")

    page.goto("http://localhost:4321/pricing")
    page.screenshot(path="jules-scratch/verification/pricing.png")

    page.goto("http://localhost:4321/your-admin-panel")
    page.screenshot(path="jules-scratch/verification/your-admin-panel.png")

    page.goto("http://localhost:4321/openai")
    page.screenshot(path="jules-scratch/verification/openai.png")

    page.goto("http://localhost:4321/agencies")
    page.screenshot(path="jules-scratch/verification/agencies.png")

    page.goto("http://localhost:4321/developers")
    page.screenshot(path="jules-scratch/verification/developers.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)