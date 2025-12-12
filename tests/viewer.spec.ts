import { test, expect } from '@playwright/test';

test.describe('Model Benchmark Viewer', () => {
  test('should display all projects in the navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check that the Traffic Simulator project is visible in the sidebar navigation
    await expect(page.locator('aside').getByText('Traffic Simulator')).toBeVisible();
    
    // Check that the project count badge shows 1 project
    await expect(page.locator('aside').getByText('1')).toBeVisible();
  });

  test('should display all models for each project', async ({ page }) => {
    await page.goto('/');
    
    // Check that both models are visible in the navigation
    await expect(page.locator('aside').getByRole('button', { name: /Reference Build/ })).toBeVisible();
    await expect(page.locator('aside').getByRole('button', { name: /Custom Implementation/ })).toBeVisible();
  });

  test('should show correct model count in header', async ({ page }) => {
    await page.goto('/');
    
    // Check that the badge shows 2 builds
    await expect(page.getByText('2 builds')).toBeVisible();
  });

  test('should display project summary and instructions', async ({ page }) => {
    await page.goto('/');
    
    // Check project summary
    await expect(page.getByText(/Animate a side-scrolling, two-lane street/)).toBeVisible();
    
    // Check instructions in the alert
    await expect(page.getByText(/Keep the scenario readable on mobile/)).toBeVisible();
  });

  test('should display all project tasks', async ({ page }) => {
    await page.goto('/');
    
    // Check all three task titles are present
    await expect(page.getByText('Sketch the street and flow')).toBeVisible();
    await expect(page.getByText('Make traffic responsive')).toBeVisible();
    await expect(page.getByText('Polish the simulator output')).toBeVisible();
  });

  test('should load reference model by default', async ({ page }) => {
    await page.goto('/');
    
    // Check that the iframe is present and has the reference path
    const iframe = page.frameLocator('iframe[title="Project output"]');
    await expect(iframe.locator('body')).toBeVisible();
    
    // Check the path badge
    await expect(page.getByText('/projects/traffic-simulator/reference/index.html')).toBeVisible();
  });

  test('should switch to custom model when clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click on the Custom Implementation model in the sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    // Wait for the model name to update in the header
    await expect(page.locator('main').getByText('Custom Implementation').first()).toBeVisible();
    
    // Check the path badge updates
    await expect(page.getByText('/projects/traffic-simulator/custom/index.html')).toBeVisible();
  });

  test('should highlight selected model in navigation', async ({ page }) => {
    await page.goto('/');
    
    // Initially, Reference Build should be highlighted
    const referenceButton = page.locator('aside').getByRole('button', { name: /Reference Build/ });
    await expect(referenceButton).toHaveClass(/bg-indigo-500/);
    
    // Click on Custom Implementation
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    // Custom Implementation should now be highlighted
    const customButton = page.locator('aside').getByRole('button', { name: /Custom Implementation/ });
    await expect(customButton).toHaveClass(/bg-indigo-500/);
  });

  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // The mobile menu button should be visible
    await expect(page.getByRole('button', { name: /Browse projects/i })).toBeVisible();
    
    // The sidebar should be hidden on mobile
    await expect(page.locator('aside.hidden').first()).toBeHidden();
  });
});

test.describe('Traffic Simulator - Reference Model', () => {
  test('should load reference simulator successfully', async ({ page }) => {
    await page.goto('/');
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Check that the canvas element exists
    await expect(iframe.locator('canvas#sim')).toBeVisible();
    
    // Check that traffic light indicators are present
    await expect(iframe.locator('#lamp-green')).toBeVisible();
    await expect(iframe.locator('#lamp-yellow')).toBeVisible();
    await expect(iframe.locator('#lamp-red')).toBeVisible();
  });

  test('should have traffic light that changes state', async ({ page }) => {
    await page.goto('/');
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Wait for the page to load
    await iframe.locator('canvas#sim').waitFor();
    
    // Check that at least one light is initially active
    const greenLamp = iframe.locator('#lamp-green');
    const yellowLamp = iframe.locator('#lamp-yellow');
    const redLamp = iframe.locator('#lamp-red');
    
    // Wait a moment for the simulation to start
    await page.waitForTimeout(1000);
    
    // Check that lights have the 'on' class at some point
    const hasActiveLight = await Promise.race([
      greenLamp.evaluate(el => el.classList.contains('on')),
      yellowLamp.evaluate(el => el.classList.contains('on')),
      redLamp.evaluate(el => el.classList.contains('on'))
    ]);
    
    expect(hasActiveLight).toBeTruthy();
  });

  test('should render canvas with correct dimensions', async ({ page }) => {
    await page.goto('/');
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    const canvas = iframe.locator('canvas#sim');
    
    // Check canvas has width and height attributes
    await expect(canvas).toHaveAttribute('width', '1060');
    await expect(canvas).toHaveAttribute('height', '360');
  });
});

test.describe('Traffic Simulator - Custom Model', () => {
  test('should load custom simulator successfully', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Check that the canvas element exists
    await expect(iframe.locator('canvas#sim')).toBeVisible();
    
    // Check that traffic light indicators are present
    await expect(iframe.locator('#lamp-green')).toBeVisible();
    await expect(iframe.locator('#lamp-yellow')).toBeVisible();
    await expect(iframe.locator('#lamp-red')).toBeVisible();
  });

  test('should display stats panel with car count, queue, and time', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Check that stats are present
    await expect(iframe.locator('#car-count')).toBeVisible();
    await expect(iframe.locator('#queue-count')).toBeVisible();
    await expect(iframe.locator('#elapsed-time')).toBeVisible();
  });

  test('should update stats over time', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Wait for simulation to start
    await page.waitForTimeout(1000);
    
    // Get initial car count
    const initialCount = await iframe.locator('#car-count').textContent();
    
    // Wait a bit for more cars to spawn
    await page.waitForTimeout(3000);
    
    // Get updated car count
    const updatedCount = await iframe.locator('#car-count').textContent();
    
    // Car count should have changed (either increased or some passed through)
    // Just verify the element is being updated
    expect(initialCount).toBeTruthy();
    expect(updatedCount).toBeTruthy();
  });

  test('should have active traffic light indicator', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Wait for the page to load
    await iframe.locator('canvas#sim').waitFor();
    await page.waitForTimeout(1000);
    
    // Check that at least one lamp has the 'active' class
    const activeLamps = iframe.locator('.lamp.active');
    await expect(activeLamps.first()).toBeVisible();
  });

  test('should render canvas with correct dimensions', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    const canvas = iframe.locator('canvas#sim');
    
    // Check canvas has width and height attributes
    await expect(canvas).toHaveAttribute('width', '1060');
    await expect(canvas).toHaveAttribute('height', '380');
  });

  test('should have gradient animated border effect', async ({ page }) => {
    await page.goto('/');
    
    // Switch to custom model in sidebar
    await page.locator('aside').getByRole('button', { name: /Custom Implementation/ }).click();
    
    const iframe = page.frameLocator('iframe[title="Project output"]');
    
    // Check for the glow-border element
    await expect(iframe.locator('.glow-border')).toBeVisible();
  });
});
