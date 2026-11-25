"""Drive real customer branching controls; no application state injection."""
def choose_card(page, value):
    if value in ('one', 'multiple'):
        page.locator(f'button[data-gift="{value}"]').click()
        assert page.locator(f'input[name=giftType][value="{value}"]').is_checked()
        page.locator('#plan-next').click()
    else:
        page.locator(f'label.option-card:has(input[value="{value}"])').click()
        assert page.locator(f'input[name=strategy][value="{value}"]').is_checked()


def review_schedule(page, **kwargs):
    if page.locator('[data-panel=allocation]').is_visible():
        page.locator('#choose-equal').click()
        page.locator('#plan-next').click(**kwargs)
    else:
        page.locator('#review').click(**kwargs)


def prepare_plan(page, *, btc='0.00100002', count='5', date='2030-01-02',
                 period='yearly', manual=None, one=False):
    if page.locator('#plan-ready').is_visible():
        page.locator('#ready-back').click()
    if page.locator('#schedule-review').is_visible():
        page.locator('#edit').click()
    if page.locator('[data-panel=welcome]').is_visible():
        page.locator('#plan-next').click()
    for _ in range(6):
        if page.locator('[data-panel=amount]').is_visible():
            break
        page.locator('#plan-back').click()
    assert page.locator('[data-panel=amount]').is_visible()
    page.locator('#unit-btc').click()
    page.locator('#btc').fill(btc)
    page.locator('#plan-next').click()
    if not page.locator('[data-panel=type]').is_visible():
        return False
    choose_card(page, 'one' if one else 'multiple')
    if not one:
        page.locator('#count').fill(count)
        page.locator('#period').select_option(period)
    page.locator('#start').fill(date)
    if not one:
        page.locator('#plan-next').click()
        if not page.locator('[data-panel=allocation]').is_visible():
            return False
        if manual is not None:
            page.locator('#choose-variable').click()
            page.locator('#plan-next').click()
            choose_card(page, 'manual')
            page.locator('#plan-next').click()
            page.locator('#manual').fill(manual)
    return True
