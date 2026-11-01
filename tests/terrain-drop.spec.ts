import { test, expect } from '@playwright/test'

test('dropping terrain preserves a quarter-width grab instead of snapping its top-left to the cursor', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => (await board.boundingBox())!.width).toBe(720)
  const preview = page.locator('.preview')
  const previewBounds = (await preview.boundingBox())!
  const boardBounds = (await board.boundingBox())!
  const start = { x: previewBounds.x + previewBounds.width / 4, y: previewBounds.y + previewBounds.height / 2 }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + 12, start.y, { steps: 5 })
  await page.mouse.move(boardBounds.x + 300, boardBounds.y + 300, { steps: 15 })
  await page.mouse.up()
  // Cursor at (20,20) inches; the grabbed point is (1.5,2) inches into a 6×4 piece.
  await expect(page.getByLabel('Selected terrain')).toContainText('18.5″, 18.0″')
  await page.reload()
  await page.getByRole('button', { name: 'Building 1', exact: true }).click()
  await expect(page.getByLabel('Selected terrain')).toContainText('18.5″, 18.0″')
})

for (const height of [900, 720]) {
  for (const grab of ['centre', 'corner', 'text', 'padding']) {
    test(`${grab} grab matches its drop at viewport height ${height}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height })
      await page.goto('/')
      await page.getByRole('button', { name: 'Create layout' }).click()
      const board = page.getByRole('region', { name: 'Terrain board' })
      await expect.poll(async () => {
        const bounds = (await board.boundingBox())!
        return bounds.height > 0 && bounds.y + bounds.height <= height
      }).toBe(true)
      const boardBounds = (await board.boundingBox())!
      const preview = (await page.locator('.preview').boundingBox())!
      const card = (await page.getByRole('button', { name: 'Building · 6″ × 4″' }).boundingBox())!
      const fraction = grab === 'corner' ? 0.9 : 0.5
      const start = grab === 'padding' ? { x: card.x + 4, y: card.y + 4 }
        : grab === 'text' ? { x: card.x + card.width / 2, y: card.y + card.height - 12 }
        : { x: preview.x + preview.width * fraction, y: preview.y + preview.height * fraction }
      await page.mouse.move(start.x, start.y)
      await page.mouse.down()
      await page.mouse.move(start.x + 12, start.y, { steps: 5 })
      const scale = boardBounds.width / 48
      await page.mouse.move(boardBounds.x + 20 * scale, boardBounds.y + 20 * scale, { steps: 15 })
      await page.mouse.up()
      const position = await page.getByLabel('Selected terrain').innerText()
      const coordinates = position.match(/Position: ([\d.]+)″, ([\d.]+)″/)!
      // Worked examples: centre offset (3,2); 90% corner offset (5.4,3.6).
      expect(Math.abs(Number(coordinates[1]) - (grab === 'corner' ? 14.6 : 17))).toBeLessThanOrEqual(0.11)
      expect(Math.abs(Number(coordinates[2]) - (grab === 'corner' ? 16.4 : 18))).toBeLessThanOrEqual(0.11)
    })
  }
}
