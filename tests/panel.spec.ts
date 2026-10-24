import { test, expect } from '@grafana/plugin-e2e';

test('should display "No data" in case panel data is empty', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should display numeric heading when enabled', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  // Load the dashboard and panel
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });

  await expect(panelEditPage.panel.locator.getByTestId('compass-numeric-heading')).toBeVisible();
});

test('should display water current arrow and readouts without wind', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '23' });
  const panel = panelEditPage.panel.locator;

  await expect(panel.getByTestId('compass-arrow-current')).toBeVisible();
  await expect(panel.getByTestId('currentrose-numeric-current-dir')).toHaveText('200°');
  await expect(panel.getByTestId('currentrose-numeric-current-spd')).toHaveText('42.50 cm/s');
  await expect(panel.getByTestId('compass-arrow-truewind')).toHaveCount(0);
});

test('should display water current alongside true and apparent wind', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '26' });
  const panel = panelEditPage.panel.locator;

  await expect(panel.getByTestId('compass-arrow-current')).toBeVisible();
  await expect(panel.getByTestId('compass-arrow-truewind')).toBeVisible();
  await expect(panel.getByTestId('compass-arrow-apparentwind')).toBeVisible();
  await expect(panel.getByTestId('currentrose-numeric-current-dir')).toHaveText('200°');
  await expect(panel.getByTestId('windrose-numeric-truewind-dir')).toHaveText('150°');
  await expect(panel.getByTestId('windrose-numeric-apparent-dir')).toHaveText('140°');
});
