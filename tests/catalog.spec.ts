import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'

function boardPixel(board: Locator, x: number, y: number) {
  return board.locator('canvas').first().evaluate((canvas: HTMLCanvasElement, point) =>
    Array.from(canvas.getContext('2d')!.getImageData(point.x, point.y, 1, 1).data), { x, y })
}

test('catalog offers the Firefight terrain types and places a circular forest that survives reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const library = page.getByRole('complementary', { name: 'Terrain library' })
  for (const name of ['Building', 'Barricade', 'Field', 'Forest', 'Hill', 'Water', 'Lava', 'Rubble', 'Ruin', 'Swamp', 'Mountain', 'Wall']) {
    await expect(library.getByRole('button', { name: new RegExp(`${name} ·`) })).toHaveCount(1)
  }
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => (await board.boundingBox())!.width).toBe(720)
  await library.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 300, y: 300 } })
  await expect(page.getByLabel('Terrain width')).toHaveValue('6')
  await expect(page.getByLabel('X position')).toHaveValue('17')
  // Native drag coordinates round the scrolled preview's fractional CSS pixels.
  await expect.poll(async () => Number(await page.getByLabel('Y position').inputValue())).toBeCloseTo(17, 2)
  // The circular footprint spans 17..23 inches, but its bounding-box corner is empty.
  for (const reload of [false, true]) {
    if (reload) {
      await page.reload()
      await expect.poll(() => boardPixel(board, 300, 300)).toEqual([113, 140, 99, 255])
    }
    const bounds = (await board.boundingBox())!
    await page.mouse.click(bounds.x + 256, bounds.y + 256)
    await expect(page.getByLabel('Selected terrain', { exact: true })).toHaveCount(0)
    await page.mouse.click(bounds.x + 300, bounds.y + 300)
    await expect(page.getByLabel('Terrain width')).toHaveValue('6')
    await expect(page.getByLabel('Selected terrain', { exact: true })).toContainText('Forest')
  }
})

test('multiple tags, custom tags, colour and visibility share one reversible edit and persist', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await page.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 300, y: 300 } })
  for (const tag of ['Cover', 'Difficult', 'Dense']) await expect(page.getByRole('checkbox', { name: tag, exact: true })).toBeChecked()
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await page.getByRole('checkbox', { name: 'Difficult', exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'Dangerous', exact: true }).check()
  await page.getByLabel('New tag', { exact: true }).fill('  Magic mist  ')
  await page.getByRole('button', { name: 'Add tag', exact: true }).click()
  await page.getByLabel('Colour', { exact: true }).fill('#123456')
  // Tags and colour do not infer a visibility rule, even when a tag is named Blocking.
  await page.getByLabel('New tag', { exact: true }).fill('Blocking')
  await page.getByRole('button', { name: 'Add tag', exact: true }).click()
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await page.getByLabel('Visibility behaviour').selectOption('clear')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#718c63')
  await expect(page.getByRole('checkbox', { name: 'Difficult', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Magic mist', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  for (const tag of ['Cover', 'Dense', 'Dangerous', 'Magic mist', 'Blocking']) await expect(page.getByRole('checkbox', { name: tag, exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Difficult', exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#123456')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('clear')
  // Observe the rendered board, without inspecting Konva or the editor store.
  const colour = await boardPixel(board, 300, 300)
  expect(colour).toEqual([18, 52, 86, 255])
})

test('placed pieces and duplicates keep independent properties and leave catalog defaults intact', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await page.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 180, y: 180 } })
  await page.getByRole('button', { name: 'Duplicate terrain', exact: true }).click()
  await page.getByLabel('Colour', { exact: true }).fill('#abcdef')
  await page.getByLabel('Visibility behaviour').selectOption('blocking')
  await page.getByRole('checkbox', { name: 'Cover', exact: true }).uncheck()
  await page.getByLabel('New tag', { exact: true }).fill('Ancient')
  await page.getByRole('button', { name: 'Add tag', exact: true }).click()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Ancient', exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#718c63')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  // A new placement uses the unchanged catalog definition, and can reuse a custom tag.
  await page.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 400, y: 400 } })
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).toBeChecked()
  await page.getByRole('checkbox', { name: 'Ancient', exact: true }).check()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Forest 2', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Ancient', exact: true }).uncheck()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Forest 2', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Ancient', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).not.toBeChecked()
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#abcdef')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('blocking')
  await page.getByRole('button', { name: 'Forest 3', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Ancient', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).toBeChecked()
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#718c63')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
})

test('oval width and height, local origin, rotation and movement stay physical across units and history', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => (await board.boundingBox())!.width).toBe(720)
  await page.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 300, y: 300 } })
  await page.getByLabel('Terrain width').fill('8')
  await page.getByLabel('Terrain height').fill('4')
  await page.getByLabel('X position').fill('10')
  await page.getByLabel('Y position').fill('10')
  await page.getByLabel('Rotation (degrees)').fill('90')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('Terrain width')).toHaveValue('6')
  await expect(page.getByLabel('Terrain height')).toHaveValue('6')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
  await expect(page.getByLabel('Terrain height')).toHaveValue('4')
  await page.getByLabel('Units').selectOption('cm')
  await expect(page.getByLabel('Terrain width')).toHaveValue('20.32')
  await expect(page.getByLabel('Terrain height')).toHaveValue('10.16')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.reload()
  await expect.poll(() => boardPixel(board, 120, 210)).toEqual([113, 140, 99, 255])
  const bounds = (await board.boundingBox())!
  // An 8×4 oval rotated 90 degrees about (10,10) has its centre at (8,14).
  // Its horizontal extent is 6..10 inches, unlike the former forced 8-inch circle.
  await page.mouse.click(bounds.x + 60, bounds.y + 210)
  await expect(page.getByLabel('Selected terrain', { exact: true })).toHaveCount(0)
  await page.mouse.click(bounds.x + 92, bounds.y + 153)
  await expect(page.getByLabel('Selected terrain', { exact: true })).toHaveCount(0)
  await page.mouse.click(bounds.x + 120, bounds.y + 210)
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
  await expect(page.getByLabel('Terrain height')).toHaveValue('4')
  await expect(page.getByLabel('X position')).toHaveValue('10')
  await expect(page.getByLabel('Y position')).toHaveValue('10')
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('90')
  await page.mouse.move(bounds.x + 120, bounds.y + 210)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 150, bounds.y + 255, { steps: 10 })
  await page.mouse.up()
  await expect(page.getByLabel('X position')).toHaveValue('12')
  await expect(page.getByLabel('Y position')).toHaveValue('13')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('X position')).toHaveValue('10')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
  await expect(page.getByLabel('Terrain height')).toHaveValue('4')
  await expect(page.getByLabel('X position')).toHaveValue('12')
  await expect(page.getByLabel('Y position')).toHaveValue('13')
})

test('catalog defaults follow Firefight tags with independently chosen visibility', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  const defaults = [
    ['Building', ['Impassable', 'Sight Blocking'], 'blocking'],
    ['Barricade', ['Cover'], 'clear'],
    ['Field', ['Difficult', 'Cover'], 'clear'],
    ['Forest', ['Difficult', 'Cover', 'Dense'], 'dense'],
    ['Hill', ['Cover', 'Steep'], 'clear'],
    ['Water', ['Difficult'], 'clear'],
    ['Lava', ['Dangerous'], 'clear'],
    ['Rubble', ['Difficult'], 'clear'],
    ['Ruin', ['Cover', 'Unstable'], 'clear'],
    ['Swamp', ['Difficult'], 'clear'],
    ['Mountain', ['Impassable', 'Sight Blocking'], 'blocking'],
    ['Wall', ['Climbable'], 'blocking'],
  ] as const
  for (const [name, tags, visibility] of defaults) {
    await page.getByLabel(`${name} footprint preview`, { exact: true }).dragTo(board, { targetPosition: { x: 300, y: 300 } })
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(tags.length)
    for (const tag of tags) await expect(page.getByRole('checkbox', { name: tag, exact: true })).toBeChecked()
    await expect(page.getByLabel('Visibility behaviour')).toHaveValue(visibility)
  }
})

test('custom tag drafts deduplicate names and do not commit until Apply', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  await page.getByLabel('Building footprint preview').dragTo(page.getByRole('region', { name: 'Terrain board' }), { targetPosition: { x: 180, y: 180 } })
  await page.getByLabel('New tag', { exact: true }).fill('   ')
  await page.getByRole('button', { name: 'Add tag', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a tag name')
  await page.getByLabel('New tag', { exact: true }).fill('  cover  ')
  await page.getByLabel('New tag', { exact: true }).press('Enter')
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: /^cover$/i })).toHaveCount(1)
  await page.getByLabel('New tag', { exact: true }).fill('Unique')
  await page.getByLabel('New tag', { exact: true }).press('Enter')
  await expect(page.getByRole('checkbox', { name: 'Unique', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  // Only placement was committed, so one undo removes the piece and its unapplied draft.
  await expect(page.getByRole('heading', { name: '0 terrain pieces', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Cover', exact: true })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Unique', exact: true })).toHaveCount(0)
})

test('visual rotation of an oval keeps its centre and shares the existing history', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Create layout' }).click()
  const board = page.getByRole('region', { name: 'Terrain board' })
  await expect.poll(async () => (await board.boundingBox())!.width).toBe(720)
  await page.getByLabel('Forest footprint preview').dragTo(board, { targetPosition: { x: 300, y: 300 } })
  await page.getByLabel('X position').fill('17')
  await page.getByLabel('Y position').fill('18')
  await page.getByLabel('Terrain height').fill('4')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  const bounds = (await board.boundingBox())!
  await page.keyboard.down('Control')
  await page.mouse.move(bounds.x + 300, bounds.y + 246)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 354, bounds.y + 300, { steps: 15 })
  await page.mouse.up()
  await page.keyboard.up('Control')
  await expect.poll(async () => Number(await page.getByLabel('Rotation (degrees)').inputValue())).toBeCloseTo(90, 6)
  await expect.poll(async () => Number(await page.getByLabel('X position').inputValue())).toBeCloseTo(22, 6)
  await expect.poll(async () => Number(await page.getByLabel('Y position').inputValue())).toBeCloseTo(17, 6)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('0')
  await expect(page.getByLabel('X position')).toHaveValue('17')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.reload()
  await expect.poll(() => boardPixel(board, 300, 300)).toEqual([113, 140, 99, 255])
  await page.mouse.click(bounds.x + 300, bounds.y + 300)
  await expect(page.getByLabel('Terrain width')).toHaveValue('6')
  await expect(page.getByLabel('Terrain height')).toHaveValue('4')
  await expect.poll(async () => Number(await page.getByLabel('Rotation (degrees)').inputValue())).toBeCloseTo(90, 6)
})

test('legacy circle saves load with independent axes and retain their properties', async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'terrain-planner.current-layout.v1'
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, JSON.stringify({
      version: 1, game: 'custom', board: { width: 48, height: 48 },
      pieces: [{ id: 'legacy-forest', name: 'Forest', footprint: { kind: 'circle', width: 6, height: 6 },
        x: 7.125, y: 8.25, rotation: 30, colour: '#123456', tags: ['Cover', 'Difficult', 'Dense', 'Ancient'], visibility: 'dense' }],
    }))
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain width')).toHaveValue('6')
  await expect(page.getByLabel('Terrain height')).toHaveValue('6')
  await expect(page.getByLabel('X position')).toHaveValue('7.125')
  await expect(page.getByLabel('Y position')).toHaveValue('8.25')
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('30')
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#123456')
  for (const tag of ['Cover', 'Difficult', 'Dense', 'Ancient']) await expect(page.getByRole('checkbox', { name: tag, exact: true })).toBeChecked()
  await page.getByLabel('Terrain height').fill('3')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('Terrain height')).toHaveValue('6')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain width')).toHaveValue('6')
  await expect(page.getByLabel('Terrain height')).toHaveValue('3')
  await expect(page.getByLabel('X position')).toHaveValue('7.125')
  await expect(page.getByLabel('Y position')).toHaveValue('8.25')
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('30')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#123456')
  await expect(page.getByRole('checkbox', { name: 'Ancient', exact: true })).toBeChecked()
})
