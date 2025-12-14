const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const xssFilterOutput = (req, res, next) => {
  const json = res.json;
  res.json = function (data) {
    const clean = obj => {
      if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      }
      if (Array.isArray(obj)) return obj.map(clean);
      if (obj && typeof obj === 'object') {
        for (const k in obj) obj[k] = clean(obj[k]);
      }
      return obj;
    };
    json.call(this, clean(data));
  };
  next();
};

const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const ct = req.headers['content-type'];
    if (!ct || !ct.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Непідтримуваний Content-Type'
      });
    }
  }
  next();
};

module.exports = { xssFilterOutput, validateContentType };
