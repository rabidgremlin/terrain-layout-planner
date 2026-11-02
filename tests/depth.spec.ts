import { test, expect } from '@playwright/test'

const savedLayout = (footprint: object) => ({
  version: 1, game: 'custom', board: { width: 48, height: 36 },
  pieces: [{ id: 'saved-terrain', name: 'Forest', footprint, x: 7.125, y: 8.25,
    rotation: 30, colour: '#123456', tags: ['Cover', 'Difficult', 'Dense', 'Ancient'], visibility: 'dense' }],
})

test('depth-based saves expose independent terrain depth and round-trip edits', async ({ page }) => {
  await page.addInitScript(layout => {
    const key = 'terrain-planner.current-layout.v1'
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(layout))
  }, savedLayout({ kind: 'ellipse', width: 8, depth: 3 }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Forest 1', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain depth')).toHaveValue('3')
  await expect(page.getByLabel('Terrain height')).toHaveCount(0)
  await page.getByLabel('Terrain depth').fill('4.25')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByLabel('Terrain depth')).toHaveValue('3')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.getByLabel('Units').selectOption('cm')
  await expect(page.getByLabel('Terrain depth')).toHaveValue('10.795')
  await expect(page.getByLabel('Terrain width')).toHaveValue('20.32')
  await page.reload()
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain depth')).toHaveValue('4.25')
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
  await expect(page.getByLabel('X position')).toHaveValue('7.125')
  await expect(page.getByLabel('Y position')).toHaveValue('8.25')
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('30')
  await expect(page.getByLabel('Colour', { exact: true })).toHaveValue('#123456')
  await expect(page.getByLabel('Visibility behaviour')).toHaveValue('dense')
  await expect(page.getByRole('checkbox', { name: 'Ancient', exact: true })).toBeChecked()
})

test('legacy elliptical height loads as depth without changing geometry', async ({ page }) => {
  await page.addInitScript(layout => localStorage.setItem('terrain-planner.current-layout.v1', JSON.stringify(layout)),
    savedLayout({ kind: 'ellipse', width: 8, height: 3.25 }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain depth')).toHaveValue('3.25')
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
  await expect(page.getByLabel('X position')).toHaveValue('7.125')
  await expect(page.getByLabel('Y position')).toHaveValue('8.25')
  await expect(page.getByLabel('Rotation (degrees)')).toHaveValue('30')
})

test('explicit footprint depth takes precedence over legacy height', async ({ page }) => {
  await page.addInitScript(layout => localStorage.setItem('terrain-planner.current-layout.v1', JSON.stringify(layout)),
    savedLayout({ kind: 'rectangle', width: 8, depth: 3, height: 9 }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Forest 1', exact: true }).click()
  await expect(page.getByLabel('Terrain depth')).toHaveValue('3')
  await expect(page.getByLabel('Terrain width')).toHaveValue('8')
})

for (const depth of [0, -1, null, '4']) {
  test(`invalid depth ${JSON.stringify(depth)} is rejected even with a valid legacy height`, async ({ page }) => {
    await page.addInitScript(layout => localStorage.setItem('terrain-planner.current-layout.v1', JSON.stringify(layout)),
      savedLayout({ kind: 'ellipse', width: 8, depth, height: 6 }))
    await page.goto('/')
    await expect(page.getByRole('alert')).toContainText('Your saved layout could not be loaded')
    await expect(page.getByRole('button', { name: 'Create layout', exact: true })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Terrain board', exact: true })).toHaveCount(0)
  })
}
