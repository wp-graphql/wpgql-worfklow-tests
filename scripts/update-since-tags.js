const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Find files containing @since todo tags
 */
async function findSinceTodoFiles(pattern = 'src/**/*.php') {
    const files = await glob(pattern, { ignore: 'node_modules/**' });
    return Array.isArray(files) ? files : [];
}

/**
 * Get all @since todo tags from a file
 */
function getSinceTodoTags(content) {
    const regex = /@since\s+todo/g;
    const matches = content.match(regex);
    return matches ? matches.length : 0;
}

/**
 * Update @since todo tags in a file
 */
function updateSinceTags(filePath, version) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Replace @since todo with @since {version}
        content = content.replace(/@since\s+todo/g, `@since ${version}`);

        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            return true;
        }

        return false;
    } catch (error) {
        throw new Error(`Error updating ${filePath}: ${error.message}`);
    }
}

/**
 * Update all @since todo tags in the project
 */
async function updateAllSinceTags(version, pattern = 'src/**/*.php') {
    const results = {
        updated: [],
        errors: []
    };

    try {
        const files = await findSinceTodoFiles(pattern);

        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (getSinceTodoTags(content) > 0) {
                    const updated = updateSinceTags(file, version);
                    if (updated) {
                        results.updated.push(file);
                    }
                }
            } catch (error) {
                results.errors.push({ file, error: error.message });
            }
        }

        return results;
    } catch (error) {
        throw new Error(`Error updating @since tags: ${error.message}`);
    }
}

/**
 * CLI command to update @since tags
 */
async function main() {
    const { default: chalk } = await import('chalk');

    try {
        const version = process.argv[2];
        if (!version) {
            throw new Error('Version argument is required');
        }

        console.log(chalk.blue('\nUpdating @since todo tags...'));
        const results = await updateAllSinceTags(version);

        if (results.updated.length > 0) {
            console.log(chalk.green('\n✓ Updated files:'));
            results.updated.forEach(file => {
                console.log(chalk.gray(`  - ${path.relative(process.cwd(), file)}`));
            });
        } else {
            console.log(chalk.yellow('\nNo @since todo tags found'));
        }

        if (results.errors.length > 0) {
            console.log(chalk.red('\n❌ Errors:'));
            results.errors.forEach(({ file, error }) => {
                console.log(chalk.gray(`  - ${path.relative(process.cwd(), file)}: ${error}`));
            });
            process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    findSinceTodoFiles,
    getSinceTodoTags,
    updateSinceTags,
    updateAllSinceTags
};