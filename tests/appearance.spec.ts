import { test, expect } from '@playwright/test'

test.use({ locale: 'en-US', colorScheme: 'light' })

// Baselines originate from the Tailwind migration and include the expanded terrain catalog.
for (const width of [1280, 1000, 800]) {
  test(`planner appearance at desktop width ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page).toHaveScreenshot(`setup-${width}.png`, { threshold: 0 })
    await page.getByLabel('Board size').selectOption('custom')
    await page.getByLabel('Width (inches)').focus()
    await expect(page).toHaveScreenshot(`setup-custom-focus-${width}.png`, { threshold: 0 })
    await page.getByRole('button', { name: 'Create layout' }).click()
    const board = page.getByRole('region', { name: 'Terrain board' })
    await expect.poll(async () => (await board.boundingBox())!.width).toBe(width === 1280 ? 720 : width === 1000 ? 480 : 392)
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-empty-${width}.png`, { threshold: 0 })
    await page.getByRole('button', { name: 'Building · 6″ × 4″' }).locator('span').dragTo(board, { targetPosition: { x: 180, y: 180 } })
    await expect(page.getByRole('region', { name: 'Selected terrain', exact: true })).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-selected-${width}.png`, { threshold: 0 })
    await page.getByRole('button', { name: 'Show grid', exact: true }).click()
    await page.getByRole('button', { name: 'Snap to grid', exact: true }).click()
    await page.getByLabel('Terrain width').focus()
    await expect(page).toHaveScreenshot(`editor-toggles-focus-${width}.png`, { threshold: 0 })
    await page.getByRole('button', { name: 'Duplicate terrain', exact: true }).hover()
    await expect(page).toHaveScreenshot(`editor-hover-${width}.png`, { threshold: 0 })
    const bounds = (await board.boundingBox())!
    await page.mouse.click(bounds.x + 5, bounds.y + 5)
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-deselected-${width}.png`, { threshold: 0 })
  })
}

test('save failure remains visible in the compact toolbar layout', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 720 })
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable') }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  await expect(page.getByRole('status')).toContainText('Could not save')
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('editor-save-failure.png', { threshold: 0 })
})
