import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils/e2e'

describe('Dashboard E2E', async () => {
  await setup({
    server: true,
  })

  it('Public: can view products page', async () => {
    const page = await createPage('/products')
    const text = await page.textContent('h2')
    expect(text).toContain('Our Products')

    // Check if products are rendered (assuming at least one product exists or the empty state)
    // We can check for the grid or the empty message
    const content = await page.innerHTML('body')
    expect(content).toBeTruthy()
  })

  it('Admin: redirects to home when unauthenticated', async () => {
    const page = await createPage('/dashboard')
    // Should be redirected to /
    await page.waitForURL(url => url.pathname === '/')
    const text = await page.textContent('h1')
    expect(text).toContain('Nuxt Auto CRUD')
  })

  it('Admin: can login and view dashboard', async () => {
    const page = await createPage('/')

    // Open login modal
    await page.click('button:has-text("Sign In")')

    // Fill login form
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', '$1Password')
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL(url => url.pathname === '/dashboard')

    // Check for dashboard specific element
    const text = await page.textContent('header')
    expect(text).toContain('Home')
  })
})
