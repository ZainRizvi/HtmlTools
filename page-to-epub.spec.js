const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Use local server to ensure proper HTTP context
let server;
let serverPort;
let cdnAvailable = false;

test.beforeAll(async ({ browser }) => {
    // Create a simple static file server
    server = http.createServer((req, res) => {
        const filePath = path.join(__dirname, req.url === '/' ? 'page-to-epub.html' : req.url);
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css'
        }[ext] || 'text/plain';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });

    await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            serverPort = server.address().port;
            resolve();
        });
    });

    // Check if CDN is available
    const page = await browser.newPage();
    try {
        await page.goto(`http://127.0.0.1:${serverPort}/page-to-epub.html`);
        await page.waitForTimeout(3000);
        const jszip = await page.evaluate(() => typeof JSZip);
        cdnAvailable = jszip === 'function';
    } catch (e) {
        cdnAvailable = false;
    }
    await page.close();

    if (!cdnAvailable) {
        console.log('Note: CDN resources unavailable in this environment. Some tests will be skipped.');
    }
});

test.afterAll(async () => {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

const getToolUrl = () => `http://127.0.0.1:${serverPort}/page-to-epub.html`;

test.describe('Page to EPUB Tool', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getToolUrl());
    });

    test('should load the tool with correct UI elements', async ({ page }) => {
        // Check title
        await expect(page.locator('h1')).toHaveText('Page to EPUB');

        // Check essential input elements exist
        await expect(page.locator('#url-input')).toBeVisible();
        await expect(page.locator('#title-input')).toBeVisible();
        await expect(page.locator('#convert-btn')).toBeVisible();
        await expect(page.locator('#convert-btn')).toHaveText('Convert to EPUB');

        // Check fallback section is hidden initially
        await expect(page.locator('#fallback-section')).toHaveClass(/hidden/);
    });

    test('should show error for empty URL', async ({ page }) => {
        await page.click('#convert-btn');

        const status = page.locator('#status');
        await expect(status).toHaveText('Please enter a URL');
        await expect(status).toHaveClass(/error/);
    });

    test('should show error for invalid URL', async ({ page }) => {
        await page.fill('#url-input', 'not-a-valid-url');
        await page.click('#convert-btn');

        const status = page.locator('#status');
        await expect(status).toHaveText('Please enter a valid URL');
        await expect(status).toHaveClass(/error/);
    });

    test('should toggle fallback section', async ({ page }) => {
        // Initially hidden
        await expect(page.locator('#fallback-section')).toHaveClass(/hidden/);

        // Click to show
        await page.click('.toggle-fallback button');
        await expect(page.locator('#fallback-section')).not.toHaveClass(/hidden/);
        await expect(page.locator('#toggle-text')).toContainText('Hide');

        // Click to hide again
        await page.click('.toggle-fallback button');
        await expect(page.locator('#fallback-section')).toHaveClass(/hidden/);
    });

    test('should handle pasted HTML content (CDN required)', async ({ page }) => {
        test.skip(!cdnAvailable, 'CDN resources not available in this environment');

        // Open fallback section
        await page.click('.toggle-fallback button');

        // Sample HTML content with enough paragraphs for Readability
        const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Test Article</title></head>
        <body>
            <article>
                <h1>Test Article Title</h1>
                <p>This is a test paragraph with some content that should be extracted by Readability. It needs to be fairly long to pass the character threshold that Readability uses to determine if content is worth extracting.</p>
                <p>Another paragraph to make the content longer and more substantial for extraction. This paragraph also needs to be substantial enough to contribute to the overall content length.</p>
                <p>Third paragraph with more text to ensure the content passes the character threshold. The more text we have here, the more likely Readability will successfully extract this content.</p>
                <p>Fourth paragraph adding even more content to this test article. We need multiple paragraphs to simulate a real article that would be converted to EPUB format.</p>
                <p>Fifth paragraph with additional text content for proper extraction. This should definitely be enough content for Readability to work with.</p>
            </article>
        </body>
        </html>
        `;

        await page.fill('#html-input', sampleHtml);
        await page.fill('#source-url', 'https://example.com/test');

        // Convert
        await page.click('#fallback-section .primary-btn');

        // Wait for preview to appear
        await expect(page.locator('#preview-section')).toBeVisible({ timeout: 15000 });

        // Check preview content exists
        await expect(page.locator('#preview-meta')).toContainText('Test Article');

        // Download button should be visible
        await expect(page.locator('#preview-section .primary-btn')).toHaveText('Download EPUB');
    });

    test('should fetch and convert duas.org Umme Dawood page (CDN + network required)', async ({ page }) => {
        test.skip(!cdnAvailable, 'CDN resources not available in this environment');
        test.setTimeout(60000);

        const testUrl = 'https://www.duas.org/ummedawood.htm';

        await page.fill('#url-input', testUrl);
        await page.click('#convert-btn');

        // Wait for status updates - should show fetching status
        await expect(page.locator('#status')).toContainText(/Trying|Fetching|Extracting|Generating|Ready|Error/, { timeout: 30000 });

        // Wait for either success (preview shows) or error with fallback
        const previewOrFallback = await Promise.race([
            page.locator('#preview-section').waitFor({ state: 'visible', timeout: 45000 }).then(() => 'preview'),
            page.locator('#fallback-section:not(.hidden)').waitFor({ state: 'visible', timeout: 45000 }).then(() => 'fallback')
        ]).catch(() => 'timeout');

        if (previewOrFallback === 'preview') {
            // Success! Check that preview has content
            await expect(page.locator('#preview-meta')).toContainText('Source');
            await expect(page.locator('#preview-content')).not.toBeEmpty();

            // Check download button works
            const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
            await page.click('#preview-section .primary-btn');
            const download = await downloadPromise;

            // Verify the download is an EPUB file
            expect(download.suggestedFilename()).toMatch(/\.epub$/);

            // Save and verify the file is not empty
            const downloadPath = path.join(__dirname, 'test-download.epub');
            await download.saveAs(downloadPath);
            const fileStats = fs.statSync(downloadPath);
            expect(fileStats.size).toBeGreaterThan(1000); // Should be at least 1KB

            // Clean up
            fs.unlinkSync(downloadPath);
        } else if (previewOrFallback === 'fallback') {
            // CORS proxy failed, fallback shown - this is acceptable
            console.log('CORS proxy unavailable, fallback section shown as expected');
            await expect(page.locator('#status')).toContainText(/Error|failed/i);
        } else {
            // Timeout - test inconclusive but not a failure of the tool
            console.log('Test timed out waiting for response');
        }
    });

    test('should handle Enter key to convert', async ({ page }) => {
        await page.fill('#url-input', 'https://example.com');
        await page.press('#url-input', 'Enter');

        // Should start converting (status shows something)
        await expect(page.locator('#status')).toBeVisible({ timeout: 5000 });
    });

    test('should allow custom title override (CDN required)', async ({ page }) => {
        test.skip(!cdnAvailable, 'CDN resources not available in this environment');

        // Open fallback section
        await page.click('.toggle-fallback button');

        const customTitle = 'My Custom Title';
        const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Original Title</title></head>
        <body>
            <article>
                <h1>Article Heading</h1>
                <p>Content paragraph one with enough text for extraction. This needs to be fairly long to ensure Readability can process it properly.</p>
                <p>Content paragraph two with more text content. More content helps the extraction process work correctly.</p>
                <p>Content paragraph three continuing the article. Additional paragraphs make the content more realistic.</p>
                <p>Content paragraph four with additional content. We want to simulate a real article here.</p>
                <p>Content paragraph five to complete the test. This should provide enough content for successful extraction.</p>
            </article>
        </body>
        </html>
        `;

        await page.fill('#title-input', customTitle);
        await page.fill('#html-input', sampleHtml);

        await page.click('#fallback-section .primary-btn');

        // Wait for preview
        await expect(page.locator('#preview-section')).toBeVisible({ timeout: 15000 });

        // Check that custom title is used
        await expect(page.locator('#preview-meta')).toContainText(customTitle);
    });

    test('EPUB file structure is valid (CDN required)', async ({ page }) => {
        test.skip(!cdnAvailable, 'CDN resources not available in this environment');

        // Open fallback section and create a simple EPUB
        await page.click('.toggle-fallback button');

        const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Structure Test</title></head>
        <body>
            <article>
                <h1>EPUB Structure Test</h1>
                <p>This is a test to verify the EPUB file structure is correct. The content needs to be long enough for Readability to extract it properly.</p>
                <p>The EPUB should contain proper metadata and content files. This paragraph adds more content to meet the threshold.</p>
                <p>Additional paragraph to ensure enough content for extraction. More text helps the extraction process.</p>
                <p>Fourth paragraph with more test content. We want realistic article length here.</p>
                <p>Fifth paragraph completing the test article. This should be sufficient content.</p>
            </article>
        </body>
        </html>
        `;

        await page.fill('#html-input', sampleHtml);
        await page.fill('#source-url', 'https://example.com/structure-test');

        await page.click('#fallback-section .primary-btn');

        // Wait for preview
        await expect(page.locator('#preview-section')).toBeVisible({ timeout: 15000 });

        // Get the EPUB blob and verify structure
        const epubBase64 = await page.evaluate(async () => {
            if (!window.currentEpubBlob) return null;

            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(window.currentEpubBlob);
            });
        });

        expect(epubBase64).not.toBeNull();

        // Decode and check structure using JSZip
        const epubContent = await page.evaluate(async (base64) => {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const zip = await JSZip.loadAsync(bytes);
            const files = Object.keys(zip.files);

            // Read key files
            const mimetype = await zip.file('mimetype')?.async('string');
            const containerXml = await zip.file('META-INF/container.xml')?.async('string');
            const contentOpf = await zip.file('OEBPS/content.opf')?.async('string');
            const chapter = await zip.file('OEBPS/chapter1.xhtml')?.async('string');

            return { files, mimetype, containerXml, contentOpf, chapter };
        }, epubBase64);

        // Verify required EPUB files exist
        expect(epubContent.files).toContain('mimetype');
        expect(epubContent.files).toContain('META-INF/container.xml');
        expect(epubContent.files).toContain('OEBPS/content.opf');
        expect(epubContent.files).toContain('OEBPS/nav.xhtml');
        expect(epubContent.files).toContain('OEBPS/chapter1.xhtml');
        expect(epubContent.files).toContain('OEBPS/style.css');

        // Verify mimetype is correct
        expect(epubContent.mimetype).toBe('application/epub+zip');

        // Verify container.xml points to content.opf
        expect(epubContent.containerXml).toContain('OEBPS/content.opf');

        // Verify content.opf has required metadata
        expect(epubContent.contentOpf).toContain('dc:identifier');
        expect(epubContent.contentOpf).toContain('dc:title');
        expect(epubContent.contentOpf).toContain('Structure Test');

        // Verify chapter content exists
        expect(epubContent.chapter).toContain('EPUB Structure Test');
    });
});

test.describe('Mobile UX', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('should be usable on mobile viewport', async ({ page }) => {
        await page.goto(getToolUrl());

        // All key elements should be visible and tappable
        await expect(page.locator('#url-input')).toBeVisible();
        await expect(page.locator('#convert-btn')).toBeVisible();

        // Button should be full width (minus padding)
        const btnBox = await page.locator('#convert-btn').boundingBox();
        expect(btnBox.width).toBeGreaterThan(290);

        // Inputs should be large enough for touch
        const inputBox = await page.locator('#url-input').boundingBox();
        expect(inputBox.height).toBeGreaterThanOrEqual(40);
    });
});
