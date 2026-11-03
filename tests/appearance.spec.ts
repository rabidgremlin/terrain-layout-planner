import { test, expect } from '@playwright/test'

test.use({ locale: 'en-US', colorScheme: 'light' })

// A 0.01 colour threshold ignores 1–2 RGB rounding levels at antialiased borders;
// pixels beyond that threshold must still match, with no allowed pixel count.
// Baselines originate from the Tailwind migration and include the expanded terrain catalog.
for (const width of [1280, 1000, 800]) {
  test(`planner appearance at desktop width ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page).toHaveScreenshot(`setup-${width}.png`, { threshold: 0.01 })
    await page.getByLabel('Board size').selectOption('custom')
    await page.getByLabel('Width (inches)').focus()
    await expect(page).toHaveScreenshot(`setup-custom-focus-${width}.png`, { threshold: 0.01 })
    await page.getByRole('button', { name: 'Create layout' }).click()
    const board = page.getByRole('region', { name: 'Terrain board' })
    await expect.poll(async () => (await board.boundingBox())!.width).toBe(width === 1280 ? 720 : width === 1000 ? 480 : 392)
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-empty-${width}.png`, { threshold: 0.01 })
    await page.getByRole('button', { name: 'Building · 6″ × 4″' }).locator('span').dragTo(board, { targetPosition: { x: 180, y: 180 } })
    await expect(page.getByRole('region', { name: 'Selected terrain', exact: true })).toBeVisible()
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-selected-${width}.png`, { threshold: 0.01 })
    await page.getByRole('button', { name: 'Layout settings' }).click()
    await expect(page).toHaveScreenshot(`editor-settings-${width}.png`, { threshold: 0.01 })
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('button', { name: 'Show grid', exact: true }).click()
    await page.getByRole('button', { name: 'Snap to grid', exact: true }).click()
    await page.getByLabel('Terrain width').focus()
    await expect(page).toHaveScreenshot(`editor-toggles-focus-${width}.png`, { threshold: 0.01 })
    await page.getByRole('button', { name: 'Duplicate terrain', exact: true }).hover()
    await expect(page).toHaveScreenshot(`editor-hover-${width}.png`, { threshold: 0.01 })
    const bounds = (await board.boundingBox())!
    await page.mouse.click(bounds.x + 5, bounds.y + 5)
    await page.mouse.move(0, 0)
    await expect(page).toHaveScreenshot(`editor-deselected-${width}.png`, { threshold: 0.01 })
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
  await expect(page).toHaveScreenshot('editor-save-failure.png', { threshold: 0.01 })
})

test('wall presets and draft tag management appearance', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  for (const [name, x, y] of [['Scalable wall', '10', '10'], ['Tall wall', '20', '15']]) {
    await page.getByLabel(`${name} footprint preview`).dragTo(board, { targetPosition: { x: 300, y: 300 } })
    await page.getByLabel('X position').fill(x)
    await page.getByLabel('Y position').fill(y)
    await page.getByRole('button', { name: 'Apply', exact: true }).click()
  }
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('editor-walls.png', { threshold: 0.01 })
  await page.getByRole('button', { name: 'Layout settings' }).click()
  const dialog = page.getByRole('dialog', { name: 'Layout settings' })
  await dialog.getByRole('textbox', { name: 'Tag name: Climbable', exact: true }).fill('Scaling')
  const pending = page.waitForEvent('dialog')
  const click = dialog.getByRole('listitem', { name: 'Dangerous', exact: true }).getByRole('button', { name: 'Delete', exact: true }).click()
  await (await pending).accept()
  await click
  await dialog.getByRole('textbox', { name: 'Tag name: Scaling', exact: true }).focus()
  await expect(page).toHaveScreenshot('settings-tag-edits.png', { threshold: 0.01 })
})
