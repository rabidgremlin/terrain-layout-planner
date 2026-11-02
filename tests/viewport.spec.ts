import { test, expect } from '@playwright/test'

for (const dimensions of [[48, 48], [36, 36], [24, 48]]) {
  const [width, height] = dimensions
  test(`the entire ${width} by ${height} board fits desktop viewports`, async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Board size').selectOption('custom')
    await page.getByLabel('Width (inches)').fill(String(width))
    await page.getByLabel('Height (inches)').fill(String(height))
    await page.getByRole('button', { name: 'Create layout' }).click()
    for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport)
      await expect.poll(async () => {
        const board = (await page.getByRole('region', { name: 'Terrain board' }).boundingBox())!
        const caption = (await page.getByText(/playing area · top-down/).boundingBox())!
        return board.height > 0 && board.y >= 0 && board.y + board.height <= viewport.height
          && board.x >= 0 && board.x + board.width <= viewport.width
          && caption.y + caption.height <= viewport.height
      }).toBe(true)
      const board = (await page.getByRole('region', { name: 'Terrain board' }).boundingBox())!
      expect(board.width / board.height).toBeCloseTo(width / height, 2)
      expect(Math.max(board.width, board.height)).toBeLessThanOrEqual(721)
      const header = (await page.locator('header').boundingBox())!
      expect(header.height).toBeLessThanOrEqual(56)
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true)
    }
  })
}

test('viewport fitting preserves physical placement, movement, and saved coordinates', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Board size').selectOption('36')
  await page.getByRole('button', { name: 'Create layout' }).click()
  await page.setViewportSize({ width: 1280, height: 720 })
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => ((await board.boundingBox())!.height)).toBeLessThan(650)
  const bounds = (await board.boundingBox())!
  const scale = bounds.width / 36
  await page.getByLabel('Building footprint preview').dragTo(board, { targetPosition: { x: 8 * scale, y: 7 * scale } })
  const selected = page.getByLabel('Selected terrain')
  const initialPosition = await selected.innerText()
  // Native drag events round CSS-pixel positions on a fractionally scaled board.
  const initialCoordinates = initialPosition.match(/Position: ([\d.]+)″, ([\d.]+)″/)!
  expect(Math.abs(Number(initialCoordinates[1]) - 5)).toBeLessThanOrEqual(0.11)
  expect(Math.abs(Number(initialCoordinates[2]) - 5)).toBeLessThanOrEqual(0.11)
  await page.setViewportSize({ width: 1000, height: 768 })
  await expect(selected).toHaveText(initialPosition, { useInnerText: true })
  await expect.poll(async () => (await board.boundingBox())!.width).not.toBeCloseTo(bounds.width, 0)
  const resized = (await board.boundingBox())!
  const resizedScale = resized.width / 36
  await page.mouse.move(resized.x + 6 * resizedScale, resized.y + 6 * resizedScale)
  await page.mouse.down()
  await page.mouse.move(resized.x + 8 * resizedScale, resized.y + 9 * resizedScale, { steps: 10 })
  await page.mouse.up()
  const movedPosition = await selected.innerText()
  const movedCoordinates = movedPosition.match(/Position: ([\d.]+)″, ([\d.]+)″/)!
  expect(Math.abs(Number(movedCoordinates[1]) - 7)).toBeLessThanOrEqual(0.11)
  expect(Math.abs(Number(movedCoordinates[2]) - 8)).toBeLessThanOrEqual(0.11)
  await page.reload()
  await page.getByRole('button', { name: 'Building 1', exact: true }).click()
  await expect(selected).toHaveText(movedPosition, { useInnerText: true })
})

test('a long terrain list scrolls independently of the board', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  for (let index = 0; index < 12; index++) {
    await page.getByRole('button', { name: 'Building · 6″ × 4″' }).dragTo(board, { targetPosition: { x: 80, y: 80 } })
  }
  const before = (await board.boundingBox())!
  await page.getByRole('button', { name: 'Building 12', exact: true }).scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Building 12', exact: true }).click()
  const after = (await board.boundingBox())!
  expect(after.y).toBe(before.y)
  expect(after.y + after.height).toBeLessThanOrEqual(720)
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true)
})

test('right panels list terrain and show properties only for the selected piece', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  const list = page.getByRole('region', { name: 'Terrain pieces', exact: true })
  const properties = page.getByRole('region', { name: 'Selected terrain', exact: true })
  await expect(list).toBeVisible()
  await expect(properties).toHaveCount(0)
  const before = (await board.boundingBox())!
  await page.getByLabel('Building footprint preview').dragTo(board, { targetPosition: { x: 180, y: 180 } })
  await expect(properties).toBeVisible()
  const listBounds = (await list.boundingBox())!
  const propertiesBounds = (await properties.boundingBox())!
  expect(listBounds.x).toBeGreaterThanOrEqual(before.x + before.width)
  expect(propertiesBounds.x).toBe(listBounds.x)
  expect(propertiesBounds.y).toBeGreaterThanOrEqual(listBounds.y + listBounds.height)
  await properties.getByLabel('Terrain width').fill('9')
  await properties.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.mouse.click(before.x + 10, before.y + 10)
  await expect(properties).toHaveCount(0)
  await expect(list.getByRole('button', { name: 'Building 1', exact: true })).toBeVisible()
  await list.getByRole('button', { name: 'Building 1', exact: true }).click()
  await expect(properties.getByLabel('Terrain width')).toHaveValue('9')
  const after = (await board.boundingBox())!
  expect(after).toEqual(before)
  await page.getByRole('toolbar', { name: 'Terrain editing' }).getByRole('button', { name: 'Delete terrain' }).click()
  await expect(properties).toHaveCount(0)
  await expect(list.getByText('0 terrain pieces')).toBeVisible()
})
