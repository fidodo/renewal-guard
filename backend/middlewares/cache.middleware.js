import NodeCache from "node-cache";

const myCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: true,
});

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== "GET") return next();

    const key = `cache:${req.user._id}:${req.method}:${req.path}`;
    const cachedResponse = myCache.get(key);

    if (cachedResponse) {
      console.log("✅ Cache HIT");
      return res.json({ ...cachedResponse, _cache: { hit: true } });
    }

    const originalJson = res.json;
    res.json = function (body) {
      const cacheableBody = JSON.parse(JSON.stringify(body));
      myCache.set(key, cacheableBody, duration);
      console.log(`💾 Cached for ${duration}s`);
      const response = {
        ...body,
        _cache: { hit: false, duration },
      };
      return originalJson.call(this, response);
    };

    next();
  };
};

export default cacheMiddleware;
