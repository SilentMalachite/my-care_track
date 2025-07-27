const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Project Structure', () => {
  const rootDir = path.join(__dirname, '..');
  
  describe('Frontend Directory Structure', () => {
    test('should have only one main frontend directory', () => {
      const frontendDirs = execSync('find . -type d -name "frontend" -not -path "*/node_modules/*"', { cwd: rootDir })
        .toString()
        .trim()
        .split('\n')
        .filter(dir => dir);
      
      // 重複を除いたユニークなfrontendディレクトリは1つであるべき
      const uniqueFrontendPaths = [...new Set(frontendDirs.map(dir => {
        // backend内のfrontendは除外して評価
        if (dir.includes('backend/frontend')) return null;
        return dir;
      }).filter(Boolean))];
      
      expect(uniqueFrontendPaths.length).toBe(1);
      expect(uniqueFrontendPaths[0]).toBe('./frontend');
    });
    
    test('backend directory should not contain frontend code', () => {
      const backendFrontendPath = path.join(rootDir, 'backend', 'frontend');
      const shouldNotExist = !fs.existsSync(backendFrontendPath);
      
      expect(shouldNotExist).toBe(true);
    });
  });
  
  describe('Package.json Files', () => {
    test('should have package.json files in expected locations only', () => {
      const expectedPackageJsonLocations = [
        'package.json',           // root - orchestration
        'frontend/package.json',  // frontend dependencies
        'electron/package.json'   // electron dependencies
      ];
      
      const actualPackageJsonFiles = execSync('find . -name "package.json" -not -path "*/node_modules/*"', { cwd: rootDir })
        .toString()
        .trim()
        .split('\n')
        .map(file => file.replace('./', ''))
        .filter(file => file);
      
      // 期待される場所にのみpackage.jsonが存在すべき
      const unexpectedFiles = actualPackageJsonFiles.filter(
        file => !expectedPackageJsonLocations.includes(file)
      );
      
      expect(unexpectedFiles).toEqual([]);
    });
    
    test('root package.json should have workspace configuration', () => {
      const rootPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      // ワークスペース設定があるべき
      expect(rootPackageJson.workspaces).toBeDefined();
      expect(rootPackageJson.workspaces).toContain('frontend');
      expect(rootPackageJson.workspaces).toContain('electron');
    });
  });
  
  describe('Build Process', () => {
    test('should have unified build scripts in root package.json', () => {
      const rootPackageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      
      const requiredScripts = [
        'build:frontend',
        'build:backend',
        'build:electron',
        'build:all',
        'dev',
        'start'
      ];
      
      requiredScripts.forEach(script => {
        expect(rootPackageJson.scripts).toHaveProperty(script);
      });
    });
    
    test('all package.json files should use compatible Node versions', () => {
      const packageFiles = [
        'package.json',
        'frontend/package.json',
        'electron/package.json'
      ];
      
      const nodeVersions = packageFiles.map(file => {
        const fullPath = path.join(rootDir, file);
        if (fs.existsSync(fullPath)) {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          return content.engines?.node;
        }
        return undefined;
      }).filter(Boolean);
      
      // すべて同じNode.jsバージョン要件を持つべき
      const uniqueVersions = [...new Set(nodeVersions)];
      expect(uniqueVersions.length).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Directory Organization', () => {
    test('should have clear separation of concerns', () => {
      const expectedStructure = {
        backend: 'Rails API code',
        frontend: 'React application',
        electron: 'Desktop shell',
        tests: 'Integration tests',
        docs: 'Documentation'
      };
      
      Object.keys(expectedStructure).forEach(dir => {
        const dirPath = path.join(rootDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });
});