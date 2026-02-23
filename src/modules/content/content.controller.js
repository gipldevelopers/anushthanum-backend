const contentService = require('./content.service');

async function getPage(req, res) {
    const { key } = req.params;
    const page = await contentService.getPageByKey(key);
    if (!page) {
        return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, page });
}

async function upsertPage(req, res) {
    const { key } = req.params;
    const { title, content, status } = req.body;
    const page = await contentService.upsertPage(key, { title, content, status });
    res.json({ success: true, page });
}

module.exports = { getPage, upsertPage };
