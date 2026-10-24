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
  await expect(panel.getByTestId('currentrose-numeric-current-spd')).toHaveText('1.50 kts');
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

test('should render a custom SVG needle centered on the dial', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '29' });
  const panel = panelEditPage.panel.locator;

  const needle = panel.getByTestId('compass-svg-needle');
  await expect(needle).toBeVisible();
  const needleBox = (await needle.boundingBox())!;
  // Compare against the dial face circle (symmetric about the pivot), allowing for
  // sub-pixel rounding of the bounding boxes.
  const faceBox = (await panel.getByTestId('compass-face').boundingBox())!;
  expect(Math.abs(needleBox.x + needleBox.width / 2 - (faceBox.x + faceBox.width / 2))).toBeLessThan(1.5);
  expect(Math.abs(needleBox.y + needleBox.height / 2 - (faceBox.y + faceBox.height / 2))).toBeLessThan(1.5);
});
