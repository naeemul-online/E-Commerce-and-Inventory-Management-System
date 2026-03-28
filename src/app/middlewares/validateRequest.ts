import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      /**
       * FIX: Only assign to 'body'.
       * 'query' and 'params' are often read-only getters in Express.
       * If you need the validated query/params, access them from 'parsed'.
       */
      req.body = parsed.body;

      // If you absolutely MUST override query/params for downstream middleware:
      Object.assign(req.params, parsed.params);
      Object.assign(req.query, parsed.query);

      return next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
