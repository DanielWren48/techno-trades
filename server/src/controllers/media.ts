import { CustomResponse } from "../config/utils";
import { Request, Response, NextFunction, Router } from "express";
import { utapi } from "../upload";

const mediaRouter = Router();

mediaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await utapi.listFiles();
        return res.status(201).json(CustomResponse.success('OK', files))
    } catch (error) {
        next(error)
    }
});

mediaRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key } = req.params;
        const file = await utapi.getFileUrls(key);
        return res.status(201).json(CustomResponse.success('OK', file))
    } catch (error) {
        next(error)
    }
});

mediaRouter.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { success } = await utapi.deleteFiles(req.body.fileKeys);
        return res.status(200).json(CustomResponse.success(
            success ? 'File Successfully Deleted' : 'Error Deleting File',
        ));
    } catch (error) {
        next(error)
    }
});

export default mediaRouter