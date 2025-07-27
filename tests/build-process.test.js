const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Build Process', () => {
  const rootDir = path.join(__dirname, '..');
  
  describe('Build Scripts', () => {
    test('all required build scripts should exist', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const requiredScripts = [
        'build',
        'build:all',
        'build:frontend',
        'build:backend',
        'build:electron',
        'dev',
        'start',
        'test'
      ];
      
      requiredScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
      });
    });
    
    test('build:all should be an alias for build', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      expect(packageJson.scripts['build:all']).toBe('npm run build');
    });
    
    test('build script should execute all sub-builds in correct order', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const buildScript = packageJson.scripts.build;
      
      // ElectronのTypeScriptコンパイルが最初
      expect(buildScript).toContain('build:electron');
      
      // その後にフロントエンドとバックエンド
      expect(buildScript).toContain('build:frontend');
      expect(buildScript).toContain('build:backend');
      
      // 正しい順序を確認
      const electronIndex = buildScript.indexOf('build:electron');
      const frontendIndex = buildScript.indexOf('build:frontend');
      const backendIndex = buildScript.indexOf('build:backend');
      
      expect(electronIndex).toBeLessThan(frontendIndex);
      expect(frontendIndex).toBeLessThan(backendIndex);
    });
  });
  
  describe('Development Scripts', () => {
    test('dev script should use concurrently for parallel execution', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const devScript = packageJson.scripts.dev;
      
      expect(devScript).toContain('concurrently');
      expect(devScript).toContain('dev:frontend');
      expect(devScript).toContain('dev:backend');
      expect(devScript).toContain('dev:electron');
    });
    
    test('all dev sub-scripts should exist', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const devSubScripts = ['dev:frontend', 'dev:backend', 'dev:electron'];
      
      devSubScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
      });
    });
  });
  
  describe('Build Outputs', () => {
    test('frontend build should specify correct output directory', () => {
      const frontendPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'frontend/package.json'), 'utf-8')
      );
      
      const buildScript = frontendPackageJson.scripts.build;
      
      // Viteのビルドコマンドを確認
      expect(buildScript).toContain('vite build');
      expect(buildScript).toContain('tsc');
    });
    
    test('electron TypeScript configuration should be correct', () => {
      const tsconfigPath = path.join(rootDir, 'electron/tsconfig.json');
      
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      const tsconfig = JSON.parse(
        fs.readFileSync(tsconfigPath, 'utf-8')
      );
      
      expect(tsconfig.compilerOptions.outDir).toBe('./dist');
      expect(tsconfig.compilerOptions.module).toBe('ES2022');
    });
  });
  
  describe('Packaging Scripts', () => {
    test('packaging scripts should exist for all platforms', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const packagingScripts = [
        'package',
        'package:win',
        'package:mac',
        'package:linux'
      ];
      
      packagingScripts.forEach(script => {
        expect(packageJson.scripts).toHaveProperty(script);
        expect(packageJson.scripts[script]).toContain('electron-builder');
      });
    });
  });
  
  describe('Test Integration', () => {
    test('test script should run both frontend and backend tests', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const testScript = packageJson.scripts.test;
      
      expect(testScript).toContain('test:frontend');
      expect(testScript).toContain('test:backend');
    });
    
    test('test sub-scripts should exist', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      expect(packageJson.scripts['test:frontend']).toBeDefined();
      expect(packageJson.scripts['test:backend']).toBeDefined();
    });
  });
  
  describe('Workspace Integration', () => {
    test('workspaces should be able to reference root dependencies', () => {
      const rootPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const frontendPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'frontend/package.json'), 'utf-8')
      );
      
      const electronPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'electron/package.json'), 'utf-8')
      );
      
      // TypeScriptがルートにあることを確認
      expect(rootPackageJson.devDependencies.typescript).toBeDefined();
      
      // ワークスペースにはTypeScriptがないことを確認
      expect(frontendPackageJson.devDependencies?.typescript).toBeUndefined();
      expect(electronPackageJson.devDependencies?.typescript).toBeUndefined();
    });
  });
});