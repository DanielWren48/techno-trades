import { CustomResponse } from "../config/utils";
import { Request, Response, NextFunction, Router } from "express";
import { utapi } from "../upload";
import { ErrorCode } from "../config/handlers";
import { authMiddleware } from "../middlewares/auth";
import { DeleteFileByKey } from "../schemas/shop";
import { validationMiddleware } from "../middlewares/error";

const mediaRouter = Router();

mediaRouter.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await utapi.listFiles();
        return res.status(201).json(CustomResponse.success('OK', files))
    } catch (error) {
        next(error)
    }
});

mediaRouter.get('/:key', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key } = req.params;
        const file = await utapi.getFileUrls(key);
        return res.status(201).json(CustomResponse.success('OK', file))
    } catch (error) {
        next(error)
    }
});

mediaRouter.delete('/', authMiddleware, validationMiddleware(DeleteFileByKey), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { success } = await utapi.deleteFiles(req.body.fileKeys);
        if (success) {
            return res.status(201).json(CustomResponse.success('OK'))
        } else {
            return res.status(200).json(CustomResponse.error('Error Deleting File', ErrorCode.SERVER_ERROR));
        }
    } catch (error) {
        next(error)
    }
});

export default mediaRouter