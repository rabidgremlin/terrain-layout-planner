import { test, expect } from '@playwright/test'

test('toolbar keeps grid visibility independent from snapping and supports reversible deletion', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const toolbar = page.getByRole('toolbar', { name: 'Terrain editing' })
  const grid = toolbar.getByRole('button', { name: 'Show grid', exact: true })
  const snap = toolbar.getByRole('button', { name: 'Snap to grid', exact: true })
  const remove = toolbar.getByRole('button', { name: 'Delete terrain', exact: true })
  await expect(remove).toBeDisabled()
  await expect(toolbar.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled()
  await expect(toolbar.getByRole('button', { name: 'Redo', exact: true })).toBeDisabled()
  await expect(grid).toHaveAttribute('aria-pressed', 'false')
  await expect(snap).toHaveAttribute('aria-pressed', 'false')
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => (await board.boundingBox())!.width).toBe(720)
  const hiddenGrid = await board.screenshot()
  await grid.click()
  await expect(grid).toHaveAttribute('aria-pressed', 'true')
  await expect(snap).toHaveAttribute('aria-pressed', 'false')
  expect((await board.screenshot()).equals(hiddenGrid)).toBe(false)
  await toolbar.getByLabel('Grid spacing').fill('2')
  await toolbar.getByLabel('Grid spacing').press('Tab')
  await page.getByLabel('Building footprint preview').dragTo(board, { targetPosition: { x: 157, y: 157 } })
  // A visible grid alone preserves the unsnapped top-left at (7.4667,8.4667).
  await expect.poll(async () => Number(await page.getByLabel('X position').inputValue())).toBeCloseTo(7.4667, 2)
  await expect(remove).toBeEnabled()
  await grid.click()
  await snap.click()
  await expect(grid).toHaveAttribute('aria-pressed', 'false')
  await expect(snap).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Building footprint preview').dragTo(board, { targetPosition: { x: 157, y: 157 } })
  await expect(page.getByLabel('X position')).toHaveValue('8')
  await expect(page.getByLabel('Y position')).toHaveValue('8')
  await toolbar.getByLabel('Units').selectOption('cm')
  await expect(toolbar.getByLabel('Grid spacing')).toHaveValue('5.08')
  await remove.click()
  await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
  await expect(remove).toBeDisabled()
  await toolbar.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
  await toolbar.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
})

test('save failures stay visible alongside the compact toolbar', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 768 })
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError') }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const status = page.getByRole('status')
  await expect(status).toContainText('Could not save')
  await expect(status).toBeVisible()
  const bounds = (await status.boundingBox())!
  expect(bounds.width).toBeGreaterThan(100)
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(768)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(1000)
})

test('duplicate is a toolbar action that requires selected terrain', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const toolbar = page.getByRole('toolbar', { name: 'Terrain editing' })
  const duplicate = toolbar.getByRole('button', { name: 'Duplicate terrain', exact: true })
  await expect(duplicate).toBeDisabled()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await page.getByLabel('Building footprint preview').dragTo(board, { targetPosition: { x: 180, y: 180 } })
  await duplicate.click()
  await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Building 2', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('Selected terrain').getByRole('button', { name: 'Duplicate terrain' })).toHaveCount(0)
  const bounds = (await board.boundingBox())!
  await page.mouse.click(bounds.x + 10, bounds.y + 10)
  await expect(duplicate).toBeDisabled()
})

for (const modifier of ['Control', 'Meta']) {
  test(`${modifier} shortcuts share toolbar history and delete selected terrain`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Create layout' }).click()
    await page.getByLabel('Building footprint preview').dragTo(page.getByRole('region', { name: 'Terrain board' }), { targetPosition: { x: 180, y: 180 } })
    await page.getByRole('toolbar').getByRole('button', { name: 'Duplicate terrain' }).click()
    await page.keyboard.press(`${modifier}+z`)
    await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
    await page.keyboard.press(`${modifier}+Shift+z`)
    await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
    await page.keyboard.press('Delete')
    await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
    await page.keyboard.press(`${modifier}+z`)
    await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
    await page.keyboard.press('Backspace')
    await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
    if (modifier === 'Control') {
      await page.keyboard.press('Control+z')
      await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
      await page.keyboard.press('Control+y')
      await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
    }
    await page.reload()
    await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
  })
}

test('shortcuts leave focused property and toolbar fields to their native editing', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  await page.getByLabel('Building footprint preview').dragTo(page.getByRole('region', { name: 'Terrain board' }), { targetPosition: { x: 180, y: 180 } })
  await page.getByRole('toolbar').getByRole('button', { name: 'Duplicate terrain' }).click()
  for (const field of ['Terrain width', 'Grid spacing', 'Units']) {
    await page.getByLabel(field).focus()
    for (const shortcut of ['Delete', 'Backspace', 'Control+z', 'Meta+z']) {
      await page.keyboard.press(shortcut)
      await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
    }
  }
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.getByLabel('Grid spacing').focus()
  for (const shortcut of ['Control+Shift+z', 'Meta+Shift+z', 'Control+y']) {
    await page.keyboard.press(shortcut)
    await expect(page.getByText('1 terrain piece', { exact: true })).toBeVisible()
  }
  await page.getByRole('button', { name: 'Building 1', exact: true }).click()
  await page.keyboard.press('Control+Shift+z')
  await expect(page.getByText('2 terrain pieces', { exact: true })).toBeVisible()
})
