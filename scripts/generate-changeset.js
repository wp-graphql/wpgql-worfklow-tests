const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateSinceTagsMetadata } = require('./scan-since-tags');

/**
 * Parse PR title for type and breaking changes
 */
function parseTitle(title) {
    const typeMatch = title.match(/^(feat|fix|build|chore|ci|docs|perf|refactor|revert|style|test)(?:\([^)]+\))?(!)?:/);
    if (!typeMatch) {
        throw new Error('PR title does not follow conventional commit format');
    }

    return {
        type: typeMatch[1],
        isBreaking: typeMatch[2] === '!'
    };
}

/**
 * Extract sections from PR body
 */
function parsePRBody(body) {
    return {
        breaking: body.match(/### Breaking Changes\s+([\s\S]*?)(?=###|$)/)?.[1]?.trim() || '',
        upgrade: body.match(/### Upgrade Instructions\s+([\s\S]*?)(?=###|$)/)?.[1]?.trim() || '',
        description: body.match(/What does this implement\/fix\? Explain your changes\.\s*-+\s*([\s\S]*?)(?=###|$)/)?.[1]?.trim() || ''
    };
}

/**
 * Create changeset using @changesets/cli
 */
async function createChangeset({ title, body, prNumber }) {
    const { type, isBreaking } = parseTitle(title);
    const sections = parsePRBody(body);
    const sinceMetadata = await generateSinceTagsMetadata();

    // Determine bump type
    const bumpType = isBreaking ? 'major' : (type === 'feat' ? 'minor' : 'patch');

    // Use changesets to create the changeset
    const { createChangeset } = require('@changesets/cli');

    const result = await createChangeset({
        summary: sections.description,
        releases: [{ name: '@wp-graphql/wp-graphql', type: bumpType }],
        major: isBreaking,
        links: prNumber ? [`[PR #${prNumber}](${process.env.PR_URL})`] : [],
        breakingChanges: sections.breaking,
        upgradeInstructions: sections.upgrade,
        sinceFiles: sinceMetadata.sinceFiles,
        totalSinceTags: sinceMetadata.totalTags
    });

    return {
        type: bumpType,
        breaking: Boolean(isBreaking || sections.breaking),
        pr: Number(prNumber) || undefined,
        sinceFiles: sinceMetadata.sinceFiles,
        totalSinceTags: sinceMetadata.totalTags,
        ...result
    };
}

// When run directly from command line
if (require.main === module) {
    const title = process.env.PR_TITLE;
    const body = process.env.PR_BODY;
    const prNumber = process.env.PR_NUMBER;

    if (!title || !body || !prNumber) {
        console.error('Missing required environment variables');
        process.exit(1);
    }

    createChangeset({ title, body, prNumber })
        .catch(error => {
            console.error('Error creating changeset:', error);
            process.exit(1);
        });
}

module.exports = {
    parseTitle,
    parsePRBody,
    createChangeset
};