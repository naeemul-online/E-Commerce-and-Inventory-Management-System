import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

type ParsedRequestData = {
  body?: Request["body"];
  query?: Request["query"];
  params?: Request["params"];
  files?: Request["files"];
  file?: Request["file"];
};

const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        files: req.files,
        file: req.file,
      })) as ParsedRequestData;

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
