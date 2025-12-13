import { describe, it, expect } from 'vitest'
import { ofetch } from 'ofetch'

const PORT = process.env.TEST_PORT || 3000
const BASE_URL = `http://localhost:${PORT}`

describe.runIf(process.env.TEST_SUITE !== 'backend')('Blog Feature Tests', () => {
  it('should render the blog index page', async () => {
    const html = await ofetch(`${BASE_URL}/blog`)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Blog')
  }, 30000)

  it('should have links to blog posts and render them', async () => {
    const html = await ofetch(`${BASE_URL}/blog`)
    // Look for a link to a blog post.
    // My new code uses NuxtLink to=`${post.path}` which renders as <a href="/blog/slug">
    // Regex to find a href link starting with /blog/
    const match = html.match(/href="(\/blog\/[^"]+)"/)

    if (match) {
      const postUrl = match[1]
      console.log('Found blog post link:', postUrl)

      // Fetch the post
      const postHtml = await ofetch(`${BASE_URL}${postUrl}`)
      expect(postHtml).toContain('<!DOCTYPE html>')
      // Should contain back link
      expect(postHtml).toContain('Back to Blog')
    }
    else {
      console.warn('No blog post links found on index page. Is content seeded?')
      // If no content, we can't strictly fail unless we expect content.
      // But there are files in content/3.blog, so there should be links.
      throw new Error('No blog post links found')
    }
  }, 30000)
})
