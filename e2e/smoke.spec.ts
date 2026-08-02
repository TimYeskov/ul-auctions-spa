import { expect, test } from '@playwright/test'

test.describe('UL Auctions smoke', () => {
  test('list loads and opens auction detail', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Аукционы' })).toBeVisible()
    await expect(page.getByTestId('auction-card').first()).toBeVisible()

    await page.getByRole('link', { name: '№ 00000001059' }).first().click()
    await expect(page.getByRole('heading', { name: '№ 00000001059' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Торги' })).toBeVisible()
  })

  test('filters sync to URL search params', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('00000001059').fill('01060')
    await expect(page).toHaveURL(/cargo_num=01060/)
    await expect(page.getByTestId('auction-card')).toHaveCount(1)
    await expect(page.getByRole('link', { name: '№ 00000001060' })).toBeVisible()
  })

  test('place bet updates detail trading state', async ({ page }) => {
    await page.goto('/auctions/3a05d045-0e67-4f85-b20a-de81d18bba7a/bet')

    await expect(page.getByRole('heading', { name: 'Сделать ставку' })).toBeVisible()

    const priceInput = page.locator('input[type="number"]')
    await expect(priceInput).toBeVisible()
    const recommended = await priceInput.inputValue()
    expect(Number(recommended)).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Отправить ставку' }).click()

    await expect(page.getByRole('heading', { name: '№ 00000001059' })).toBeVisible()
    await expect(page.getByText('Лидирует')).toBeVisible()
    await expect(page.getByText('Моя ставка').locator('..')).toContainText(
      new RegExp(Number(recommended).toLocaleString('ru-RU')),
    )
  })

  test('hidden bets history shows dedicated state', async ({ page }) => {
    await page.goto('/auctions/22222222-2222-4222-8222-222222222222/bets')

    await expect(
      page.getByRole('heading', { name: 'История ставок скрыта' }),
    ).toBeVisible()
  })
})
