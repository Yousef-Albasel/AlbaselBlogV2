const fs = require('fs-extra');
const path = require('path');
const { processMarkdownFiles, processPages } = require('./site-content');

const nunjucks = require('nunjucks');


// Get the theme directory based on config
function getThemeDir(projectDir, themeName) {
    const themesDir = path.join(projectDir, 'themes');
    const themeDir = path.join(themesDir, themeName);
    
    // Fallback to 'layout' directory if theme doesn't exist (backward compatibility)
    if (!fs.existsSync(themeDir)) {
        console.log(`Theme '${themeName}' not found in themes/, using layout/ directory`);
        return path.join(projectDir, 'layout');
    }
    
    return themeDir;
}

async function build(projectDir = '.', options = {}) {
    projectDir = path.resolve(projectDir);
    const { port = 3000 } = options;

    console.log('Starting Build Process...');
    try{
        // Load page config
        const config = await loadConfig(projectDir);
        config.baseURL = config.baseURL || `http://localhost:${port}`;

        console.log('Config loaded successfully');

        // Get theme directory
        const themeName = config.theme || 'default';
        const themeDir = getThemeDir(projectDir, themeName);
        console.log(`Using theme: ${themeName} from ${path.relative(projectDir, themeDir)}`);

        const env = setupTemplating(path.join(themeDir, 'templates'));
        console.log('Templates configured successfully');
        
        const outputDir = path.join(projectDir, 'public');
        await fs.emptyDir(outputDir);
        console.log('Output directory cleaned successfully');
        
        await copyStaticAssets(projectDir, outputDir);
        console.log('Static assets copied successfully');
        
        // Copy theme CSS files
        await copyThemeAssets(themeDir, outputDir);
        console.log('Theme assets copied successfully');
        
        // Process both flat posts and series
        const { posts, series } = await processMarkdownFiles(projectDir);
        console.log(`Processed ${posts.length} posts and ${series.length} series successfully`);
        
        // Process standalone pages (about, etc.)
        const pages = await processPages(projectDir);
        console.log(`Processed ${pages.length} pages successfully`);
        
        await generatePostPages(posts, env, config, outputDir);
        console.log('Post pages generated successfully');
        
        await generatePageFiles(pages, env, config, outputDir);
        console.log('Static pages generated successfully');
        
        // Generate series pages
        await generateSeriesPages(series, env, config, outputDir);
        console.log('Series pages generated successfully');
        
        await generateHomePage(posts, series, env, config, outputDir);
        console.log('Home page generated successfully');
        
        // Generate posts listing page
        await generatePostsListingPage(posts, series, env, config, outputDir);
        console.log('Posts listing page generated successfully');
        
        await generateAboutMePage(env, config, outputDir);
        
        // Generate category pages
        await generateCategoryPages(posts, env, config, outputDir);
        console.log('Category pages generated successfully');

        // Generate categories index page
        await generateCategoriesIndexPage(posts, env, config, outputDir);
        console.log('Categories index page generated successfully');
        
        console.log('Build completed successfully!');
    }
    catch (error) {
        throw error;
    }
};

async function loadConfig(projectDir) {
    const configPath = path.join(projectDir, 'config.json');

    if (await fs.pathExists(configPath)) {
        return await fs.readJSON(configPath);
    } else {
        const default_config = {
            name: 'My Site',
            description: 'Welcome to my site',
            email: 'hello@example.com',
            avatar: '/images/avatar.jpg',
            theme: 'minimal'
        };

        await fs.writeFile(configPath, JSON.stringify(default_config, null, 2));
        return default_config;
    }
}

function setupTemplating(templateDir){
    const env = nunjucks.configure(templateDir,{
        autoescape : true,
        throwOnUndefined : false
    });
    return env;
};

async function copyStaticAssets(projectDir,outputDir){
    const staticDir = path.join(projectDir,'static');
    if (await fs.pathExists(staticDir)){
        await fs.copy(staticDir,outputDir);
    }
}

// New function to copy theme assets (CSS, JS, etc.)
async function copyThemeAssets(themeDir, outputDir) {
    const themeStaticDir = path.join(themeDir, 'static');
    
    if (await fs.pathExists(themeStaticDir)) {
        // Copy the entire static directory from theme
        await fs.copy(themeStaticDir, outputDir, {
            overwrite: true,
            errorOnExist: false
        });
        console.log('Theme static assets copied from theme/static/');
    } else {
        console.log('No static directory found in theme, skipping theme assets');
    }
}

async function generatePostPages(posts, env, config, outputDir) {
    const shaderCanvasEnabled = config.features?.shaderCanvas !== false;
    for (const post of posts) {
        const templateName = `${post.layout}.html`;
        
        try {
            // Create subdirectory if post is part of a series
            if (post.series) {
                await fs.ensureDir(path.join(outputDir, post.series));
            }
            
            // Render the post using its specified layout
            const html = env.render(templateName, {
                ...post,
                hasShaders: shaderCanvasEnabled && post.hasShaders,
                site: config
            });
            
            const outputPath = post.series 
                ? path.join(outputDir, `${post.series}`, `${path.basename(post.slug)}.html`)
                : path.join(outputDir, `${post.slug}.html`);
            
            await fs.outputFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating page for ${post.slug}:`, error.message);
            throw error;
        }
    }
}

async function generateSeriesPages(series, env, config, outputDir) {
    for (const seriesItem of series) {
        const templateName = `${seriesItem.layout}.html`;
        
        try {
            // Create series directory
            const seriesDir = path.join(outputDir, seriesItem.slug);
            await fs.ensureDir(seriesDir);
            
            // Render the series index page
            const html = env.render(templateName, {
                ...seriesItem,
                site: config
            });
            
            const outputPath = path.join(seriesDir, 'index.html');
            await fs.outputFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating series page for ${seriesItem.slug}:`, error.message);
            throw error;
        }
    }
}

async function generatePageFiles(pages, env, config, outputDir) {
    const shaderCanvasEnabled = config.features?.shaderCanvas !== false;
    for (const page of pages) {
        const templateName = `${page.layout}.html`;
        
        try {
            const html = env.render(templateName, {
                ...page,
                hasShaders: shaderCanvasEnabled && page.hasShaders,
                site: config
            });
            
            const outputPath = path.join(outputDir, `${page.slug}.html`);
            await fs.outputFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating page for ${page.slug}:`, error.message);
            throw error;
        }
    }
}

async function generateHomePage(posts, series, env, config, outputDir) {
    try {
        const latestPosts = posts.slice(0, 6);
        const quickLinks = Object.entries(config.links || {}).map(([label, obj]) => ({
            label,
            href: obj.href,
            icon: obj.icon || null
        }));
        
        const html = env.render('index.html', {
            site: config,
            posts: posts,
            series: series,
            latestPosts: latestPosts,
            links: quickLinks
        });

        const outputPath = path.join(outputDir, 'index.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating home page:', error.message);
        throw error;
    }
}

async function generatePostsListingPage(posts, series, env, config, outputDir) {
    try {
        const html = env.render('posts.html', {
            site: config,
            posts: posts,
            series: series,
            title: 'All Posts'
        });
        
        const outputPath = path.join(outputDir, 'posts.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating posts listing page:', error.message);
        throw error;
    }
}

async function generateAboutMePage(env, siteConfig, outputDir) {
    const html = env.render('aboutme.html', { site: siteConfig });
    await fs.outputFile(path.join(outputDir, 'aboutme.html'), html);
}

async function generateCategoryPages(posts, env, config, outputDir) {
    // Group posts by category
    const postsByCategory = Object.create(null);
    
    posts.forEach(post => {
        if (post.category) {
            if (!postsByCategory[post.category]) {
                postsByCategory[post.category] = [];
            }
            postsByCategory[post.category].push(post);
        }
    });
    
    // Create category directory
    const categoryDir = path.join(outputDir, 'categories');
    await fs.ensureDir(categoryDir);
    
    // Generate individual category pages
    for (const [category, categoryPosts] of Object.entries(postsByCategory)) {
        try {
            const html = env.render('category.html', {
                site: config,
                posts: categoryPosts,
                category: category,
                title: `Posts in ${category}`
            });
            
            const outputPath = path.join(categoryDir, `${category.toLowerCase().replace(/\s+/g, '-')}.html`);
            await fs.outputFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating category page for ${category}:`, error.message);
            throw error;
        }
    }
}

async function generateCategoriesIndexPage(posts, env, config, outputDir) {
    // Group posts by category and count them
    const categories = Object.create(null);
    
    posts.forEach(post => {
        if (post.category) {
            if (!categories[post.category]) {
                categories[post.category] = {
                    name: post.category,
                    count: 0,
                    posts: [],
                    slug: post.category.toLowerCase().replace(/\s+/g, '-')
                };
            }
            categories[post.category].count++;
            categories[post.category].posts.push(post);
        }
    });
    
    try {
        const html = env.render('categories.html', {
            site: config,
            categories: Object.values(categories),
            title: 'Categories'
        });
        
        const outputPath = path.join(outputDir, 'categories.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating categories index page:', error.message);
        throw error;
    }
}

module.exports = build;
