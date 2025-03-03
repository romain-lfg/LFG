#!/usr/bin/env node

/**
 * Authentication Component Generator
 * 
 * This script generates authentication-related components with proper typing,
 * testing, and documentation.
 * 
 * Usage:
 * 1. Run with: node scripts/generate-auth-component.js ComponentName
 * 2. Follow the interactive prompts
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions for logging
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}[STEP]${colors.reset} ${msg}`),
  result: (msg) => console.log(`${colors.magenta}[RESULT]${colors.reset} ${msg}`),
};

// Ask for user input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}[QUESTION]${colors.reset} ${question} `, (answer) => {
      resolve(answer);
    });
  });
};

// Ask for multiple choice
const askMultipleChoice = async (question, choices) => {
  const choicesStr = choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n');
  const answer = await askQuestion(`${question}\n${choicesStr}\nEnter number: `);
  const index = parseInt(answer, 10) - 1;
  
  if (index >= 0 && index < choices.length) {
    return choices[index];
  } else {
    log.error('Invalid choice. Please try again.');
    return askMultipleChoice(question, choices);
  }
};

// Ask for yes/no
const askYesNo = async (question) => {
  const answer = await askQuestion(`${question} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

// Generate component file
const generateComponentFile = (componentName, description, requiresAuth, useLoadingState, props) => {
  const componentPath = path.resolve(process.cwd(), 'src', 'components', 'auth', `${componentName}.tsx`);
  
  // Generate props interface
  let propsInterface = '';
  if (props && props.length > 0) {
    propsInterface = `
interface ${componentName}Props {
${props.map(prop => `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};${prop.description ? ` // ${prop.description}` : ''}`).join('\n')}
}
`;
  } else {
    propsInterface = `
interface ${componentName}Props {
  // Add your props here
}
`;
  }
  
  // Generate imports
  let imports = `import React from 'react';\n`;
  
  if (requiresAuth) {
    imports += `import { useAuth } from '../../hooks/useAuth';\n`;
  }
  
  if (useLoadingState) {
    imports += `import { LoadingSpinner } from '../ui/LoadingSpinner';\n`;
  }
  
  // Generate component content
  const componentContent = `${imports}
/**
 * ${description || `${componentName} component`}
 */
${propsInterface}
export const ${componentName}: React.FC<${componentName}Props> = (${props && props.length > 0 ? '{ ' + props.map(p => p.name).join(', ') + ' }' : 'props'}) => {
${requiresAuth ? `  const { authenticated, user, loading } = useAuth();

  if (loading) {
    return ${useLoadingState ? '<LoadingSpinner />' : '<div>Loading...</div>'};
  }

  if (!authenticated) {
    return <div>Please log in to access this feature.</div>;
  }
` : ''}  return (
    <div>
      {/* ${componentName} implementation */}
      <h2>${componentName}</h2>
      <p>Your component content here</p>
    </div>
  );
};
`;

  // Write to file
  fs.writeFileSync(componentPath, componentContent);
  log.success(`Component file created at: ${componentPath}`);
  
  return componentPath;
};

// Generate test file
const generateTestFile = (componentName, description, requiresAuth, useLoadingState, props) => {
  const testPath = path.resolve(process.cwd(), 'src', 'components', 'auth', `${componentName}.test.tsx`);
  
  // Generate test content
  const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';
${requiresAuth ? `
// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    authenticated: true,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      roles: ['user'],
    },
    loading: false,
  }),
}));
` : ''}
describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} ${props && props.length > 0 ? props.filter(p => p.required).map(p => {
      if (p.type === 'string') return `${p.name}="test-${p.name}"`;
      if (p.type === 'number') return `${p.name}={1}`;
      if (p.type === 'boolean') return `${p.name}={true}`;
      if (p.type.includes('[]')) return `${p.name}={[]}`;
      if (p.type.includes('{')) return `${p.name}={{}}`;
      return `${p.name}={undefined}`;
    }).join(' ') : ''} />);
    
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });
${requiresAuth ? `
  it('shows loading state when authentication is loading', () => {
    // Override the mock to show loading state
    jest.spyOn(require('../../hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      authenticated: false,
      user: null,
      loading: true,
    }));
    
    render(<${componentName} ${props && props.length > 0 ? props.filter(p => p.required).map(p => {
      if (p.type === 'string') return `${p.name}="test-${p.name}"`;
      if (p.type === 'number') return `${p.name}={1}`;
      if (p.type === 'boolean') return `${p.name}={true}`;
      if (p.type.includes('[]')) return `${p.name}={[]}`;
      if (p.type.includes('{')) return `${p.name}={{}}`;
      return `${p.name}={undefined}`;
    }).join(' ') : ''} />);
    
    expect(screen.getByText('${useLoadingState ? 'Loading...' : 'Loading...'}')).toBeInTheDocument();
  });

  it('shows login message when user is not authenticated', () => {
    // Override the mock to show unauthenticated state
    jest.spyOn(require('../../hooks/useAuth'), 'useAuth').mockImplementation(() => ({
      authenticated: false,
      user: null,
      loading: false,
    }));
    
    render(<${componentName} ${props && props.length > 0 ? props.filter(p => p.required).map(p => {
      if (p.type === 'string') return `${p.name}="test-${p.name}"`;
      if (p.type === 'number') return `${p.name}={1}`;
      if (p.type === 'boolean') return `${p.name}={true}`;
      if (p.type.includes('[]')) return `${p.name}={[]}`;
      if (p.type.includes('{')) return `${p.name}={{}}`;
      return `${p.name}={undefined}`;
    }).join(' ') : ''} />);
    
    expect(screen.getByText('Please log in to access this feature.')).toBeInTheDocument();
  });
` : ''}
  // Add more tests as needed
});
`;

  // Write to file
  fs.writeFileSync(testPath, testContent);
  log.success(`Test file created at: ${testPath}`);
  
  return testPath;
};

// Update index.ts file
const updateIndexFile = (componentName) => {
  const indexPath = path.resolve(process.cwd(), 'src', 'components', 'auth', 'index.ts');
  
  // Check if index file exists
  if (!fs.existsSync(indexPath)) {
    // Create new index file
    const indexContent = `// Authentication components
export * from './${componentName}';\n`;
    fs.writeFileSync(indexPath, indexContent);
    log.success(`Created new index file at: ${indexPath}`);
  } else {
    // Update existing index file
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check if component is already exported
    if (!indexContent.includes(`export * from './${componentName}'`)) {
      // Add export for new component
      indexContent += `export * from './${componentName}';\n`;
      fs.writeFileSync(indexPath, indexContent);
      log.success(`Updated index file at: ${indexPath}`);
    } else {
      log.warning(`Component ${componentName} is already exported in index.ts`);
    }
  }
  
  return indexPath;
};

// Main function
async function main() {
  try {
    // Display welcome message
    log.info('Authentication Component Generator');
    log.info('This tool will help you create authentication-related components');
    log.info('with proper typing, testing, and documentation.');
    
    // Get component name from command line arguments or ask for it
    let componentName = process.argv[2];
    if (!componentName) {
      componentName = await askQuestion('Enter component name (PascalCase): ');
    }
    
    // Validate component name
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
      log.error('Component name must be in PascalCase (e.g., LoginButton)');
      process.exit(1);
    }
    
    // Check if component already exists
    const componentPath = path.resolve(process.cwd(), 'src', 'components', 'auth', `${componentName}.tsx`);
    if (fs.existsSync(componentPath)) {
      const overwrite = await askYesNo(`Component ${componentName} already exists. Overwrite?`);
      if (!overwrite) {
        log.info('Operation cancelled');
        process.exit(0);
      }
    }
    
    // Get component description
    const description = await askQuestion('Enter component description: ');
    
    // Ask if component requires authentication
    const requiresAuth = await askYesNo('Does this component require authentication?');
    
    // Ask if component should use loading state
    let useLoadingState = false;
    if (requiresAuth) {
      useLoadingState = await askYesNo('Use LoadingSpinner component for loading state?');
    }
    
    // Ask for props
    const addProps = await askYesNo('Do you want to add props to this component?');
    
    let props = [];
    if (addProps) {
      let addingProps = true;
      
      while (addingProps) {
        const propName = await askQuestion('Enter prop name (camelCase): ');
        
        if (!/^[a-z][a-zA-Z0-9]*$/.test(propName)) {
          log.error('Prop name must be in camelCase (e.g., userId)');
          continue;
        }
        
        const propType = await askMultipleChoice('Select prop type:', [
          'string',
          'number',
          'boolean',
          'string[]',
          'number[]',
          'object',
          'React.ReactNode',
          'custom (enter manually)',
        ]);
        
        let finalPropType = propType;
        if (propType === 'custom (enter manually)') {
          finalPropType = await askQuestion('Enter custom type: ');
        }
        
        const propRequired = await askYesNo('Is this prop required?');
        const propDescription = await askQuestion('Enter prop description (optional): ');
        
        props.push({
          name: propName,
          type: finalPropType,
          required: propRequired,
          description: propDescription,
        });
        
        const addAnother = await askYesNo('Add another prop?');
        if (!addAnother) {
          addingProps = false;
        }
      }
    }
    
    // Generate files
    log.step('Generating component files');
    
    // Create auth directory if it doesn't exist
    const authDir = path.resolve(process.cwd(), 'src', 'components', 'auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
      log.info(`Created directory: ${authDir}`);
    }
    
    // Generate component file
    const componentFilePath = generateComponentFile(componentName, description, requiresAuth, useLoadingState, props);
    
    // Generate test file
    const testFilePath = generateTestFile(componentName, description, requiresAuth, useLoadingState, props);
    
    // Update index.ts file
    const indexFilePath = updateIndexFile(componentName);
    
    // Display summary
    log.step('Summary');
    log.info(`Component Name: ${componentName}`);
    log.info(`Description: ${description || 'None'}`);
    log.info(`Requires Authentication: ${requiresAuth ? 'Yes' : 'No'}`);
    if (requiresAuth) {
      log.info(`Uses Loading Spinner: ${useLoadingState ? 'Yes' : 'No'}`);
    }
    log.info(`Props: ${props.length > 0 ? props.map(p => p.name).join(', ') : 'None'}`);
    log.info(`Files Created:`);
    log.info(`- ${componentFilePath}`);
    log.info(`- ${testFilePath}`);
    log.info(`- ${indexFilePath} (updated)`);
    
    log.success('\nComponent generation completed successfully!');
    log.info('Next steps:');
    log.info('1. Implement the component logic');
    log.info('2. Update the tests as needed');
    log.info('3. Use the component in your application');
    
    // Close readline interface
    rl.close();
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main();
