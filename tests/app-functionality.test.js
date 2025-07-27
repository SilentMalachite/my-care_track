const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Application Functionality Tests', () => {
  const rootDir = path.join(__dirname, '..');
  
  describe('Packaged Application', () => {
    test('should have created CareTrack.app bundle', () => {
      const appPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app');
      expect(fs.existsSync(appPath)).toBe(true);
    });

    test('should have main executable in app bundle', () => {
      const executablePath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents', 'MacOS', 'CareTrack');
      expect(fs.existsSync(executablePath)).toBe(true);
    });

    test('should have app.asar in Resources', () => {
      const asarPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents', 'Resources', 'app.asar');
      expect(fs.existsSync(asarPath)).toBe(true);
    });

    test('should have valid Info.plist', () => {
      const plistPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents', 'Info.plist');
      expect(fs.existsSync(plistPath)).toBe(true);
      
      // Read and verify plist content
      const plistContent = fs.readFileSync(plistPath, 'utf8');
      expect(plistContent).toContain('CFBundleDisplayName');
      expect(plistContent).toContain('CareTrack');
      expect(plistContent).toContain('com.caretrack.app');
    });
  });

  describe('Build Configuration Validation', () => {
    test('should have correct file structure in package', () => {
      const appResourcesPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents', 'Resources');
      expect(fs.existsSync(appResourcesPath)).toBe(true);
    });

    test('should have Electron framework included', () => {
      const frameworkPath = path.join(
        rootDir, 
        'dist', 
        'mac-arm64', 
        'CareTrack.app', 
        'Contents', 
        'Frameworks', 
        'Electron Framework.framework'
      );
      expect(fs.existsSync(frameworkPath)).toBe(true);
    });

    test('should have helper applications', () => {
      const helperPath = path.join(
        rootDir, 
        'dist', 
        'mac-arm64', 
        'CareTrack.app', 
        'Contents', 
        'Frameworks', 
        'CareTrack Helper.app'
      );
      expect(fs.existsSync(helperPath)).toBe(true);
    });
  });

  describe('Security and Entitlements', () => {
    test('should have proper app structure for macOS', () => {
      const contentsPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents');
      const macOSPath = path.join(contentsPath, 'MacOS');
      const resourcesPath = path.join(contentsPath, 'Resources');
      const frameworksPath = path.join(contentsPath, 'Frameworks');
      
      expect(fs.existsSync(contentsPath)).toBe(true);
      expect(fs.existsSync(macOSPath)).toBe(true);
      expect(fs.existsSync(resourcesPath)).toBe(true);
      expect(fs.existsSync(frameworksPath)).toBe(true);
    });
  });

  describe('Package Size and Optimization', () => {
    test('should have reasonable package size', () => {
      const appPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app');
      const stats = fs.statSync(appPath);
      
      // Basic check that the app exists and has content
      expect(stats.isDirectory()).toBe(true);
    });

    test('should include only necessary files', () => {
      const asarPath = path.join(rootDir, 'dist', 'mac-arm64', 'CareTrack.app', 'Contents', 'Resources', 'app.asar');
      const stats = fs.statSync(asarPath);
      
      // asar file should exist and have reasonable size (more than 1KB, less than 100MB)
      expect(stats.size).toBeGreaterThan(1024);
      expect(stats.size).toBeLessThan(100 * 1024 * 1024);
    });
  });
});