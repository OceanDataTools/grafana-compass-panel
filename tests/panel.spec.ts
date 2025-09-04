import { test, expect } from '@grafana/plugin-e2e';

test('should display "No data" when panel has no series', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });

  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should display the needle when data is present', async ({
  panelEditPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Compass Panel');

  // Check that needle is visible
  await expect(page.getByTestId('compass-needle')).toBeVisible();
});

test('should display numeric heading when "Show Numeric Heading" is enabled', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  const options = panelEditPage.getCustomOptions('Compass Panel');
  const showHeadingValue = options.getSwitch('Show Numeric Heading');

  await showHeadingValue.check();

  await expect(page.getByTestId('compass-numeric-heading')).toBeVisible();
});

test('should display arrow needle when selected', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

  const options = panelEditPage.getCustomOptions('Compass Panel');
  const needleType = options.getSelect('Needle Type');

  await needleType.select('arrow');

  await expect(page.getByTestId('compass-arrow-needle')).toBeVisible();
});

// test('should display custom PNG needle when selected', async ({
//   gotoPanelEditPage,
//   readProvisionedDashboard,
//   page,
// }) => {
//   const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
//   const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

//   const options = panelEditPage.getCustomOptions('Compass Panel');
//   const needleType = options.getSelect('Needle Type');

//   await needleType.select('png');

//   await expect(page.getByTestId('compass-png-needle')).toBeVisible();
// });

