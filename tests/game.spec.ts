import { expect, test } from '@playwright/test'

test('loads the arcade, switches difficulty, and shows instructions', async ({
  page
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'One spark changes everything.' })
  ).toBeVisible()
  await expect(page.getByTestId('timer')).toContainText('01:30')
  await page.getByRole('button', { name: 'OVERDRIVE' }).click()
  await expect(page.getByRole('button', { name: 'OVERDRIVE' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await page.getByRole('button', { name: 'How to play' }).click()
  await expect(
    page.getByRole('heading', { name: 'Make your first reaction' })
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('plays, detonates, pauses, resumes, and resets', async ({
  page,
  isMobile
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'START REACTION' }).click()
  await expect(page.getByRole('button', { name: 'Pause game' })).toBeEnabled()
  if (isMobile) {
    await page.getByRole('button', { name: 'DETONATE' }).tap()
  } else {
    await page.keyboard.press('Space')
  }
  await expect(page.getByTestId('stock')).toHaveText('04')
  await expect(page.getByTestId('score')).not.toHaveText('0000000')
  await page.getByRole('button', { name: 'Pause game' }).click()
  await expect(
    page.getByRole('heading', { name: 'In suspension.' })
  ).toBeVisible()
  const timer = await page.getByTestId('timer').textContent()
  await page.waitForTimeout(250)
  await expect(page.getByTestId('timer')).toHaveText(timer!)
  await page.getByRole('button', { name: 'RESUME SESSION' }).click()
  await expect(
    page.getByRole('heading', { name: 'In suspension.' })
  ).not.toBeVisible()
  await page.getByRole('button', { name: 'Reset game' }).click()
  await expect(
    page.getByRole('button', { name: 'START REACTION' })
  ).toBeVisible()
  await expect(page.getByTestId('stock')).toHaveText('05')
  await expect(page.getByTestId('score')).toHaveText('0000000')
})

test('fits narrow screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'START REACTION' })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
})

test('keyboard pause is guarded, and leaving the window pauses automatically', async ({
  page,
  isMobile
}) => {
  test.skip(isMobile, 'Keyboard-specific controls')
  await page.goto('/')
  await page.getByRole('button', { name: 'START REACTION' }).click()
  await page.keyboard.press('p')
  await expect(
    page.getByRole('heading', { name: 'In suspension.' })
  ).toBeVisible()
  await page.keyboard.press('p')
  await expect(
    page.getByRole('heading', { name: 'In suspension.' })
  ).not.toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(
    page.getByRole('heading', { name: 'In suspension.' })
  ).toBeVisible()
})

test('completes a run, saves its high score, and restores it after reload', async ({
  page
}) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'START REACTION' }).click()
  await page.locator('canvas').focus()
  await page.keyboard.press('Space')
  await page.clock.runFor(7000)
  await expect(page.getByTestId('score')).not.toHaveText('0000000')
  await page.clock.fastForward(100000)
  await expect(
    page.getByRole('heading', { name: 'Signal lost.' })
  ).toBeVisible()
  const score = Number(await page.getByTestId('score').textContent())
  expect(score).toBeGreaterThan(0)
  await expect
    .poll(() =>
      page.evaluate(() => Number(localStorage.getItem('react-arcade-best')))
    )
    .toBe(score)
  await page.reload()
  await expect(page.getByTestId('score')).toHaveText('0000000')
  expect(
    await page.evaluate(() => Number(localStorage.getItem('react-arcade-best')))
  ).toBe(score)
})
