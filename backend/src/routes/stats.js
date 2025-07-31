const express = require('express');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;

// reset cache if file is modified
fs.watchFile(DATA_PATH, () => {
  console.log('stats cache data changed. Invalidating cache.');
  cachedStats = null;
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // serve cached version if it is available
    if (cachedStats) {
      return res.json(cachedStats);
    }

    // else, read file and compute stats
    const raw = await fsPromises.readFile(DATA_PATH, 'utf-8');
    const items = JSON.parse(raw);

    const total = items.length;
    const averagePrice =
      total > 0
        ? items.reduce((acc, cur) => acc + cur.price, 0) / total
        : 0;

    cachedStats = { total, averagePrice };

    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;