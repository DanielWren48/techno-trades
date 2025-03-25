import { Request } from "express";
import { Document, Model } from "mongoose";

interface PaginationResponse<T> {
    items?: T[];
    page: number;
    itemsCount: number;
    totalPages: number;
    itemsPerPage: number;
}

const paginateModel = async <T extends Document>(req: Request, modelClass: Model<T>, filter: Record<string, any> = {}, populateData: any, sortData: Record<string, any> = { createdAt: -1 }): Promise<PaginationResponse<T>> => {
    // paginate data from the model
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 100; // Default to 100 items per page

    const skip = (page - 1) * limit;

    // Get total count of items
    const itemsCount = await modelClass.countDocuments(filter);

    // Get paginated items
    const items = await modelClass.find(filter).populate(populateData).skip(skip).limit(limit).sort(sortData);
    const totalPages = Math.ceil(itemsCount / limit)
    return { items, page, itemsCount, totalPages, itemsPerPage: limit }
}

const paginateRecords = async <T extends Document>(req: Request, records: any[]): Promise<PaginationResponse<T>> => {
    // Paginate records
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 100; // Default to 100 items per page

    const skip = (page - 1) * limit;

    // Get total count of items
    const itemsCount = records.length;

    // Get paginated items
    const paginatedItems = records.slice(skip, skip + limit);
    const totalPages = Math.ceil(itemsCount / limit)
    return { items: paginatedItems, page, itemsCount, totalPages, itemsPerPage: limit }
}

export { paginateModel, paginateRecords }