const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Dependency Management', () => {
  const rootDir = path.join(__dirname, '..');
  
  const getPackageJson = (relativePath) => {
    const fullPath = path.join(rootDir, relativePath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    }
    return null;
  };

  describe('Dependency Duplication', () => {
    test('should not have duplicate dependencies across package.json files', () => {
      const packageFiles = [
        'package.json',
        'frontend/package.json',
        'electron/package.json'
      ];
      
      const allDependencies = {};
      const duplicates = {};
      
      packageFiles.forEach(file => {
        const pkg = getPackageJson(file);
        if (!pkg) return;
        
        const dependencies = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        Object.entries(dependencies).forEach(([name, version]) => {
          if (!allDependencies[name]) {
            allDependencies[name] = {};
          }
          allDependencies[name][file] = version;
        });
      });
      
      // 重複を検出（rootのdevDependenciesにあるものは除外）
      const rootPkg = getPackageJson('package.json');
      const rootDevDeps = Object.keys(rootPkg.devDependencies || {});
      
      Object.entries(allDependencies).forEach(([dep, locations]) => {
        const files = Object.keys(locations);
        // rootのdevDependenciesにあるものは、サブパッケージにあっても問題ない
        if (files.length > 1 && !rootDevDeps.includes(dep)) {
          duplicates[dep] = locations;
        }
      });
      
      expect(Object.keys(duplicates)).toEqual([]);
    });
    
    test('should have consistent versions for shared dependencies', () => {
      const packageFiles = [
        'frontend/package.json',
        'electron/package.json'
      ];
      
      const sharedDeps = {};
      
      packageFiles.forEach(file => {
        const pkg = getPackageJson(file);
        if (!pkg) return;
        
        const dependencies = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        Object.entries(dependencies).forEach(([name, version]) => {
          if (!sharedDeps[name]) {
            sharedDeps[name] = {};
          }
          sharedDeps[name][file] = version;
        });
      });
      
      const inconsistentVersions = {};
      
      Object.entries(sharedDeps).forEach(([dep, locations]) => {
        const versions = Object.values(locations);
        const uniqueVersions = [...new Set(versions)];
        
        if (uniqueVersions.length > 1) {
          inconsistentVersions[dep] = locations;
        }
      });
      
      expect(inconsistentVersions).toEqual({});
    });
    
    test('development tools should be in root package.json only', () => {
      const devTools = [
        'jest',
        'electron-builder',
        'concurrently',
        'typescript',
        'eslint',
        'prettier'
      ];
      
      const packageFiles = [
        'frontend/package.json',
        'electron/package.json'
      ];
      
      const misplacedDevTools = {};
      
      packageFiles.forEach(file => {
        const pkg = getPackageJson(file);
        if (!pkg) return;
        
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        devTools.forEach(tool => {
          if (Object.keys(allDeps).some(dep => dep.includes(tool))) {
            if (!misplacedDevTools[file]) {
              misplacedDevTools[file] = [];
            }
            misplacedDevTools[file].push(tool);
          }
        });
      });
      
      expect(misplacedDevTools).toEqual({});
    });
  });
  
  describe('Workspace Configuration', () => {
    test('should properly configure npm workspaces', () => {
      const rootPkg = getPackageJson('package.json');
      
      expect(rootPkg.workspaces).toBeDefined();
      expect(rootPkg.workspaces).toContain('frontend');
      expect(rootPkg.workspaces).toContain('electron');
    });
    
    test('workspace packages should not duplicate root dependencies', () => {
      const rootPkg = getPackageJson('package.json');
      const rootDeps = Object.keys(rootPkg.dependencies || {});
      const rootDevDeps = Object.keys(rootPkg.devDependencies || {});
      
      const workspaceDuplicates = {};
      
      rootPkg.workspaces.forEach(workspace => {
        const workspacePkg = getPackageJson(`${workspace}/package.json`);
        if (!workspacePkg) return;
        
        const workspaceDeps = [
          ...Object.keys(workspacePkg.dependencies || {}),
          ...Object.keys(workspacePkg.devDependencies || {})
        ];
        
        const duplicatesInWorkspace = workspaceDeps.filter(dep => 
          rootDeps.includes(dep) || rootDevDeps.includes(dep)
        );
        
        if (duplicatesInWorkspace.length > 0) {
          workspaceDuplicates[workspace] = duplicatesInWorkspace;
        }
      });
      
      expect(workspaceDuplicates).toEqual({});
    });
  });
  
  describe('Lock File Management', () => {
    test('should have a single lock file at the root', () => {
      const lockFiles = [
        'package-lock.json',
        'frontend/package-lock.json',
        'electron/package-lock.json',
        'yarn.lock',
        'frontend/yarn.lock',
        'electron/yarn.lock'
      ];
      
      const existingLockFiles = lockFiles.filter(file => 
        fs.existsSync(path.join(rootDir, file))
      );
      
      // ルートに1つのロックファイルのみ存在すべき
      expect(existingLockFiles.length).toBe(1);
      expect(existingLockFiles[0]).toMatch(/^(package-lock\.json|yarn\.lock)$/);
    });
  });
});